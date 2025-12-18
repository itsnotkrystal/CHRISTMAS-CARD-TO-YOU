
import React from 'react';
import { TreeState } from '../types';

interface OverlayProps {
  state: TreeState;
  onToggle: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ state, onToggle }) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12">
      {/* Header */}
      <div className="flex flex-col gap-1 items-start">
        <h1 className="text-amber-500 font-serif text-3xl md:text-5xl tracking-widest font-bold uppercase drop-shadow-lg">
          Arix Signature
        </h1>
        <p className="text-emerald-400 font-sans text-xs md:text-sm tracking-[0.3em] uppercase opacity-80">
          Interactive Christmas Experience
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-6 pointer-events-auto">
        <button
          onClick={onToggle}
          className="group relative px-8 py-3 overflow-hidden rounded-full border border-amber-500/30 bg-black/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-amber-900/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 text-amber-500 font-bold uppercase tracking-widest text-sm">
            {state === TreeState.SCATTERED ? 'Assemble Tree' : 'Scatter Elements'}
          </span>
        </button>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Foliage: {state === TreeState.TREE_SHAPE ? 'Stable' : 'Scattered'}
          </div>
          <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Ornaments: Active
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex justify-between items-end text-white/30 text-[10px] uppercase tracking-widest">
        <div>
          Est. 2024 / Digital Arts
        </div>
        <div className="text-right">
          Luxury Tech Collection<br />
          Design by AI Studio
        </div>
      </div>
    </div>
  );
};

export default Overlay;
