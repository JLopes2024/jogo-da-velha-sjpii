import React, { useState, useEffect } from "react";
import "./App.css";

export default function JogoDaVelha() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [level, setLevel] = useState("facil");
  const [supremeUnlocked, setSupremeUnlocked] = useState(false); // nível secreto
  const [supremeTries, setSupremeTries] = useState(3); // tentativas restantes

  // 🧠 Função para verificar vencedor
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

  // 🧹 Reinicia o tabuleiro
  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
  };

  // 🕹️ Clique do jogador
  const handleClick = (index) => {
    if (winner || board[index]) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  // 🤖 Movimento do bot (cada nível com estratégia diferente)
  const botMove = (newBoard) => {
    const emptyCells = newBoard
      .map((cell, i) => (cell === null ? i : null))
      .filter((i) => i !== null);
    if (emptyCells.length === 0) return;

    let move = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // Médio → tenta vencer
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

    // Difícil → bloqueia e vence
    if (level === "dificil" || level === "supremo") {
      // tenta vencer
      for (let i of emptyCells) {
        const copy = [...newBoard];
        copy[i] = "O";
        if (calculateWinner(copy) === "O") {
          move = i;
          break;
        }
      }

      // tenta bloquear o jogador
      for (let i of emptyCells) {
        const copy = [...newBoard];
        copy[i] = "X";
        if (calculateWinner(copy) === "X") {
          move = i;
          break;
        }
      }

      // Supremo → joga quase perfeito
      if (level === "supremo") {
        const priority = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        for (let i of priority) {
          if (emptyCells.includes(i)) {
            move = i;
            break;
          }
        }

        // chance mínima de erro (5%)
        if (Math.random() < 0.05) {
          move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
      }
    }

    newBoard[move] = "O";
    setBoard(newBoard);
    setIsXNext(true);
  };

  // 🧩 Efeito principal (checagem de vencedor + bot)
  useEffect(() => {
    const win = calculateWinner(board);

    if (win) {
      setWinner(win);

      // ✅ Se o jogador vence no modo "Santo", desbloqueia o Supremo
      if (win === "X" && level === "dificil") {
        setSupremeUnlocked(true);
        setSupremeTries(3);
      }

      // ❌ Se o jogador perde no modo Supremo, conta tentativa
      if ((win === "O" || win === "Empate") && level === "supremo") {
        setSupremeTries((prev) => prev - 1);
      }
    } else if (!board.includes(null)) {
      setWinner("Empate");

      // Empate também conta como falha no Supremo
      if (level === "supremo") {
        setSupremeTries((prev) => prev - 1);
      }
    } else if (!isXNext) {
      setTimeout(() => botMove([...board]), 500);
    }
  }, [board, isXNext]);

  // 🧨 Remove o modo Supremo se as tentativas acabarem
  useEffect(() => {
    if (supremeTries <= 0 && supremeUnlocked && level === "supremo") {
      alert("Nossa Senhora se despediu! 🌹");
      setSupremeUnlocked(false);
      setLevel("facil");
      resetBoard();
    }
  }, [supremeTries]);

  // 🔁 Trocar o nível → zera tabuleiro
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
          : level === "supremo"
          ? "Nossa Senhora está guiando os passos... 🙏"
          : "Turno do São João Paulo II 🤖"}
      </div>

      <div className="level-selector">
        <label htmlFor="level">Escolha o nível:</label>
        <select id="level" value={level} onChange={handleLevelChange}>
          <option value="facil">Bispo</option>
          <option value="medio">Papa</option>
          <option value="dificil">Santo</option>
          {supremeUnlocked && <option value="supremo">Nossa Senhora 🌟</option>}
        </select>

        {level === "supremo" && (
          <p style={{ color: "#ff00ff", marginTop: "8px", fontSize: "0.7rem" }}>
            Tentativas restantes: {supremeTries}
          </p>
        )}
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

      {supremeUnlocked && level !== "supremo" && (
        <p style={{ color: "#9c27b0", marginTop: "15px", fontSize: "0.8rem" }}>
          🌟 Você desbloqueou o nível Supremo!  
          Escolha “Nossa Senhora” e teste sua fé 😇
        </p>
      )}
    </div>
  );
}
