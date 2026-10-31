import gsap from 'gsap';
import { config } from '../config.js';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';
import { confetti } from '../fx/confetti.js';

export function initChapter7() {
  const cardsGrid = document.getElementById('movie-cards-grid');
  const ticketStub = document.getElementById('cinema-ticket-stub');
  const ticketMovieTitle = document.getElementById('ticket-movie-title');
  const vouchersContainer = document.getElementById('vouchers-container');

  // Render 3D Tilt Movie Cards
  if (cardsGrid) {
    cardsGrid.innerHTML = '';
    config.movieChoices.forEach((movie) => {
      const card = document.createElement('div');
      card.className = 'glass-card p-5 cursor-pointer select-none transition-all duration-300 hover:scale-[1.02] active:scale-98 relative overflow-hidden group';
      card.innerHTML = `
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">${movie.emoji}</span>
          <div>
            <h4 class="font-display text-lg text-cream">${movie.title}</h4>
            <span class="text-xs text-lavender font-medium">${movie.genre}</span>
          </div>
        </div>
        <p class="text-xs text-white/80 leading-relaxed">${movie.tagline}</p>
        <div class="mt-3 flex justify-end">
          <span class="text-xs px-3 py-1 rounded-full bg-white/10 group-hover:bg-hot-pink text-white transition-colors">
            Select Movie 🎟️
          </span>
        </div>
      `;

      card.addEventListener('click', () => {
        sound.playPop();
        haptics.medium();

        if (ticketStub && ticketMovieTitle) {
          ticketMovieTitle.textContent = movie.title;
          ticketStub.classList.remove('hidden');

          const rect = card.getBoundingClientRect();
          confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);

          // Ticket Print / Tear Animation
          gsap.fromTo(ticketStub,
            { y: 30, opacity: 0, scale: 0.9, rotation: -2 },
            { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.8)' }
          );
        }
      });

      cardsGrid.appendChild(card);
    });
  }

  // Render Birthday Vouchers
  if (vouchersContainer) {
    vouchersContainer.innerHTML = '';
    config.vouchers.forEach((v) => {
      const vCard = document.createElement('div');
      vCard.className = 'p-4 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between gap-3 cursor-pointer select-none transition-all hover:bg-white/15';
      vCard.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">${v.icon}</span>
          <div>
            <h4 class="font-medium text-sm text-cream">${v.title}</h4>
            <p class="text-xs text-white/70">${v.desc}</p>
          </div>
        </div>
        <button class="redeem-btn min-h-[38px] px-3.5 py-1.5 rounded-full bg-hot-pink/30 hover:bg-hot-pink text-xs font-semibold text-white border border-hot-pink/50 flex-shrink-0 transition-colors">
          Redeem
        </button>
      `;

      const btn = vCard.querySelector('.redeem-btn');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playCorrect();
        haptics.medium();
        btn.textContent = 'Claimed! 💕';
        btn.classList.remove('bg-hot-pink/30');
        btn.classList.add('bg-emerald-500', 'border-emerald-400');
        vCard.classList.add('opacity-75');

        const rect = btn.getBoundingClientRect();
        confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);
      });

      vouchersContainer.appendChild(vCard);
    });
  }
}

