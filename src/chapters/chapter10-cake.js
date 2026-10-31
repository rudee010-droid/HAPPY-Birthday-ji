import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';
import { confetti } from '../fx/confetti.js';

export function initChapter10(worldScene) {
  const flamesRow = document.getElementById('candle-flames-row');
  const hintText = document.getElementById('candle-status-hint');
  const banner = document.getElementById('wish-blown-banner');

  if (!flamesRow) return;

  flamesRow.innerHTML = '';
  let blownCount = 0;
  const total = 5;

  for (let i = 0; i < total; i++) {
    const btn = document.createElement('button');
    btn.className = 'w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 border border-white/25 flex flex-col items-center justify-center transition-all select-none focus:outline-none focus:ring-2 focus:ring-hot-pink';
    btn.setAttribute('aria-label', `Blow out candle ${i + 1}`);
    btn.innerHTML = `
      <span class="flame-icon text-2xl filter drop-shadow animate-pulse">🔥</span>
      <span class="text-[10px] text-white/60 font-mono mt-0.5">${i + 1}</span>
    `;

    btn.addEventListener('click', () => {
      if (btn.classList.contains('blown')) return;
      btn.classList.add('blown', 'opacity-40', 'bg-black/20');
      btn.querySelector('.flame-icon').textContent = '💨';

      blownCount++;
      if (worldScene && worldScene.cakeIsland) {
        worldScene.cakeIsland.blowCandle(i);
      } else {
        sound.playCandleBlow();
        haptics.heartbeat();
      }

      if (hintText) {
        const remaining = total - blownCount;
        hintText.textContent = remaining > 0 ? `${remaining} candle${remaining > 1 ? 's' : ''} remaining! 🕯️` : "All wishes launched into the stars! 🌠";
      }

      if (blownCount === total) {
        if (banner) banner.classList.remove('hidden');
        confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 100);
        confetti.rain(2000);
        if (worldScene && worldScene.fireworks) {
          worldScene.fireworks.showGrandFinale(10);
        }
      }
    });

    flamesRow.appendChild(btn);
  }
}

