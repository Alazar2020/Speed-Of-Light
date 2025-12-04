import React from 'react';
import { Phase, Milestone } from '../types';
import { C, MILESTONES } from '../constants';

interface HUDProps {
  velocity: number;
  gamma: number;
  phase: Phase;
}

const HUD: React.FC<HUDProps> = ({ velocity, gamma, phase }) => {
  const betaPercent = (velocity / C) * 100;
  
  // Find closest active milestone
  const activeMilestone = MILESTONES.reduce((prev, curr) => {
    return (velocity >= curr.speed) ? curr : prev;
  }, MILESTONES[0]);

  return (
    <div className="fixed top-0 left-0 w-full p-6 z-20 pointer-events-none flex justify-between items-start">
      {/* Left Column: Primary Telemetry */}
      <div className="flex flex-col gap-4">
        <div className="bg-black/50 backdrop-blur-sm border border-cyan-900/50 p-4 rounded-sm text-cyan-500 font-mono w-64">
          <div className="text-xs text-cyan-700 uppercase mb-1">Velocity (v)</div>
          <div className="text-2xl font-bold">
            {velocity < 1000 
              ? `${velocity.toFixed(2)} m/s` 
              : velocity < 100000 
                ? `${(velocity / 1000).toFixed(2)} km/s`
                : `${betaPercent.toFixed(7)}% c`
            }
          </div>
          <div className="w-full bg-gray-900 h-1 mt-2">
            <div 
              className="bg-cyan-500 h-1 transition-all duration-100" 
              style={{ width: `${Math.min(100, (Math.log(velocity+1)/Math.log(C+1))*100)}%` }}
            />
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-sm border border-purple-900/50 p-4 rounded-sm text-purple-400 font-mono w-64">
          <div className="text-xs text-purple-700 uppercase mb-1">Time Dilation (γ)</div>
          <div className="text-2xl font-bold">
            {gamma > 1000 ? "∞" : gamma.toFixed(4)}
          </div>
          <div className="text-xs text-purple-300/60 mt-1">
             1 sec onboard = {gamma > 1000 ? "∞" : gamma.toFixed(2)} sec on Earth
          </div>
        </div>
      </div>

      {/* Center Top: Phase Indicator */}
      <div className="flex flex-col items-center">
        <div className="text-white/80 font-mono text-xs tracking-[0.2em] border border-white/20 px-3 py-1 bg-black/40 rounded-full mb-2">
            CURRENT PHASE
        </div>
        <h1 className={`text-3xl font-bold tracking-tighter uppercase text-center 
            ${phase === Phase.ASYMPTOTE ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-gray-200'}`}>
            {phase}
        </h1>
        {activeMilestone && Math.abs(velocity - activeMilestone.speed) < activeMilestone.speed * 0.5 && (
           <div className="mt-4 bg-yellow-500/10 border-l-2 border-yellow-500 p-2 max-w-sm animate-pulse">
               <div className="text-yellow-500 font-bold text-xs font-mono uppercase">Milestone Reached</div>
               <div className="text-yellow-100 text-sm">{activeMilestone.label}</div>
           </div>
        )}
      </div>

      {/* Right Column: Environment Data */}
      <div className="flex flex-col gap-4 items-end">
        <div className="bg-black/50 backdrop-blur-sm border border-green-900/50 p-4 rounded-sm text-green-500 font-mono text-right w-64">
             <div className="text-xs text-green-700 uppercase mb-1">Visual Effects</div>
             <ul className="text-xs space-y-1">
                 <li className={velocity > 300 ? "text-green-400" : "text-gray-700"}>Doppler Shift: {velocity > C * 0.1 ? "ACTIVE" : "NOMINAL"}</li>
                 <li className={velocity > C * 0.1 ? "text-green-400" : "text-gray-700"}>Aberration: {velocity > C * 0.1 ? "DETECTED" : "NONE"}</li>
                 <li className={velocity > C * 0.5 ? "text-red-400 animate-pulse" : "text-gray-700"}>Lorentz Contraction: {velocity > C * 0.5 ? "CRITICAL" : "NONE"}</li>
             </ul>
        </div>
      </div>
    </div>
  );
};

export default HUD;