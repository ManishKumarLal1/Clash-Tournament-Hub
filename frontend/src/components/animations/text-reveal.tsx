'use client';
import { useRef, ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText } from '@/lib/gsap/register';

interface TextRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
}

export function TextReveal({ children, delay = 0, className = '', as: Tag = 'div' }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Split text into lines and words
    const split = new SplitText(containerRef.current, { type: 'lines,words', linesClass: 'overflow-hidden' });

    // Animate from below
    gsap.from(split.words, {
      y: '110%',
      rotationZ: 2,
      opacity: 0,
      duration: 1.2,
      ease: 'luxe',
      stagger: 0.03,
      delay,
    });

    return () => split.revert(); // Cleanup
  }, { scope: containerRef });

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  );
}