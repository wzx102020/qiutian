import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OwnerProps {
  position: THREE.Vector3;
}

export const Owner: React.FC<OwnerProps> = ({ position }) => {
  const group = useRef<THREE.Group>(null);
  
  // Idle animation
  useFrame((state) => {
    if (group.current) {
        const t = state.clock.getElapsedTime();
        // Breathing/Idle scale
        group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.01;
        // Subtle sway
        group.current.rotation.z = Math.sin(t) * 0.02;
    }
  });

  return (
    <group ref={group} position={position} dispose={null}>
      {/* Scale model up slightly to look human scale compared to dog */}
      <group scale={[0.8, 0.8, 0.8]}>
        
        {/* Legs */}
        <mesh position={[-0.25, 1.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.1, 3, 16]} />
            <meshStandardMaterial color="#374151" /> {/* Dark grey jeans */}
        </mesh>
        <mesh position={[0.25, 1.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.1, 3, 16]} />
            <meshStandardMaterial color="#374151" />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 1.8, 0.5]} />
            <meshStandardMaterial color="#f97316" /> {/* Orange sweater */}
        </mesh>
        
        {/* Scarf */}
        <mesh position={[0, 4.8, 0]} castShadow>
             <torusGeometry args={[0.5, 0.15, 8, 20]} />
             <meshStandardMaterial color="#fcd34d" />
        </mesh>

        {/* Head */}
        <mesh position={[0, 5.4, 0]} castShadow>
            <sphereGeometry args={[0.45, 32, 32]} />
            <meshStandardMaterial color="#fecaca" /> {/* Skin tone */}
        </mesh>

        {/* Hair */}
        <group position={[0, 5.6, 0]}>
            <mesh position={[0, 0, -0.1]} castShadow>
                <sphereGeometry args={[0.48, 32, 32]} />
                <meshStandardMaterial color="#78350f" /> {/* Brown hair */}
            </mesh>
            {/* Ponytail */}
            <mesh position={[0, -0.2, -0.6]} rotation={[0.5, 0, 0]} castShadow>
                <coneGeometry args={[0.2, 0.8, 16]} />
                <meshStandardMaterial color="#78350f" />
            </mesh>
        </group>

        {/* Arms */}
        <mesh position={[-0.6, 3.8, 0]} rotation={[0, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.6, 16]} />
            <meshStandardMaterial color="#f97316" />
        </mesh>
        <mesh position={[0.6, 3.8, 0]} rotation={[0, 0, -0.2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.6, 16]} />
            <meshStandardMaterial color="#f97316" />
        </mesh>

      </group>
    </group>
  );
};