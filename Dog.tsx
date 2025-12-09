import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DogProps {
  isReturning: boolean;
  ownerPosition: THREE.Vector3;
}

export const Dog: React.FC<DogProps> = ({ isReturning, ownerPosition }) => {
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  
  // Leg refs for animation
  const frontLeftRef = useRef<THREE.Group>(null);
  const frontRightRef = useRef<THREE.Group>(null);
  const backLeftRef = useRef<THREE.Group>(null);
  const backRightRef = useRef<THREE.Group>(null);

  // Movement State
  const currentPos = useRef(new THREE.Vector3(3, 0, 3)); // Start away from owner
  const targetPos = useRef(new THREE.Vector3(3, 0, 3));
  const rotationY = useRef(0);
  const [speed, setSpeed] = useState(0);

  // Wandering logic
  const wanderTarget = useRef(new THREE.Vector3(3, 0, 3));
  const wanderTimer = useRef(0);

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1); // Cap delta to prevent huge jumps

    // 1. Determine Target
    if (isReturning) {
      // Target is near the owner (offset slightly so it doesn't clip inside)
      const offset = new THREE.Vector3(1.5, 0, 0); // Stand to side
      targetPos.current.copy(ownerPosition).add(offset);
    } else {
      // Wandering logic
      if (time > wanderTimer.current) {
        // Pick a new random point within a radius
        const r = 8;
        const theta = Math.random() * Math.PI * 2;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        wanderTarget.current.set(x, 0, z);
        // Reset timer (2-5 seconds)
        wanderTimer.current = time + 2 + Math.random() * 3;
      }
      targetPos.current.copy(wanderTarget.current);
    }

    // 2. Move towards target
    const direction = new THREE.Vector3().subVectors(targetPos.current, currentPos.current);
    const distance = direction.length();
    
    // Smooth start/stop
    let moveSpeed = isReturning ? 6.0 : 3.5; // Runs faster when called
    if (distance < 0.2) moveSpeed = 0; // Stop when close

    // Lerp speed for smooth acceleration/deceleration
    setSpeed(s => THREE.MathUtils.lerp(s, moveSpeed, dt * 5));

    if (distance > 0.1) {
      direction.normalize();
      
      // Update Position
      const moveStep = speed * dt;
      currentPos.current.add(direction.multiplyScalar(moveStep));
      
      // Update Rotation (Face direction)
      const targetRotation = Math.atan2(direction.x, direction.z);
      // Smooth rotation
      let rotDiff = targetRotation - rotationY.current;
      // Normalize angle to -PI to PI
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      
      rotationY.current += rotDiff * dt * 8; // Turn speed
    } else {
       // Idle rotation - look at owner if returned
       if (isReturning) {
          const lookDir = new THREE.Vector3().subVectors(ownerPosition, currentPos.current).normalize();
          const targetRotation = Math.atan2(lookDir.x, lookDir.z);
          let rotDiff = targetRotation - rotationY.current;
          while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
          while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
          rotationY.current += rotDiff * dt * 4;
       }
    }

    // Apply Position and Rotation to Group
    group.current.position.copy(currentPos.current);
    group.current.rotation.y = rotationY.current;

    // 3. Animation

    // Running Animation (Legs)
    const runCycle = time * (speed * 3 + 2); // Speed affects frequency
    const amp = speed > 0.1 ? 0.6 : 0; // Amplitude based on movement

    if (frontLeftRef.current) frontLeftRef.current.rotation.x = Math.sin(runCycle) * amp;
    if (frontRightRef.current) frontRightRef.current.rotation.x = Math.cos(runCycle) * amp;
    if (backLeftRef.current) backLeftRef.current.rotation.x = Math.cos(runCycle) * amp;
    if (backRightRef.current) backRightRef.current.rotation.x = Math.sin(runCycle) * amp;

    // Bobbing body
    if (group.current) {
        group.current.position.y = Math.abs(Math.sin(runCycle * 2)) * 0.1 * (speed / 4);
    }

    // Tail Wag
    if (tailRef.current) {
      // Wag faster if moving or happy (returning)
      const wagSpeed = isReturning ? 15 : 8;
      tailRef.current.rotation.y = Math.sin(time * wagSpeed) * 0.4;
      tailRef.current.rotation.z = -0.2; // Lift tail slightly
    }

    // Head Bob
    if (headRef.current) {
       headRef.current.rotation.z = Math.sin(time * 2) * 0.05;
       headRef.current.rotation.x = Math.sin(time * 3) * 0.05;
    }
  });

  // Materials
  const furWhite = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff' }), []);
  const furYellow = useMemo(() => new THREE.MeshStandardMaterial({ color: '#facc15' }), []);
  const noseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#333333' }), []);

  return (
    <group ref={group} dispose={null}>
      {/* Dog Container - Scaled down */}
      <group scale={[0.5, 0.5, 0.5]}>
        
        {/* Body */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow material={furWhite}>
          <boxGeometry args={[0.7, 0.6, 1.2]} />
        </mesh>
        {/* Yellow Patch on back */}
        <mesh position={[0, 0.65, -0.2]} castShadow receiveShadow material={furYellow}>
          <boxGeometry args={[0.72, 0.55, 0.6]} />
        </mesh>

        {/* Head Group */}
        <group ref={headRef} position={[0, 1.1, 0.7]}>
            {/* Head Main */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow material={furYellow}>
              <boxGeometry args={[0.5, 0.5, 0.6]} />
            </mesh>
            {/* Snout */}
            <mesh position={[0, -0.1, 0.35]} castShadow receiveShadow material={furWhite}>
               <boxGeometry args={[0.3, 0.25, 0.3]} />
            </mesh>
            {/* Nose */}
            <mesh position={[0, 0.05, 0.5]} castShadow material={noseMat}>
               <boxGeometry args={[0.1, 0.1, 0.05]} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.2, 0.3, -0.1]} rotation={[0, 0, -0.2]} castShadow material={furYellow}>
               <boxGeometry args={[0.15, 0.3, 0.1]} />
            </mesh>
            <mesh position={[0.2, 0.3, -0.1]} rotation={[0, 0, 0.2]} castShadow material={furYellow}>
               <boxGeometry args={[0.15, 0.3, 0.1]} />
            </mesh>
        </group>

        {/* Tail */}
        <group position={[0, 0.8, -0.6]}>
            <mesh ref={tailRef} position={[0, 0.2, -0.2]} rotation={[0.5, 0, 0]} castShadow material={furYellow}>
                <boxGeometry args={[0.15, 0.15, 0.6]} />
            </mesh>
        </group>

        {/* Legs - Pivoted at top */}
        <group ref={frontLeftRef} position={[-0.25, 0.4, 0.45]}>
           <mesh position={[0, -0.4, 0]} castShadow material={furWhite}>
             <boxGeometry args={[0.2, 0.8, 0.2]} />
           </mesh>
        </group>
        
        <group ref={frontRightRef} position={[0.25, 0.4, 0.45]}>
           <mesh position={[0, -0.4, 0]} castShadow material={furWhite}>
             <boxGeometry args={[0.2, 0.8, 0.2]} />
           </mesh>
        </group>

        <group ref={backLeftRef} position={[-0.25, 0.4, -0.45]}>
           <mesh position={[0, -0.4, 0]} castShadow material={furWhite}>
             <boxGeometry args={[0.2, 0.8, 0.2]} />
           </mesh>
        </group>

        <group ref={backRightRef} position={[0.25, 0.4, -0.45]}>
           <mesh position={[0, -0.4, 0]} castShadow material={furWhite}>
             <boxGeometry args={[0.2, 0.8, 0.2]} />
           </mesh>
        </group>

      </group>
    </group>
  );
};