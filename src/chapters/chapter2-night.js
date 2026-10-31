import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '../config.js';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';

export function initChapter2(worldScene) {
  const section = document.getElementById('chapter-2');
  const heading = document.getElementById('scorpio-heading');
  const bodyText = document.getElementById('scorpio-body-text');
  const rainBtn = document.getElementById('star-burst-trigger-btn');

  if (rainBtn) {
    rainBtn.addEventListener('click', () => {
      sound.playChime(true);
      haptics.medium();
      if (worldScene && worldScene.stars) {
        worldScene.stars.triggerStarRain();
      }
    });
  }

  const lines = config.scorpioLines;

  // Pin section and scrub text transitions
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=100%',
    pin: true,
    scrub: 1.0,
    onUpdate: (self) => {
      const p = self.progress;
      let lineIdx = 0;
      if (p > 0.66) lineIdx = 2;
      else if (p > 0.33) lineIdx = 1;

      if (heading && lines[lineIdx]) heading.textContent = lines[lineIdx].year;
      if (bodyText && lines[lineIdx]) bodyText.textContent = lines[lineIdx].text;
    }
  });
}

