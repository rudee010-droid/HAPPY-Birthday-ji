import gsap from 'gsap';
import { confetti } from '../fx/confetti.js';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';

export function initChapter0(lenis) {
  const giftBox = document.getElementById('gift-box');
  const openBtn = document.getElementById('open-gift-btn');
  const giftWrapper = document.getElementById('gift-box-wrapper');
  let hasOpened = false;

  const handleOpen = () => {
    if (hasOpened) return;
    hasOpened = true;

    // Unlock Web Audio & start ambient music
    sound.unlock();
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) soundIcon.textContent = '🔊';

    haptics.celebrate();
    sound.playPop();

    // Confetti burst from gift center
    const rect = giftBox.getBoundingClientRect();
    confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 90);

    // Lid Pop & Scale Up Animation
    gsap.timeline()
      .to(giftBox, {
        scale: 1.25,
        rotation: 12,
        y: -30,
        duration: 0.35,
        ease: 'back.out(2)'
      })
      .to(giftBox, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in'
      })
      .call(() => {
        // Smoothly scroll down into Chapter 1 (Hero)
        if (lenis) {
          const ch1 = document.getElementById('chapter-1');
          if (ch1) lenis.scrollTo(ch1, { duration: 1.8, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        }
      });
  };

  if (giftWrapper) giftWrapper.addEventListener('click', handleOpen);
  if (openBtn) openBtn.addEventListener('click', handleOpen);
}

