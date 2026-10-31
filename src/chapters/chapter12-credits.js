import gsap from 'gsap';
import { config } from '../config.js';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';
import { confetti } from '../fx/confetti.js';

export function initChapter12(lenis) {
  const replayBtn = document.getElementById('btn-replay-journey');
  const creditsTitle = document.getElementById('credits-title');
  const secretModal = document.getElementById('secret-modal');
  const secretText = document.getElementById('secret-modal-text');
  const closeSecretBtn = document.getElementById('close-secret-modal-btn');

  // Replay Journey
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      sound.playPop();
      haptics.medium();
      if (lenis) {
        lenis.scrollTo(0, { duration: 2.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Secret Message Easter Egg (3 Taps on Title)
  let tapCount = 0;
  let tapTimer = null;

  if (creditsTitle) {
    creditsTitle.addEventListener('click', () => {
      tapCount++;
      sound.playPluck(800 + tapCount * 120, 0.15, 0.3);
      haptics.light();

      // Gentle wobble feedback
      gsap.fromTo(creditsTitle, { scale: 0.96 }, { scale: 1.04, duration: 0.15, yoyo: true, repeat: 1 });

      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        tapCount = 0;
      }, 1000);

      if (tapCount >= 3) {
        tapCount = 0;
        sound.playCorrect();
        haptics.celebrate();

        if (secretText) secretText.textContent = config.secretMessage;
        if (secretModal) {
          secretModal.classList.remove('opacity-0', 'pointer-events-none');
          secretModal.classList.add('opacity-100', 'pointer-events-auto');

          confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 80);
        }
      }
    });
  }

  if (closeSecretBtn && secretModal) {
    closeSecretBtn.addEventListener('click', () => {
      secretModal.classList.add('opacity-0', 'pointer-events-none');
      secretModal.classList.remove('opacity-100', 'pointer-events-auto');
    });
  }
}

