import React, { useState } from 'react';
import JogoDaVelha from './JogoDaVelha';

function App() {
  const [currentGame, setCurrentGame] = useState('jogoDaVelha');

  return (
    <>
      {currentGame === 'jogoDaVelha' && <JogoDaVelha />}
      {currentGame === 'outroJogo' && <OutroJogo setCurrentGame={setCurrentGame} />}
    </>
  );
}

export default App;
