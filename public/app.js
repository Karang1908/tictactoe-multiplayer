const socket = io('https://tic-tac-toe-final-nl52.onrender.com');

const board = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const cells = document.querySelectorAll('.cell');

let playerSymbol = null;
let isMyTurn = false;

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (isMyTurn && cell.textContent === '') {
            socket.emit('makeMove', cell.dataset.index);
        }
    });
});

restartBtn.addEventListener('click', () => {
    socket.emit('restartGame');
});

socket.on('playerAssignment', (symbol) => {
    playerSymbol = symbol;
    statusEl.textContent = `You are Player ${playerSymbol}. Waiting for another player...`;
});

socket.on('spectator', () => {
    statusEl.textContent = "You are a spectator.";
});

socket.on('gameState', ({ board: boardState, currentPlayer, gameActive }) => {
    updateBoard(boardState);
    if (gameActive) {
        isMyTurn = currentPlayer === playerSymbol;
        statusEl.textContent = isMyTurn ? "Your turn" : `Player ${currentPlayer}'s turn`;
    }
    restartBtn.style.display = gameActive ? 'none' : 'block';
});

socket.on('gameOver', ({ winner }) => {
    isMyTurn = false;
    if (winner === 'T') {
        statusEl.textContent = "It's a tie!";
    } else {
        statusEl.textContent = `Player ${winner} wins!`;
    }
    restartBtn.style.display = 'block';
});

socket.on('playerLeft', () => {
    statusEl.textContent = 'The other player left. Game over.';
    isMyTurn = false;
    restartBtn.style.display = 'block';
});

function updateBoard(boardState) {
    cells.forEach((cell, index) => {
        cell.textContent = boardState[index];
        cell.classList.remove('X', 'O');
        if (boardState[index] !== '') {
            cell.classList.add(boardState[index]);
        }
    });
} 
