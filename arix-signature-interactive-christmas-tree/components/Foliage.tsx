
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';
import { TreeState } from '../types';

interface FoliageProps {
  state: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ state }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const particles = useMemo(() => {
    const count = TREE_CONFIG.PARTICLE_COUNT;
    const treePositions = new Float32Array(count * 3);
    const scatterPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const emerald = new THREE.Color(COLORS.EMERALD_DARK);
    const gold = new THREE.Color(COLORS.GOLD_BRIGHT);

    for (let i = 0; i < count; i++) {
      // Tree Shape (Cone)
      const y = Math.random() * TREE_CONFIG.HEIGHT;
      const angle = Math.random() * Math.PI * 2;
      const radiusAtY = (1 - y / TREE_CONFIG.HEIGHT) * TREE_CONFIG.RADIUS;
      const r = Math.pow(Math.random(), 0.5) * radiusAtY;
      
      treePositions[i * 3] = Math.cos(angle) * r;
      treePositions[i * 3 + 1] = y - TREE_CONFIG.HEIGHT / 2;
      treePositions[i * 3 + 2] = Math.sin(angle) * r;

      // Scattered Position
      scatterPositions[i * 3] = (Math.random() - 0.5) * TREE_CONFIG.SCATTER_RADIUS * 2;
      scatterPositions[i * 3 + 1] = (Math.random() - 0.5) * TREE_CONFIG.SCATTER_RADIUS * 2;
      scatterPositions[i * 3 + 2] = (Math.random() - 0.5) * TREE_CONFIG.SCATTER_RADIUS * 2;

      // Colors
      const isGold = Math.random() > 0.92;
      const mixColor = isGold ? gold : emerald;
      colors[i * 3] = mixColor.r;
      colors[i * 3 + 1] = mixColor.g;
      colors[i * 3 + 2] = mixColor.b;

      sizes[i] = isGold ? Math.random() * 2.0 + 1.0 : Math.random() * 1.5 + 0.5;
    }

    return { treePositions, scatterPositions, colors, sizes };
  }, []);

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColorEmerald: { value: new THREE.Color(COLORS.EMERALD_DARK) },
      uColorGold: { value: new THREE.Color(COLORS.GOLD_BRIGHT) },
    },
    vertexShader: `
      attribute vec3 treePos;
      attribute vec3 scatterPos;
      attribute float size;
      attribute vec3 color;
      uniform float uTime;
      uniform float uProgress;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = color;
        
        // Morphing
        vec3 pos = mix(scatterPos, treePos, uProgress);
        
        // Jitter / Breathing
        float jitter = sin(uTime * 2.0 + pos.y * 0.5) * 0.05;
        pos.x += jitter;
        pos.z += jitter;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = 0.8 + 0.2 * sin(uTime + pos.y);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        float strength = 1.0 - (dist * 2.0);
        gl_FragColor = vec4(vColor, strength * vAlpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame((stateContext) => {
    const targetProgress = state === TreeState.TREE_SHAPE ? 1 : 0;
    materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uProgress.value,
      targetProgress,
      TREE_CONFIG.TRANSITION_SPEED
    );
    materialRef.current.uniforms.uTime.value = stateContext.clock.elapsedTime;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.treePositions.length / 3}
          array={particles.treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-treePos"
          count={particles.treePositions.length / 3}
          array={particles.treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scatterPos"
          count={particles.scatterPositions.length / 3}
          array={particles.scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particles.sizes.length}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial ref={materialRef} args={[shaderArgs]} />
    </points>
  );
};

export default Foliage;
