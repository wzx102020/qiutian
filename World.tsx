import React, { useRef } from 'react';
import { OrbitControls, SoftShadows, Environment as DreiEnvironment, Cloud, Sky } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Dog } from './Dog';
import { Owner } from './Owner';
import { AutumnEnvironment } from './AutumnEnvironment';

interface WorldProps {
  isReturning: boolean;
}

export const World: React.FC<WorldProps> = ({ isReturning }) => {
  // Owner is at origin for simplicity
  const ownerPosition = new THREE.Vector3(0, 0, 0);

  return (
    <>
      {/* Camera Controls */}
      <OrbitControls 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.1} // Prevent going below ground
        minDistance={5}
        maxDistance={20}
        enablePan={false}
      />

      {/* Lighting & Atmosphere */}
      <ambientLight intensity={0.6} color="#ffd4a3" />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        color="#fffaed"
      >
        <orthographicCamera attach="shadow-camera" args={[-15, 15, 15, -15, 0.1, 50]} />
      </directionalLight>
      
      <Sky sunPosition={[10, 20, 10]} turbidity={8} rayleigh={6} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <Cloud position={[-10, 10, -10]} opacity={0.5} speed={0.2} width={10} depth={1.5} segments={20} />
      <fog attach="fog" args={['#ffedd6', 5, 30]} />

      <SoftShadows size={10} samples={8} focus={0.5} />

      {/* Characters */}
      <group position={[0, 0, 0]}>
        <Owner position={ownerPosition} />
        <Dog isReturning={isReturning} ownerPosition={ownerPosition} />
      </group>

      {/* Environment */}
      <AutumnEnvironment />
    </>
  );
};