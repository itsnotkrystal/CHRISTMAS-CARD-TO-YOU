
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, ORNAMENT_COUNTS, TREE_CONFIG } from '../constants';
import { TreeState, OrnamentData } from '../types';

interface OrnamentGroupProps {
  state: TreeState;
}

const Ornaments: React.FC<OrnamentGroupProps> = ({ state }) => {
  const ballsRef = useRef<THREE.InstancedMesh>(null!);
  const boxesRef = useRef<THREE.InstancedMesh>(null!);
  const starsRef = useRef<THREE.InstancedMesh>(null!);
  
  const progressRef = useRef(0);

  const generateData = (count: number, scaleRange: [number, number], weightRange: [number, number]) => {
    const data: OrnamentData[] = [];
    for (let i = 0; i < count; i++) {
      const y = Math.random() * (TREE_CONFIG.HEIGHT * 0.9);
      const angle = Math.random() * Math.PI * 2;
      const radiusAtY = (1 - y / TREE_CONFIG.HEIGHT) * TREE_CONFIG.RADIUS;
      const r = radiusAtY * 0.95;

      const treePos: [number, number, number] = [
        Math.cos(angle) * r,
        y - TREE_CONFIG.HEIGHT / 2,
        Math.sin(angle) * r
      ];

      const scatterPos: [number, number, number] = [
        (Math.random() - 0.5) * TREE_CONFIG.SCATTER_RADIUS * 1.5,
        (Math.random() - 0.5) * TREE_CONFIG.SCATTER_RADIUS * 1.5,
        (Math.random() - 0.5) * TREE_CONFIG.SCATTER_RADIUS * 1.5
      ];

      data.push({
        treePos,
        scatterPos,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: Math.random() * (scaleRange[1] - scaleRange[0]) + scaleRange[0],
        weight: Math.random() * (weightRange[1] - weightRange[0]) + weightRange[0],
      });
    }
    return data;
  };

  const ballData = useMemo(() => generateData(ORNAMENT_COUNTS.BALLS, [0.15, 0.3], [0.5, 1.0]), []);
  const boxData = useMemo(() => generateData(ORNAMENT_COUNTS.BOXES, [0.3, 0.6], [1.5, 3.0]), []);
  const starData = useMemo(() => generateData(ORNAMENT_COUNTS.STARS, [0.05, 0.15], [0.1, 0.4]), []);

  const tempMatrix = new THREE.Matrix4();
  const tempPos = new THREE.Vector3();
  const tempQuat = new THREE.Quaternion();
  const tempScale = new THREE.Vector3();
  const tempEuler = new THREE.Euler();

  useFrame((stateCtx) => {
    const target = state === TreeState.TREE_SHAPE ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, TREE_CONFIG.TRANSITION_SPEED);
    const t = stateCtx.clock.elapsedTime;

    const updateInstance = (mesh: THREE.InstancedMesh, data: OrnamentData[]) => {
      data.forEach((item, i) => {
        const p = progressRef.current;
        // Dual Position Lerp
        tempPos.set(
          THREE.MathUtils.lerp(item.scatterPos[0], item.treePos[0], p),
          THREE.MathUtils.lerp(item.scatterPos[1], item.treePos[1], p),
          THREE.MathUtils.lerp(item.scatterPos[2], item.treePos[2], p)
        );

        // Add some "weight" based floating when scattered
        if (p < 0.99) {
          const drift = (1 - p) * item.weight;
          tempPos.x += Math.sin(t * 0.5 + i) * drift * 0.2;
          tempPos.y += Math.cos(t * 0.3 + i) * drift * 0.2;
          tempPos.z += Math.sin(t * 0.7 + i) * drift * 0.2;
        }

        tempEuler.set(
          item.rotation[0] + t * 0.1 * (1 - p) * item.weight,
          item.rotation[1] + t * 0.1 * (1 - p) * item.weight,
          item.rotation[2]
        );
        tempQuat.setFromEuler(tempEuler);
        tempScale.setScalar(item.scale);
        
        tempMatrix.compose(tempPos, tempQuat, tempScale);
        mesh.setMatrixAt(i, tempMatrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };

    if (ballsRef.current) updateInstance(ballsRef.current, ballData);
    if (boxesRef.current) updateInstance(boxesRef.current, boxData);
    if (starsRef.current) updateInstance(starsRef.current, starData);
  });

  return (
    <>
      {/* Balls - Metallic Gold */}
      <instancedMesh ref={ballsRef} args={[undefined, undefined, ORNAMENT_COUNTS.BALLS]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color={COLORS.GOLD_METAL} 
          metalness={0.9} 
          roughness={0.1} 
          emissive={COLORS.GOLD_BRIGHT}
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Boxes - Saturated Deep Green / Emerald */}
      <instancedMesh ref={boxesRef} args={[undefined, undefined, ORNAMENT_COUNTS.BOXES]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={COLORS.EMERALD_DARK} 
          metalness={0.4} 
          roughness={0.5} 
        />
      </instancedMesh>

      {/* Star Lights - Glowing Yellow */}
      <instancedMesh ref={starsRef} args={[undefined, undefined, ORNAMENT_COUNTS.STARS]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial 
          color={COLORS.GOLD_BRIGHT} 
          emissive={COLORS.GOLD_BRIGHT} 
          emissiveIntensity={2.0} 
        />
      </instancedMesh>
    </>
  );
};

export default Ornaments;
