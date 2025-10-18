import React, { useState, useEffect } from 'react';
import './App.css';

// Tabuleiro inicial: 9 posições vazias
const initialBoard = Array(9).fill(null);

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [level, setLevel] = useState('bispo'); 
  const [botMessage, setBotMessage] = useState('Olá! Escolha o nível e vamos jogar!');
  const [diarioNumber, setDiarioNumber] = useState(null); // ✅ Número do diário

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        botMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, level]);

  useEffect(() => {
    if (level === 'santo' && board.every(cell => cell === null)) {
      setBotMessage('Eu começo, jovem. Que o Espírito Santo esteja contigo!');
      setIsPlayerTurn(false);
    }
  }, [level]);

  const botMove = () => {
    const newBoard = board.slice();
    let bestMove;

    if (level === 'bispo') {
      bestMove = getSafeMove(newBoard);
      setBotMessage(randomMessage('bispo'));
    } else if (level === 'papa') {
      if (Math.random() < 0.5) {
        bestMove = getBestMove(newBoard);
        setBotMessage(randomMessage('papaSmart'));
      } else {
        const emptyCells = board.map((c,i) => c===null?i:null).filter(i=>i!==null);
        bestMove = emptyCells[Math.floor(Math.random()*emptyCells.length)];
        setBotMessage(randomMessage('papa'));
      }
    } else {
      bestMove = getBestMove(newBoard);
      setBotMessage(randomMessage('santo'));
    }

    newBoard[bestMove] = 'X';
    setBoard(newBoard);
    checkWinner(newBoard);
    setIsPlayerTurn(true);
  };

  const handleClick = (index) => {
    if (board[index] || !isPlayerTurn || winner) return;
    const newBoard = board.slice();
    newBoard[index] = 'O';
    setBoard(newBoard);
    checkWinner(newBoard);
    setIsPlayerTurn(false);
  };

  const checkWinner = (b) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    for (let [a,bIndex,c] of lines) {
      if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
        const msg = b[a] === 'O' ? 'Você ganhou!' : 'São João Paulo II ganhou!';
        setWinner(msg);
        setBotMessage(b[a] === 'X' ? 'Haha, sabia que venceria!' : 'Não desanime, jovem!');

        // ✅ Se ganhou no modo santo, libera número do diário
        if (b[a] === 'O' && level === 'santo') {
          const diarioNum = Math.floor(Math.random() * 1828) + 1;
          setDiarioNumber(diarioNum);
        }
        return;
      }
    }

    if (!b.includes(null)) {
      setWinner('Empate!');
      setBotMessage('Empate! Somos igualmente sábios hoje.');
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setWinner(null);
    setIsPlayerTurn(true);
    setBotMessage('Vamos jogar novamente! Escolha o nível.');
    setDiarioNumber(null); // Resetar número do diário
  };

  // ==================== BOT INTELIGENTE ====================
  const getBestMove = (board) => {
    let bestScore = -Infinity;
    let move;
    const emptyCells = board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);

    emptyCells.forEach(i => {
      board[i] = 'X';
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    });

    return move;
  };

  const minimax = (board, isMaximizing) => {
    const result = evaluate(board);
    if (result !== null) return result;

    const emptyCells = board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i of emptyCells) {
        board[i] = 'X';
        bestScore = Math.max(bestScore, minimax(board, false));
        board[i] = null;
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i of emptyCells) {
        board[i] = 'O';
        bestScore = Math.min(bestScore, minimax(board, true));
        board[i] = null;
      }
      return bestScore;
    }
  };

  const evaluate = (board) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    for (let [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] === 'X' ? 10 : -10;
      }
    }

    if (!board.includes(null)) return 0;
    return null;
  };

  const getSafeMove = (board) => {
    const winMove = findWinningMove(board, 'X');
    if (winMove !== null) return winMove;
    const blockMove = findWinningMove(board, 'O');
    if (blockMove !== null) return blockMove;
    const emptyCells = board.map((c,i) => c===null?i:null).filter(i=>i!==null);
    return emptyCells[Math.floor(Math.random()*emptyCells.length)];
  };

  const findWinningMove = (b, player) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    for (let [a,bIndex,c] of lines) {
      const line = [b[a], b[bIndex], b[c]];
      if (line.filter(x=>x===player).length===2 && line.includes(null)) {
        return [a,bIndex,c][line.indexOf(null)];
      }
    }
    return null;
  };

  const randomMessage = (type) => {
    const messages = {
      bispo: [
        'Hm, isso vai ser divertido!',
        'Estou apenas começando...',
        'Você pode vencer, mas não será fácil!'
      ],
      papa: [
        'Hmm, estou refletindo...',
        'Vamos ver se consigo essa vitória!',
        'Não subestime um Papa!'
      ],
      papaSmart: [
        'O jogo está ficando interessante...',
        'Preciso pensar um pouco mais...',
        'Que movimento sábio eu farei agora?'
      ],
      santo: [
        'Santo ou sábio, o caminho da vitória é claro!',
        'Minhas estratégias são divinas!',
        'Prepare-se para o desafio máximo!'
      ]
    };

    const arr = messages[type] || ['...'];
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // ==================== RENDER ====================
  return (
    <div className="container">
      <h1>Jogo da Velha - Contra São João Paulo II</h1>

      <div className="bot-message">{botMessage}</div>

      <div className="level-selector">
        <label>Escolha o nível: </label>
        <label>Tente ganhar no modo "Santo"</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="bispo">Bispo (Fácil, mas não se engane.)</option>
          <option value="papa">Papa (Médio, mas posso ser legal.)</option>
          <option value="santo">Santo (Difícil, a subida ao céu é diferente.)</option>
        </select>
      </div>

      <div className="board">
        {board.map((cell, index) => (
          <div 
            key={index} 
            className="cell" 
            onClick={() => handleClick(index)}
          >
            {cell}
          </div>
        ))}
      </div>

      {winner && (
        <div className="winner">
          <h2>{winner}</h2>
          {diarioNumber && (
            <p>Parabéns! Sua passagem do Diário de Santa Faustina: <strong>{diarioNumber}</strong></p>
          )}
          <button onClick={resetGame}>Reiniciar</button>
        </div>
      )}
    </div>
  );
}

export default App;
