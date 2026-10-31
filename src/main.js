import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { WorldScene } from './world/scene.js';
import { sound } from './fx/sound.js';
import { sparkles } from './fx/sparkles.js';

import { initChapter0 } from './chapters/chapter0-gift.js';
import { initChapter1 } from './chapters/chapter1-hero.js';
import { initChapter2 } from './chapters/chapter2-night.js';
import { initChapter3 } from './chapters/chapter3-galaxy.js';
import { initChapter4 } from './chapters/chapter4-lanterns.js';
import { initChapter5 } from './chapters/chapter5-quiz.js';
import { initChapter6 } from './chapters/chapter6-question.js';
import { initChapter7 } from './chapters/chapter7-movie.js';
import { initChapter8 } from './chapters/chapter8-scratch.js';
import { initChapter9 } from './chapters/chapter9-letter.js';
import { initChapter10 } from './chapters/chapter10-cake.js';
import { initChapter11 } from './chapters/chapter11-wishes.js';
import { initChapter12 } from './chapters/chapter12-credits.js';

gsap.registerPlugin(ScrollTrigger);

// 1. Performance Tier Detection
function detectPerformanceTier() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (cores < 4 || memory < 3) return 'low';
  if (isMobile && (cores <= 6 || memory <= 4)) return 'medium';
  return 'high';
}

const tier = detectPerformanceTier();
console.log(`[Device Tier Detected]: ${tier}`);

// 2. Initialize Three.js 3D World
const canvas = document.getElementById('webgl-canvas');
const worldScene = new WorldScene(canvas, tier);

// Fallback to CSS sky if WebGL fails
if (!worldScene.isSupported) {
  const fallback = document.getElementById('css-sky-fallback');
  if (fallback) fallback.classList.remove('opacity-0');
}

// 3. Initialize Lenis Smooth Scroll & Sync with ScrollTrigger
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.3
});

lenis.on('scroll', (e) => {
  ScrollTrigger.update();
  
  // Calculate global scroll progress 0.0 to 1.0
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? e.scroll / maxScroll : 0;
  
  if (worldScene) {
    worldScene.setScroll(progress, e.velocity || 0);
  }

  // Update top progress bar
  const progressBar = document.getElementById('scroll-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progress * 100}%`;
  }

  // Hide idle prompt on scroll
  resetIdleTimer();
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
  if (worldScene) {
    worldScene.render();
  }
});
gsap.ticker.lagSmoothing(0);

// 4. Loader & Asset Preloading
async function preloadAssets() {
  const loaderPercent = document.getElementById('loader-percent');
  const loaderFill = document.getElementById('loader-fill');
  const loaderContainer = document.getElementById('loader-container');

  const photosToPreload = [
    '/photos/01.jpg',
    '/photos/02.jpg',
    '/photos/03.jpg',
    '/photos/10.jpg'
  ];

  let loaded = 0;
  const total = photosToPreload.length + 1; // +1 for fonts

  const updateProgress = () => {
    loaded++;
    const pct = Math.round((loaded / total) * 100);
    if (loaderPercent) loaderPercent.textContent = `${pct}%`;
    if (loaderFill) loaderFill.style.width = `${pct}%`;

    if (loaded >= total) {
      setTimeout(() => {
        if (loaderContainer) {
          gsap.to(loaderContainer, { opacity: 0, duration: 0.5, onComplete: () => loaderContainer.remove() });
        }
      }, 300);
    }
  };

  photosToPreload.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = updateProgress;
    img.onerror = updateProgress;
  });

  if (document.fonts) {
    document.fonts.ready.then(updateProgress).catch(updateProgress);
  } else {
    updateProgress();
  }
}

preloadAssets();

// 5. Sound & Mute Toggle Control
const soundBtn = document.getElementById('sound-toggle-btn');
const soundIcon = document.getElementById('sound-icon');

if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    const isUnmuted = sound.toggle();
    if (soundIcon) soundIcon.textContent = isUnmuted ? '🔊' : '🔇';
  });
}

// 6. Chapter Dots Navigation & Current Label HUD
const chapterSections = document.querySelectorAll('main > section');
const chapterNav = document.getElementById('chapter-nav-dots');
const chapterLabel = document.getElementById('current-chapter-label');

if (chapterNav) {
  chapterNav.innerHTML = '';
  chapterSections.forEach((sec, idx) => {
    const dot = document.createElement('button');
    dot.className = 'w-2.5 h-2.5 rounded-full bg-white/30 hover:bg-hot-pink transition-all';
    dot.setAttribute('aria-label', `Navigate to ${sec.dataset.chapterTitle || `Chapter ${idx}`}`);
    dot.addEventListener('click', () => {
      lenis.scrollTo(sec, { duration: 1.5 });
    });
    chapterNav.appendChild(dot);

    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => updateActiveChapter(idx, sec.dataset.chapterTitle),
      onEnterBack: () => updateActiveChapter(idx, sec.dataset.chapterTitle)
    });
  });
}

function updateActiveChapter(idx, title) {
  if (chapterLabel && title) {
    chapterLabel.textContent = title;
  }
  if (chapterNav) {
    Array.from(chapterNav.children).forEach((dot, i) => {
      if (i === idx) {
        dot.className = 'w-2.5 h-6 rounded-full bg-hot-pink shadow-glow-pink transition-all';
      } else {
        dot.className = 'w-2.5 h-2.5 rounded-full bg-white/30 hover:bg-hot-pink transition-all';
      }
    });
  }
}

// 7. Idle Prompt Hint
let idleTimer = null;
const idleHint = document.getElementById('idle-scroll-hint');

function resetIdleTimer() {
  if (idleHint) idleHint.classList.remove('opacity-100');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (window.scrollY < document.documentElement.scrollHeight - window.innerHeight - 100) {
      if (idleHint) idleHint.classList.add('opacity-100');
    }
  }, 6000);
}
resetIdleTimer();

// 8. Initialize FX
sparkles.init();

// 9. Initialize All 13 Chapters
initChapter0(lenis);
initChapter1();
initChapter2(worldScene);
initChapter3(worldScene);
initChapter4();
initChapter5();
initChapter6();
initChapter7();
initChapter8();
initChapter9();
initChapter10(worldScene);
initChapter11();
initChapter12(lenis);

// Refresh ScrollTrigger after DOM ready
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

