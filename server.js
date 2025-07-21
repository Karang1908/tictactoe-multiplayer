const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = {};
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    if (Object.keys(players).length < 2) {
        players[socket.id] = Object.keys(players).length === 0 ? 'X' : 'O';
        socket.emit('playerAssignment', players[socket.id]);
        
        if (Object.keys(players).length === 2) {
            io.emit('gameState', { board, currentPlayer, gameActive });
        }
    } else {
        socket.emit('spectator');
    }

    socket.on('makeMove', (index) => {
        if (gameActive && board[index] === '' && players[socket.id] === currentPlayer) {
            board[index] = currentPlayer;
            
            if (checkWin(currentPlayer)) {
                gameActive = false;
                io.emit('gameOver', { winner: currentPlayer });
            } else if (board.every(cell => cell !== '')) {
                gameActive = false;
                io.emit('gameOver', { winner: 'T' }); // T for Tie
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                io.emit('gameState', { board, currentPlayer, gameActive });
            }
        }
    });

    socket.on('restartGame', () => {
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        io.emit('gameState', { board, currentPlayer, gameActive });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete players[socket.id];
        if (Object.keys(players).length < 2) {
            // Reset game if a player leaves
            board = ['', '', '', '', '', '', '', '', ''];
            gameActive = false;
            currentPlayer = 'X';
            io.emit('playerLeft');
        }
    });
});

function checkWin(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    return winPatterns.some(pattern => {
        return pattern.every(index => board[index] === player);
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 