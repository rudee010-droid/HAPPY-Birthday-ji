import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitTextToChars, scrambleText } from '../fx/split-text.js';
import { config } from '../config.js';

export function initChapter1() {
  const title = document.getElementById('hero-title');
  const subtitle = document.getElementById('hero-subtitle');
  const scrambleDate = document.getElementById('scramble-date');
  const marquee = document.getElementById('hero-marquee');
  const portrait = document.getElementById('hero-portrait-frame');

  // Split title characters
  if (title) {
    const chars = splitTextToChars(title);
    gsap.from(chars, {
      y: '120%',
      opacity: 0,
      rotationX: -45,
      duration: 1.0,
      stagger: 0.035,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#chapter-1',
        start: 'top 80%'
      }
    });
  }

  // Scramble text chip
  if (scrambleDate) {
    ScrollTrigger.create({
      trigger: '#chapter-1',
      start: 'top 70%',
      onEnter: () => {
        scrambleText(scrambleDate, `${config.dob} · ${config.zodiac}`, 1.2);
      }
    });
  }

  // Marquee scroll acceleration
  if (marquee) {
    gsap.to(marquee, {
      xPercent: -35,
      ease: 'none',
      scrollTrigger: {
        trigger: '#chapter-1',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2
      }
    });
  }

  // Floating Hero Portrait
  if (portrait) {
    gsap.to(portrait, {
      y: -25,
      rotation: 1.5,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
}

