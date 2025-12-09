import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';

const FallingLeaves = () => {
    // Generate random falling leaves
    const count = 50;
    const leaves = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                Math.random() * 10 + 2,
                (Math.random() - 0.5) * 20
            ),
            velocity: Math.random() * 0.05 + 0.02,
            offset: Math.random() * 100,
            color: Math.random() > 0.5 ? "#fca5a5" : "#fcd34d" // Red or Yellow
        }));
    }, []);

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();

        leaves.forEach((leaf, i) => {
            // Update position
            leaf.position.y -= leaf.velocity;
            
            // Wiggle
            const wiggleX = Math.sin(time * 2 + leaf.offset) * 0.02;
            const wiggleZ = Math.cos(time * 1.5 + leaf.offset) * 0.02;
            leaf.position.x += wiggleX;
            leaf.position.z += wiggleZ;

            // Reset if hit ground
            if (leaf.position.y < 0) {
                leaf.position.y = 10;
                leaf.position.x = (Math.random() - 0.5) * 20;
                leaf.position.z = (Math.random() - 0.5) * 20;
            }

            dummy.position.copy(leaf.position);
            
            // Rotation animation
            dummy.rotation.set(
                time + leaf.offset,
                time * 0.5 + leaf.offset,
                time * 0.2 + leaf.offset
            );
            dummy.scale.set(0.1, 0.1, 0.1);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            
            // Simple color variation logic would require modifying instanceColor buffer, 
            // but for simplicity in this constraints, we'll use a single material color or random prop if utilizing Instances (Drei).
            // Here we use native InstancedMesh, so colors default to material. 
            // To make it pretty without complex buffers:
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color="#f59e0b" side={THREE.DoubleSide} transparent opacity={0.9} />
        </instancedMesh>
    );
};

// Static leaves on the ground
const GroundLeaves = () => {
  const count = 300;
  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 30,
        0.02, // Just above ground to prevent z-fighting
        (Math.random() - 0.5) * 30
      ] as [number, number, number],
      rotation: [
        -Math.PI / 2, 
        0, 
        Math.random() * Math.PI * 2
      ] as [number, number, number],
      scale: 0.15 + Math.random() * 0.1,
      color: Math.random() > 0.6 ? "#ef4444" : (Math.random() > 0.3 ? "#f59e0b" : "#78350f") // Red, Orange, Brown
    }));
  }, []);

  return (
    <Instances range={count}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial side={THREE.DoubleSide} />
      {data.map((props, i) => (
        <Instance 
            key={i} 
            position={props.position} 
            rotation={props.rotation} 
            scale={[props.scale, props.scale, props.scale]}
            color={props.color}
        />
      ))}
    </Instances>
  )
}

export const AutumnEnvironment: React.FC = () => {
  return (
    <group>
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#65a30d" /> {/* Autumn grass green */}
      </mesh>

      {/* Decorative Trees - Simplified as Cylinders and Spheres */}
      <group position={[-8, 0, -8]}>
         <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.8, 4, 8]} />
            <meshStandardMaterial color="#573625" />
         </mesh>
         <mesh position={[0, 5, 0]} castShadow>
            <dodecahedronGeometry args={[2.5]} />
            <meshStandardMaterial color="#ea580c" />
         </mesh>
      </group>

      <group position={[10, 0, -5]}>
         <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.4, 0.7, 4, 8]} />
            <meshStandardMaterial color="#573625" />
         </mesh>
         <mesh position={[0, 5, 0]} castShadow>
            <dodecahedronGeometry args={[2.2]} />
            <meshStandardMaterial color="#facc15" />
         </mesh>
      </group>

       <group position={[5, 0, 12]}>
         <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.6, 0.9, 4, 8]} />
            <meshStandardMaterial color="#573625" />
         </mesh>
         <mesh position={[0, 5, 0]} castShadow>
            <dodecahedronGeometry args={[3]} />
            <meshStandardMaterial color="#b91c1c" />
         </mesh>
      </group>

      <GroundLeaves />
      <FallingLeaves />
    </group>
  );
};