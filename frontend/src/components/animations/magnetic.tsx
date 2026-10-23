'use client';
import { useRef, useEffect, ReactNode } from 'react';
import { gsap } from '@/lib/gsap/register';

export function Magnetic({ children, strength = 0.5 }: { children: ReactNode, strength?: number }) {
  const magneticRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const xTo = gsap.quickTo(magneticRef.current, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    const yTo = gsap.quickTo(magneticRef.current, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    const innerXTo = gsap.quickTo(innerRef.current, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    const innerYTo = gsap.quickTo(innerRef.current, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = magneticRef.current!.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      xTo(x * strength);
      yTo(y * strength);
      innerXTo(x * (strength * 0.4));
      innerYTo(y * (strength * 0.4));
    };

    const handleMouseLeave = () => {
      xTo(0); yTo(0);
      innerXTo(0); innerYTo(0);
    };

    const el = magneticRef.current;
    el?.addEventListener('mousemove', handleMouseMove);
    el?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el?.removeEventListener('mousemove', handleMouseMove);
      el?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={magneticRef} className="inline-block">
      <div ref={innerRef}>{children}</div>
    </div>
  );
}