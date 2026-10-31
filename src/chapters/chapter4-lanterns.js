import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '../config.js';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';

export function initChapter4() {
  const section = document.getElementById('chapter-4');
  const track = document.getElementById('lantern-track');
  if (!section || !track) return;

  // Populate lantern cards from config.reasons
  track.innerHTML = '';
  config.reasons.forEach((reason, i) => {
    const card = document.createElement('div');
    card.className = 'lantern-card flex-shrink-0 w-72 sm:w-80 p-6 rounded-3xl glass-card border border-white/25 shadow-glass space-y-3 cursor-pointer select-none transition-transform duration-300';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="w-8 h-8 rounded-full bg-peach/20 border border-peach/40 flex items-center justify-center text-sm font-bold text-cream">
          #${i + 1}
        </span>
        <span class="text-2xl filter drop-shadow">🏮</span>
      </div>
      <h3 class="font-display text-xl text-cream">${reason.title}</h3>
      <p class="text-xs sm:text-sm text-white/90 leading-relaxed">${reason.text}</p>
    `;

    card.addEventListener('click', () => {
      sound.playPluck(523.25 + i * 40, 0.2, 0.8);
      haptics.light();
      gsap.fromTo(card, { scale: 0.95 }, { scale: 1.05, duration: 0.25, yoyo: true, repeat: 1 });
    });

    track.appendChild(card);
  });

  // Pin section and convert vertical scroll into horizontal movement
  const totalCards = config.reasons.length;
  const cardWidth = 320; // Approx card width + gap
  const travelDistance = Math.max(0, (totalCards - 1) * cardWidth);

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${travelDistance * 1.5}`,
    pin: true,
    scrub: 1.2,
    anticipatePin: 1,
    onUpdate: (self) => {
      const xOffset = -self.progress * travelDistance;
      gsap.set(track, { x: xOffset });
    }
  });
}

