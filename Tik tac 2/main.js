// Game state variables
let board = ['', '', '', '', '', '', '', '', '']; // 3x3 game board
let currentPlayer = 'X'; // Current player ('X' or 'O')
let gameActive = true; // Is the game ongoing
let aiMode = false; // Is AI opponent enabled

// Winning combinations (indices of the board)
const winningConditions = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal
    [2, 4, 6], // Diagonal
];

// Handle player move on cell click
function makeMove(index) {
    if (board[index] !== '' || !gameActive) {
        return; // Invalid move
    }

    board[index] = currentPlayer; // Update board state
    document.getElementById(`cell-${index}`).textContent = currentPlayer; // Update UI

    checkForWinner(); // Check for win or draw

    // Trigger AI move if AI mode is on and it's AI's turn
    if (aiMode && gameActive && currentPlayer === 'O') {
        setTimeout(aiMove, 500); // Delay for better UX
    }
}

function checkForWinner() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === '' || board[b] === '' || board[c] === '') {
            continue;
        }

        if (board[a] === board[b] && board[b] === board[c]) {
            roundWon = true;
            highlightWinningCells(a, b, c);
            break;
        }
    }

    if (roundWon) {
        document.getElementById('status').textContent = aiMode && currentPlayer === 'O' ? 'AI Wins! 🎉' : `Player ${currentPlayer} Wins! 🎉`;
        gameActive = false;
        return;
    }

    if (!board.includes('')) {
        document.getElementById('status').textContent = 'It\'s a Draw! 🤝';
        gameActive = false;
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Toggle between X and O
    document.getElementById('status').textContent = aiMode && currentPlayer === 'O' ? "AI's Turn" : `Player ${currentPlayer}'s Turn`;
}

function highlightWinningCells(a, b, c) {
    document.getElementById(`cell-${a}`).classList.add('winning');
    document.getElementById(`cell-${b}`).classList.add('winning');
    document.getElementById(`cell-${c}`).classList.add('winning');
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    document.getElementById('status').textContent = 'Player X\'s Turn';
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning');
    });
}

// Toggle AI opponent mode
function toggleAI() {
    aiMode = !aiMode;
    document.getElementById('aiButton').textContent = aiMode ? 'VS Human' : 'VS Bot';
    resetGame(); // Reset game when switching modes
}

// AI makes its move
function aiMove() {
    let bestMove = getBestMove();
    makeMove(bestMove);
}

// Find the best move for AI using minimax
function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O'; // Simulate AI move
            let score = minimax(board, 0, false);
            board[i] = ''; // Undo simulation
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    let result = checkWinner();
    if (result !== null) {
        return result === 'O' ? 10 - depth : result === 'X' ? depth - 10 : 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (board.includes('')) return null;
    return 'tie';
}