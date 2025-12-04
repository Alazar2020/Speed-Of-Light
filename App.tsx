import React, { useState, useEffect } from 'react';
import Starfield from './components/Starfield';
import Controls from './components/Controls';
import HUD from './components/HUD';
import ChatPanel from './components/ChatPanel';
import { C, getPhase } from './constants';
import { Phase } from './types';

const App: React.FC = () => {
  const [velocity, setVelocity] = useState<number>(0);
  const [phase, setPhase] = useState<Phase>(Phase.TERRESTRIAL);
  const [gamma, setGamma] = useState<number>(1);

  // Update physics state derived from velocity
  useEffect(() => {
    // Phase calculation
    setPhase(getPhase(velocity));

    // Gamma calculation
    const beta = velocity / C;
    if (beta >= 1) {
      setGamma(Infinity);
    } else {
      setGamma(1 / Math.sqrt(1 - beta * beta));
    }
  }, [velocity]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Background Simulation Layer */}
      <Starfield velocity={velocity} />

      {/* Foreground UI Layer */}
      <HUD velocity={velocity} gamma={gamma} phase={phase} />
      
      {/* Asymptote Warning Overlay */}
      {velocity > C * 0.999 && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
             <h1 className="text-6xl md:text-9xl font-black text-white mix-blend-overlay opacity-50 tracking-widest text-center animate-pulse">
                 C LIMIT
             </h1>
         </div>
      )}

      {/* Controls */}
      <Controls velocity={velocity} onChange={setVelocity} />

      {/* AI Assistant */}
      <ChatPanel velocity={velocity} phase={phase} />
    </div>
  );
};

export default App;