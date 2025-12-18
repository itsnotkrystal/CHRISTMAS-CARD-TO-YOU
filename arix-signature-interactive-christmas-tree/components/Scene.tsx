
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import { TreeState } from '../types';
import { COLORS } from '../constants';

interface SceneProps {
  treeState: TreeState;
}

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={45} />
      <color attach="background" args={[COLORS.BG_DEEP]} />
      
      <Suspense fallback={null}>
        <Environment preset="night" />
        
        <group>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <Foliage state={treeState} />
            <Ornaments state={treeState} />
          </Float>
        </group>

        {/* Cinematic Lights */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={COLORS.GOLD_BRIGHT} />
        <spotLight 
          position={[-10, 20, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={2} 
          color={COLORS.EMERALD_LIGHT} 
          castShadow 
        />

        <ContactShadows 
          opacity={0.4} 
          scale={40} 
          blur={1} 
          far={10} 
          resolution={256} 
          color={COLORS.BG_DEEP} 
        />

        {/* Post-processing for cinematic glow */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.4} 
          />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Suspense>

      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={40} 
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default Scene;
