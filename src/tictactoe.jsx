import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const initDB = async () => {
      const db = await openDB();
      const storedLeaderboard = await getLeaderboard(db);
      setLeaderboard(storedLeaderboard);
    };
    initDB();
  }, []);

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
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = async (i) => {
    const newBoard = [...board];
    if (calculateWinner(newBoard) || newBoard[i]) return;
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    const winner = calculateWinner(newBoard);
    if (winner) {
      const db = await openDB();
      await updateLeaderboard(db, winner);
      const updatedLeaderboard = await getLeaderboard(db);
      setLeaderboard(updatedLeaderboard);
    }
  };

  const renderSquare = (i) => {
    return (
      <motion.button
        className="square"
        onClick={() => handleClick(i)}
        style={squareStyle}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        animate={{ rotateY: board[i] ? 360 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {board[i]}
      </motion.button>
    );
  };

  const winner = calculateWinner(board);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (board.every(square => square !== null)) {
    status = 'Draw';
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const gameStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  };

  const boardStyle = {
    backgroundColor: '#fff',
    border: '2px solid #333',
    borderRadius: '5px',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    margin: '20px 0',
  };

  const rowStyle = {
    display: 'flex',
  };

  const squareStyle = {
    width: '80px',
    height: '80px',
    backgroundColor: '#fff',
    border: '1px solid #999',
    fontSize: '48px',
    fontWeight: 'bold',
    lineHeight: '80px',
    margin: '-1px -1px 0 0',
    padding: 0,
    textAlign: 'center',
    outline: 'none',
    transition: 'all 0.3s',
    cursor: 'pointer',
  };

  const statusStyle = {
    marginBottom: '10px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  };

  const leaderboardStyle = {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  };

  return (
    <div className="game" style={gameStyle}>
      <div className="game-board" style={boardStyle}>
        <div className="board-row" style={rowStyle}>
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row" style={rowStyle}>
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row" style={rowStyle}>
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
      <div className="game-info">
        <div style={statusStyle}>{status}</div>
      </div>
      <div className="leaderboard" style={leaderboardStyle}>
        <h2>Leaderboard</h2>
        <ul>
          {leaderboard.map((entry, index) => (
            <li key={index}>{entry.player}: {entry.wins} wins</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TicTacToeDB', 1);
    request.onerror = () => reject('Error opening database');
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('leaderboard', { keyPath: 'player' });
    };
  });
};

const getLeaderboard = (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['leaderboard'], 'readonly');
    const store = transaction.objectStore('leaderboard');
    const request = store.getAll();
    request.onerror = () => reject('Error fetching leaderboard');
    request.onsuccess = () => resolve(request.result);
  });
};

const updateLeaderboard = (db, winner) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['leaderboard'], 'readwrite');
    const store = transaction.objectStore('leaderboard');
    const request = store.get(winner);
    request.onerror = () => reject('Error updating leaderboard');
    request.onsuccess = () => {
      const data = request.result || { player: winner, wins: 0 };
      data.wins++;
      store.put(data);
      resolve();
    };
  });
};

export default TicTacToe;
