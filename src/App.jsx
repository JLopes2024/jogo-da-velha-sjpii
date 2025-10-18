import React, { useState, useEffect } from "react";
import "./App.css";

export default function JogoDaVelha() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [level, setLevel] = useState("facil");

  // Função para verificar vencedor
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

  // Função de reset geral do tabuleiro
  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
  };

  // Quando o jogador clica em uma célula
  const handleClick = (index) => {
    if (winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  // Função para o bot jogar
  const botMove = (newBoard) => {
    const emptyCells = newBoard
      .map((cell, i) => (cell === null ? i : null))
      .filter((i) => i !== null);

    if (emptyCells.length === 0) return;

    // Nível fácil = aleatório
    let move = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // Nível médio = tenta vencer se possível
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

    // Nível difícil = tenta bloquear jogador X
    if (level === "dificil") {
      for (let i of emptyCells) {
        const copy = [...newBoard];
        copy[i] = "X";
        if (calculateWinner(copy) === "X") {
          move = i;
          break;
        }
      }
    }

    newBoard[move] = "O";
    setBoard(newBoard);
    setIsXNext(true);
  };

  // Quando há mudança no tabuleiro, verifica o vencedor
  useEffect(() => {
    const win = calculateWinner(board);
    if (win) {
      setWinner(win);
    } else if (!board.includes(null)) {
      setWinner("Empate");
    } else if (!isXNext) {
      setTimeout(() => botMove([...board]), 400);
    }
  }, [board, isXNext]);

  // Quando o nível muda, reseta o tabuleiro
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
          <option value="facil">Fácil</option>
          <option value="medio">Médio</option>
          <option value="dificil">Difícil</option>
        </select>
      </div>

      <div className="board">
        {board.map((cell, index) => (
          <div key={index} className="cell" onClick={() => handleClick(index)}>
            {cell}
          </div>
        ))}
      </div>

      {winner && (
        <div className="winner">
          <h2>
            {winner === "Empate"
              ? "Empate!"
              : `${winner} venceu o jogo!`}
          </h2>
          <button onClick={resetBoard}>Jogar novamente</button>
        </div>
      )}
    </div>
  );
}
