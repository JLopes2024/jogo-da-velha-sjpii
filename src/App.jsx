import React, { useState, useEffect } from "react";
import "./App.css";

export default function JogoDaVelha() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // true = jogador (X) pode jogar
  const [winner, setWinner] = useState(null);
  const [level, setLevel] = useState("facil"); // 'facil' | 'medio' | 'dificil'

  // verifica vencedor
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  // limpa tabuleiro
  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
  };

  // clique do jogador (X)
  const handleClick = (index) => {
    if (winner || board[index] || !isXNext) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXNext(false);
  };

  // lógica do bot (O) por nível
  const botMove = (newBoard) => {
    const emptyCells = newBoard
      .map((cell, i) => (cell === null ? i : null))
      .filter((i) => i !== null);
    if (emptyCells.length === 0) return;

    // start with random move
    let move = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // MÉDIO: tenta vencer se possível
    if (level === "medio") {
      for (let i of emptyCells) {
        const copy = [...newBoard];
        copy[i] = "O";
        if (calculateWinner(copy) === "O") {
          move = i;
          break;
        }
      }
    }

    // DIFÍCIL: tenta vencer, depois bloquear
    if (level === "dificil") {
      // tenta vencer
      for (let i of emptyCells) {
        const copy = [...newBoard];
        copy[i] = "O";
        if (calculateWinner(copy) === "O") {
          move = i;
          break;
        }
      }

      // tenta bloquear X
      for (let i of emptyCells) {
        const copy = [...newBoard];
        copy[i] = "X";
        if (calculateWinner(copy) === "X") {
          move = i;
          break;
        }
      }

      // prioridade: centro, cantos, laterais
      const priority = [4, 0, 2, 6, 8, 1, 3, 5, 7];
      for (let p of priority) {
        if (emptyCells.includes(p)) {
          move = p;
          break;
        }
      }

      // mantém uma chance ínfima de erro (1%) para não ser 100% previsível
      if (Math.random() < 0.01) {
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }

    newBoard[move] = "O";
    setBoard(newBoard);
    setIsXNext(true);
  };

  // efeito principal: verifica vencedor e dispara jogada do bot quando necessário
  useEffect(() => {
    const win = calculateWinner(board);

    if (win) {
      setWinner(win);
    } else if (!board.includes(null)) {
      setWinner("Empate");
    } else {
      // se for a vez do bot (isXNext === false), ele joga
      if (!isXNext) {
        const timer = setTimeout(() => {
          botMove([...board]);
        }, 450); // delay para parecer natural
        return () => clearTimeout(timer);
      }
    }
  }, [board, isXNext, level]);

  // trocar nível zera o tabuleiro
  const handleLevelChange = (e) => {
    setLevel(e.target.value);
    resetBoard();
  };

  return (
    <div className="container">
      <h1>Jogo da Velha - São João Paulo II</h1>

      <div className="bot-message">
        {winner
          ? winner === "Empate"
            ? "Empate! 😅"
            : `Vitória de ${winner}! 🎉`
          : isXNext
          ? "Sua vez!"
          : "Turno do São João Paulo II 🤖"}
      </div>

      <div className="level-selector">
        <label htmlFor="level">Escolha o nível:</label>
        <select id="level" value={level} onChange={handleLevelChange}>
          <option value="facil">Bispo</option>
          <option value="medio">Papa</option>
          <option value="dificil">Santo</option>
        </select>
      </div>

      <div className="board" role="grid" aria-label="tabuleiro jogo da velha">
        {board.map((cell, index) => (
          <button
            key={index}
            className="cell"
            onClick={() => handleClick(index)}
            aria-label={`célula ${index}`}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <div className="winner">
          <h2>{winner === "Empate" ? "Empate!" : `${winner} venceu o jogo!`}</h2>
          <button className="reset-btn" onClick={resetBoard}>
            Jogar novamente
          </button>
        </div>
      )}
    </div>
  );
}
