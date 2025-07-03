
import React, { useState, useEffect } from 'react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  animationDuration: number;
  color: string;
  horizontalMovement: number;
}

const FloatingBubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const colors = [
    'bg-pink-300/40',
    'bg-blue-300/40',
    'bg-purple-300/40',
    'bg-green-300/40',
    'bg-yellow-300/40',
    'bg-indigo-300/40'
  ];

  useEffect(() => {
    const createBubble = () => {
      const newBubble: Bubble = {
        id: Math.random(),
        x: Math.random() * 100,
        y: 100,
        size: (Math.random() * 30 + 10) * 1.25, // 25% bigger
        animationDuration: Math.random() * 5 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        horizontalMovement: Math.random() * 60 - 30
      };
      
      setBubbles(prev => [...prev, newBubble]);
      
      // Remove bubble after animation completes
      setTimeout(() => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== newBubble.id));
      }, newBubble.animationDuration * 1000);
    };

    // Create initial bubbles
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createBubble(), i * 2000);
    }

    // Create new bubbles periodically
    const interval = setInterval(createBubble, 3000);

    return () => clearInterval(interval);
  }, []);

  const popBubble = (bubbleId: number) => {
    setBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
  };

  return (
    <>
      <style>
        {`
          @keyframes bubble-float-up {
            0% {
              bottom: -50px;
              opacity: 0;
              transform: translateX(0) scale(0);
            }
            10% {
              opacity: 0.7;
              transform: translateX(0) scale(1);
            }
            90% {
              opacity: 0.7;
              transform: translateX(var(--horizontal-move)) scale(1);
            }
            100% {
              bottom: 100%;
              opacity: 0;
              transform: translateX(var(--horizontal-move)) scale(0.8);
            }
          }
        `}
      </style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className={`absolute rounded-full cursor-pointer pointer-events-auto transition-all duration-200 hover:scale-110 ${bubble.color}`}
            style={{
              left: `${bubble.x}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animation: `bubble-float-up ${bubble.animationDuration}s ease-in-out forwards`,
              '--horizontal-move': `${bubble.horizontalMovement}px`
            } as React.CSSProperties}
            onClick={() => popBubble(bubble.id)}
          />
        ))}
      </div>
    </>
  );
};

export default FloatingBubbles;
