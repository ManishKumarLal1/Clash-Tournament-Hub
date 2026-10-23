'use client';
import { useRef, ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap/register';

export function ScrollReveal({ children, className = '', delay = 0 }: { children: ReactNode, className?: string, delay?: number }) {
  const elRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!elRef.current) return;

    gsap.from(elRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: elRef.current,
        start: 'top 85%',
      }
    });
  }, { scope: elRef });

  return (
    <div ref={elRef} className={className}>
      {children}
    </div>
  );
}