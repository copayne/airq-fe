import React, { memo, useEffect, useState, useCallback } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

const COLORS = [
  '#137547', // airq-primary (green)
  '#22c55e', // bright green
  '#10b981', // emerald
  '#34d399', // light emerald
  '#6ee7b7', // mint
];

/**
 * Lightweight confetti celebration component.
 * Triggers a burst of confetti particles when active.
 */
const Confetti: React.FC<ConfettiProps> = memo(({
  active,
  duration = 3000,
  particleCount = 50,
  onComplete,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const createPieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < particleCount; i++) {
      newPieces.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20, // Start near center
        y: 50,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        size: 6 + Math.random() * 6,
        velocityX: (Math.random() - 0.5) * 15,
        velocityY: -10 - Math.random() * 10,
      });
    }
    return newPieces;
  }, [particleCount]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    setPieces(createPieces());

    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration, createPieces, onComplete]);

  useEffect(() => {
    if (pieces.length === 0) return;

    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // Normalize to ~60fps
      lastTime = currentTime;

      setPieces(prevPieces =>
        prevPieces
          .map(piece => ({
            ...piece,
            x: piece.x + piece.velocityX * deltaTime * 0.5,
            y: piece.y + piece.velocityY * deltaTime * 0.5,
            velocityY: piece.velocityY + 0.5 * deltaTime, // Gravity
            rotation: piece.rotation + 5 * deltaTime,
          }))
          .filter(piece => piece.y < 120) // Remove pieces that fall off screen
      );

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [pieces.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active && pieces.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
});

Confetti.displayName = 'Confetti';

export default Confetti;
