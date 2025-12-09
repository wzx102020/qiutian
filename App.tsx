import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Fingerprint } from 'lucide-react';
import { World } from './components/World';

// UI Overlay Component
const UIOverlay: React.FC<{ isReturning: boolean; toggleState: () => void }> = ({ isReturning, toggleState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-end items-end p-8 z-10">
      <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 mb-4 mr-4 pointer-events-auto shadow-xl border border-white/40">
        <button
          onClick={toggleState}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center 
            transition-all duration-500 ease-out transform active:scale-95
            shadow-[0_4px_14px_0_rgba(0,0,0,0.2)]
            ${isReturning 
              ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white ring-4 ring-orange-200' 
              : 'bg-white text-orange-500 hover:bg-orange-50 ring-4 ring-orange-100'}
          `}
          aria-label="Call Dog"
        >
          <div className={`transition-transform duration-500 ${isReturning ? 'scale-110' : 'scale-100'}`}>
            <Fingerprint size={48} strokeWidth={1.5} />
          </div>
          {isReturning && (
             <span className="absolute -top-2 -right-2 flex h-4 w-4">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
             </span>
          )}
        </button>
        <p className="mt-2 text-center text-xs font-bold text-amber-900/70 tracking-wider uppercase">
          {isReturning ? "Recall" : "Play"}
        </p>
      </div>
      
      <div className="absolute top-6 left-6 pointer-events-none">
        <h1 className="text-3xl font-black text-amber-800/80 drop-shadow-sm tracking-tight">
          Sunny <span className="text-orange-600">Walk</span>
        </h1>
        <p className="text-amber-900/50 text-sm font-medium">Interactive 3D Experience</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isReturning, setIsReturning] = useState(false);

  const toggleState = () => {
    setIsReturning((prev) => !prev);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-300 to-orange-100">
      <UIOverlay isReturning={isReturning} toggleState={toggleState} />
      
      <Canvas
        shadows
        camera={{ position: [8, 5, 8], fov: 45 }}
        dpr={[1, 2]} // Optimize for varying pixel ratios
      >
        <Suspense fallback={null}>
          <World isReturning={isReturning} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default App;