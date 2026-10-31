import gsap from 'gsap';
import { config } from '../config.js';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';
import { confetti } from '../fx/confetti.js';

export function initChapter11() {
  const form = document.getElementById('add-wish-form');
  const authorInput = document.getElementById('wish-author');
  const messageInput = document.getElementById('wish-message');
  const list = document.getElementById('wishes-list');

  const STORAGE_KEY = 'aastha_bundi_birthday_wishes';

  const loadWishes = () => {
    let saved = [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) saved = JSON.parse(data);
    } catch (e) {
      console.warn("localStorage unavailable:", e);
    }
    return [...config.wishesSeed, ...saved];
  };

  const saveWish = (item) => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : [];
      parsed.unshift(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  };

  const renderWishes = () => {
    if (!list) return;
    list.innerHTML = '';
    const wishes = loadWishes();

    wishes.forEach((w) => {
      const item = document.createElement('div');
      item.className = 'p-4 rounded-2xl glass-card space-y-1.5 transition-all';
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-semibold text-sm text-cream">${w.name}</span>
          <span class="text-[10px] text-white/50">${w.time || 'Moments ago'}</span>
        </div>
        <p class="text-xs sm:text-sm text-white/90 leading-relaxed">${w.message}</p>
      `;
      list.appendChild(item);
    });
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = authorInput.value.trim();
      const msg = messageInput.value.trim();

      if (!name || !msg) return;

      const newWish = {
        name: name,
        message: msg,
        time: 'Just now'
      };

      saveWish(newWish);
      authorInput.value = '';
      messageInput.value = '';

      sound.playCorrect();
      haptics.medium();

      const rect = form.getBoundingClientRect();
      confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);

      renderWishes();

      // Animate top item drop-in
      if (list && list.firstElementChild) {
        gsap.from(list.firstElementChild, {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: 'back.out(2)'
        });
      }
    });
  }

  renderWishes();
}

