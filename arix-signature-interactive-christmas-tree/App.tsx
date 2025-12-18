
import React, { useState, useCallback } from 'react';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = useCallback(() => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  }, []);

  return (
    <div className="w-screen h-screen relative bg-slate-950">
      {/* Background radial gradient for depth */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center, #064e3b 0%, #020617 70%)'
        }} 
      />
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0">
        <Scene treeState={treeState} />
      </div>

      {/* UI Interaction Layer */}
      <Overlay state={treeState} onToggle={toggleState} />
    </div>
  );
};

export default App;
