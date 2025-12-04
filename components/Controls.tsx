import React from 'react';
import { C } from '../constants';

interface ControlsProps {
  velocity: number;
  onChange: (v: number) => void;
}

const Controls: React.FC<ControlsProps> = ({ velocity, onChange }) => {
  // Use a log scale for the slider to cover 0 to C comfortably
  // Log(v+1) map to slider 0-1000
  const maxLog = Math.log(C + 1);
  const sliderValue = (Math.log(velocity + 1) / maxLog) * 1000;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newVelocity = Math.exp((val / 1000) * maxLog) - 1;
    // Snap to C if very close
    if (newVelocity > C * 0.9999) onChange(C * 0.99999);
    else onChange(newVelocity);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
      <div className="max-w-4xl mx-auto w-full">
        <label htmlFor="velocity-slider" className="block text-cyan-400 font-mono text-sm mb-2 tracking-widest">
          THROTTLE CONTROL
        </label>
        <input
          id="velocity-slider"
          type="range"
          min="0"
          max="1000"
          step="0.1"
          value={sliderValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
        <div className="flex justify-between text-xs text-gray-500 font-mono mt-2">
            <span>STOP</span>
            <span>MACH 1</span>
            <span>VOYAGER</span>
            <span>0.1c</span>
            <span>0.5c</span>
            <span>0.99c</span>
            <span>LIGHT SPEED</span>
        </div>
      </div>
    </div>
  );
};

export default Controls;