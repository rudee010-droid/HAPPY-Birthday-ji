import gsap from 'gsap';
import { config } from '../config.js';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';
import { confetti } from '../fx/confetti.js';

export function initChapter8() {
  const container = document.getElementById('scratch-cards-container');
  if (!container) return;

  container.innerHTML = '';
  config.scratchCards.forEach((cardData, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative w-full rounded-2xl overflow-hidden glass-card p-4 min-h-[110px] select-none flex items-center justify-center';

    // Secret content behind the scratch layer
    const secretContent = document.createElement('div');
    secretContent.className = 'w-full text-center px-4 py-2';
    secretContent.innerHTML = `
      <h4 class="text-xs uppercase tracking-wider text-peach font-semibold mb-1">${cardData.title}</h4>
      <p class="text-sm sm:text-base font-medium text-white/95">${cardData.secret}</p>
    `;
    wrapper.appendChild(secretContent);

    // Scratch canvas overlay
    const canvas = document.createElement('canvas');
    canvas.className = 'scratch-canvas absolute inset-0 w-full h-full';
    wrapper.appendChild(canvas);

    container.appendChild(wrapper);

    // Initialize Canvas Scratch Mechanics
    setupScratchCanvas(canvas, wrapper, idx);
  });
}

function setupScratchCanvas(canvas, wrapper, index) {
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let isRevealed = false;
  let checkThrottle = 0;

  const initFoil = () => {
    const rect = wrapper.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Metallic pastel gradient foil
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#B79CFF');
    grad.addColorStop(0.5, '#FFD9E8');
    grad.addColorStop(1, '#FFC9A8');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative foil pattern / text
    ctx.fillStyle = '#14102E';
    ctx.font = 'bold 14px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Rub with finger to scratch! ✨', canvas.width / 2, canvas.height / 2);
  };

  setTimeout(initFoil, 100);
  window.addEventListener('resize', initFoil);

  const scratch = (x, y) => {
    if (isRevealed) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    checkThrottle++;
    if (checkThrottle % 12 === 0) {
      sound.playPluck(600 + Math.random() * 200, 0.05, 0.05);
      haptics.light();
      checkPercentage();
    }
  };

  const checkPercentage = () => {
    if (isRevealed) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let transparentCount = 0;
    const step = 32; // sampled step for performance

    for (let i = 3; i < data.length; i += step * 4) {
      if (data[i] === 0) transparentCount++;
    }

    const totalSampled = data.length / (step * 4);
    const ratio = transparentCount / totalSampled;

    if (ratio > 0.50) {
      isRevealed = true;
      sound.playCorrect();
      haptics.medium();

      const rect = wrapper.getBoundingClientRect();
      confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);

      // Fade out canvas
      gsap.to(canvas, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          canvas.remove();
        }
      });
    }
  };

  // Pointer / Touch Handlers
  const getCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    const { x, y } = getCoords(e);
    scratch(x, y);
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    scratch(x, y);
  });

  window.addEventListener('pointerup', () => {
    isDrawing = false;
  });
}

