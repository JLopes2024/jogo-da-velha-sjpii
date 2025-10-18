import React, { useState, useEffect } from 'react';
import './App.css';

// Tabuleiro inicial: 9 posições vazias
const initialBoard = Array(9).fill(null);

function App() {
  // Estado do tabuleiro
  const [board, setBoard] = useState(initialBoard);
  // Indica se é a vez do jogador
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  // Guarda o vencedor ou empate
  const [winner, setWinner] = useState(null);
  // Nível do bot: 'bispo', 'papa' ou 'santo'
  const [level, setLevel] = useState('bispo'); 
  // Mensagem dinâmica do bot
  const [botMessage, setBotMessage] = useState('Olá! Escolha o nível e vamos jogar!');

  // useEffect para disparar a jogada do bot quando for a vez dele
  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        botMove();
      }, 500); // Delay para simular "pensamento"
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, level]);

  // Função principal do bot
  const botMove = () => {
    const newBoard = board.slice();
    let bestMove;

    if (level === 'bispo') {
      // -------------------
      // Nível Bispo: agora mais difícil
      // Ele tenta bloquear o jogador ou criar vitória simples
      // -------------------
      bestMove = getSafeMove(newBoard); // função que escolhe movimento "semi-inteligente"
      setBotMessage(randomMessage('bispo'));
    } else if (level === 'papa') {
      // -------------------
      // Nível Papa: mistura Minimax e aleatório
      // -------------------
      if (Math.random() < 0.5) {
        bestMove = getBestMove(newBoard);
        setBotMessage(randomMessage('papaSmart'));
      } else {
        const emptyCells = board.map((c,i) => c===null?i:null).filter(i=>i!==null);
        bestMove = emptyCells[Math.floor(Math.random()*emptyCells.length)];
        setBotMessage(randomMessage('papa'));
      }
    } else {
      // -------------------
      // Nível Santo: Minimax completo (difícil)
      // -------------------
      bestMove = getBestMove(newBoard);
      setBotMessage(randomMessage('santo'));
    }

    // Marca a jogada do bot
    newBoard[bestMove] = 'X';
    setBoard(newBoard);
    checkWinner(newBoard);
    setIsPlayerTurn(true);
  };

  // -------------------
  // Jogador clica em uma célula
  // -------------------
  const handleClick = (index) => {
    if (board[index] || !isPlayerTurn || winner) return;

    const newBoard = board.slice();
    newBoard[index] = 'O'; // jogador é 'O'
    setBoard(newBoard);
    checkWinner(newBoard);
    setIsPlayerTurn(false);
  };

  // -------------------
  // Checa vitória ou empate
  // -------------------
  const checkWinner = (b) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    for (let [a,bIndex,c] of lines) {
      if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
        setWinner(b[a] === 'O' ? 'Você ganhou!' : 'São João Paulo II ganhou!');
        setBotMessage(b[a] === 'X' ? 'Haha, sabia que venceria!' : 'Não desanime, jovem!');
        return;
      }
    }

    // Se não houver posições vazias → empate
    if (!b.includes(null)) {
      setWinner('Empate!');
      setBotMessage('Empate! Somos igualmente sábios hoje.');
    }
  };

  // -------------------
  // Reinicia o jogo
  // -------------------
  const resetGame = () => {
    setBoard(initialBoard);
    setWinner(null);
    setIsPlayerTurn(true);
    setBotMessage('Vamos jogar novamente! Escolha o nível.');
  };

  // ==================== BOT INTELIGENTE (Minimax) ====================

  // Minimax completo usado para Papa (50%) e Santo
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

  // Avalia vitória (-10 derrota, 10 vitória, 0 empate)
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

    if (!board.includes(null)) return 0; // empate
    return null;
  };

  // ==================== FUNÇÃO PARA BISPO MAIS DIFÍCIL ====================
  // Escolhe primeiro movimento inteligente: bloqueia jogador ou faz linha com 2 'X'
  const getSafeMove = (board) => {
    // Checa se pode vencer na próxima jogada
    const winMove = findWinningMove(board, 'X');
    if (winMove !== null) return winMove;

    // Checa se precisa bloquear o jogador
    const blockMove = findWinningMove(board, 'O');
    if (blockMove !== null) return blockMove;

    // Caso contrário, escolhe aleatório
    const emptyCells = board.map((c,i) => c===null?i:null).filter(i=>i!==null);
    return emptyCells[Math.floor(Math.random()*emptyCells.length)];
  };

  // Função auxiliar para checar vitória na próxima jogada
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

  // ==================== MENSAGENS ENGRAÇADAS DO BOT ====================

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

  // ==================================================================

  return (
    <div className="container">
      <h1>Jogo da Velha - Contra São João Paulo II</h1>

      {/* Mensagem do bot */}
      <div className="bot-message">{botMessage}</div>

      {/* Seleção de nível */}
      <div className="level-selector">
        <label>Escolha o nível: </label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="bispo">Bispo (Fácil, agora mais esperto)</option>
          <option value="papa">Papa (Médio)</option>
          <option value="santo">Santo (Difícil)</option>
        </select>
      </div>

      {/* Tabuleiro */}
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

      {/* Mensagem de vitória/empate */}
      {winner && (
        <div className="winner">
          <h2>{winner}</h2>
          <button onClick={resetGame}>Reiniciar</button>
        </div>
      )}
    </div>
  );
}

export default App;
