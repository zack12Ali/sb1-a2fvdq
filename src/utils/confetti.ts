import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#06b6d4', '#0891b2', '#0e7490'],
    ticks: 200,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['circle']
  });
};