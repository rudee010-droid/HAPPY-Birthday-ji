import gsap from 'gsap';
import { confetti } from '../fx/confetti.js';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';

export function initChapter6() {
  const yesBtn = document.getElementById('btn-love-yes');
  const noBtn = document.getElementById('btn-love-no');
  const actionsArea = document.getElementById('question-actions-area');
  const resultBox = document.getElementById('love-confession-result');

  let dodgeCount = 0;
  const funnyLabels = [
    "Are you sure? 🥺",
    "Wrong button! 🙈",
    "Nice try, Bundi!",
    "Error 404: No allowed!",
    "Finger slipped? 🤭"
  ];

  const dodgeNoButton = () => {
    dodgeCount++;
    sound.playPluck(700, 0.15, 0.2);
    haptics.light();

    if (actionsArea && noBtn) {
      const areaRect = actionsArea.getBoundingClientRect();
      const btnRect = noBtn.getBoundingClientRect();

      const maxX = areaRect.width - btnRect.width - 20;
      const maxY = areaRect.height - btnRect.height - 10;

      const randomX = (Math.random() - 0.5) * maxX;
      const randomY = (Math.random() - 0.5) * maxY;

      gsap.to(noBtn, {
        x: randomX,
        y: randomY,
        duration: 0.25,
        ease: 'back.out(2)'
      });

      // Change label & shrink slightly after multiple dodges
      noBtn.textContent = funnyLabels[dodgeCount % funnyLabels.length];
      if (dodgeCount > 3) {
        gsap.to(noBtn, { scale: Math.max(0.6, 1 - dodgeCount * 0.08), duration: 0.2 });
      }
    }
  };

  if (noBtn) {
    noBtn.addEventListener('pointerenter', dodgeNoButton);
    noBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dodgeNoButton();
    });
    noBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      dodgeNoButton();
    }, { passive: false });
  }

  // Yes Button Handler
  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      sound.playCorrect();
      haptics.heartbeat();

      const rect = yesBtn.getBoundingClientRect();
      confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
      confetti.rain(1500);

      // Hide actions, show confession
      if (actionsArea) actionsArea.classList.add('hidden');
      if (resultBox) resultBox.classList.remove('hidden');

      gsap.fromTo(resultBox,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    });
  }
}

