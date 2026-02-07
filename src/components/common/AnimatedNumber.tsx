import React, { memo, useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

/**
 * Animated number component that smoothly transitions between values.
 * Creates a "ticker" effect when numbers change.
 */
const AnimatedNumber: React.FC<AnimatedNumberProps> = memo(({
  value,
  duration = 500,
  formatValue = (v: number) => Math.round(v).toString(),
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip animation if this is the first render or value hasn't changed
    if (previousValue.current === value) {
      return;
    }

    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  // Update previous value ref when value changes
  useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return (
    <span className={className}>
      {formatValue(displayValue)}
    </span>
  );
});

AnimatedNumber.displayName = 'AnimatedNumber';

export default AnimatedNumber;
