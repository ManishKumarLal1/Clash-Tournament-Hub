import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, SplitText, CustomEase);
}

// Custom easings — Awwwards signature feel
CustomEase.create('luxe', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('snap', 'M0,0 C0.5,0 0.5,1 1,1');

export { gsap, useGSAP, ScrollTrigger, Flip, SplitText };