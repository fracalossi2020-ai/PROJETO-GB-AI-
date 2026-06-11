'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useCelebration() {
  const celebrate = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#ff9607', '#ff0080', '#22c55e', '#3b82f6', '#eab308'];

    // Fogos centrais
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      ticks: 200,
      gravity: 0.8,
      scalar: 1.2,
    });

    // Fogos laterais alternados
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
        ticks: 150,
        gravity: 0.9,
        scalar: 1.1,
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
        ticks: 150,
        gravity: 0.9,
        scalar: 1.1,
      });
    }, 400);

    // Fogos de cima
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.4 },
        colors,
        ticks: 250,
        gravity: 0.7,
        scalar: 1.3,
        shapes: ['circle', 'square'],
      });
    }, 600);
  }, []);

  return celebrate;
}
