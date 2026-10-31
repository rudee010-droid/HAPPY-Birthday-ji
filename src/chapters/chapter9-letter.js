import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '../config.js';
import { runTypewriter } from '../fx/split-text.js';

export function initChapter9() {
  const section = document.getElementById('chapter-9');
  const letterBody = document.getElementById('typewriter-letter-body');
  const cursor = document.getElementById('typewriter-cursor');
  let hasTyped = false;

  if (!section || !letterBody) return;

  ScrollTrigger.create({
    trigger: section,
    start: 'top 65%',
    onEnter: () => {
      if (hasTyped) return;
      hasTyped = true;
      runTypewriter(letterBody, config.loveLetter, () => {
        if (cursor) cursor.style.display = 'none';
      });
    }
  });
}

