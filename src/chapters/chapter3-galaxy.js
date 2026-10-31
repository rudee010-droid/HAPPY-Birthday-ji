import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '../config.js';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';

export function initChapter3(worldScene) {
  const section = document.getElementById('chapter-3');
  const counter = document.getElementById('galaxy-counter');
  const caption = document.getElementById('galaxy-caption');
  const activeImg = document.getElementById('active-galaxy-img');
  const previewBox = document.getElementById('galaxy-photo-preview');

  // Fullscreen Modal Elements
  const modal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-image-src');
  const modalCaption = document.getElementById('modal-caption');
  const closeBtn = document.getElementById('close-photo-modal-btn');
  const modalWrapper = document.getElementById('modal-image-wrapper');

  // Photos 02 to 09 correspond to indices 1 to 8 in config.photos
  const galaxyPhotos = config.photos.slice(1, 9);
  let currentPhotoIdx = 0;

  // Update HUD
  const setPhoto = (index) => {
    if (index === currentPhotoIdx && activeImg.src.includes(galaxyPhotos[index].path)) return;
    currentPhotoIdx = index;
    const item = galaxyPhotos[index];
    if (counter) counter.textContent = `${index + 1} / ${galaxyPhotos.length}`;
    if (caption) {
      gsap.to(caption, {
        opacity: 0,
        y: -5,
        duration: 0.15,
        onComplete: () => {
          caption.textContent = item.caption;
          gsap.to(caption, { opacity: 1, y: 0, duration: 0.25 });
        }
      });
    }
    if (activeImg) {
      activeImg.src = item.path;
      activeImg.style.objectPosition = item.objectPosition || 'center center';
    }
  };

  // Pinned scrub timeline
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=200%',
    pin: true,
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress;
      const idx = Math.min(Math.floor(p * galaxyPhotos.length), galaxyPhotos.length - 1);
      setPhoto(idx);
    }
  });

  // Modal Open Handler
  const openModal = () => {
    const item = galaxyPhotos[currentPhotoIdx];
    if (!item) return;

    sound.playChime();
    haptics.light();

    modalImg.src = item.path;
    modalImg.style.objectPosition = item.objectPosition || 'center center';
    modalCaption.textContent = item.caption;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');

    gsap.fromTo(modalWrapper, 
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' }
    );
  };

  const closeModal = () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
  };

  if (previewBox) previewBox.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Interactive Ripple in Modal on Tap
  if (modalWrapper) {
    modalWrapper.addEventListener('pointerdown', (e) => {
      const rect = modalWrapper.getBoundingClientRect();
      const u = (e.clientX - rect.left) / rect.width;
      const v = (e.clientY - rect.top) / rect.height;

      // Create DOM ripple effect
      const ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      ripple.style.left = `${u * 100}%`;
      ripple.style.top = `${v * 100}%`;
      ripple.style.width = '120px';
      ripple.style.height = '120px';
      modalWrapper.appendChild(ripple);

      sound.playPluck(880, 0.15, 0.5);
      haptics.light();

      setTimeout(() => ripple.remove(), 800);
    });
  }
}

