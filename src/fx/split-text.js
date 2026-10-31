import gsap from 'gsap';
import { sound } from './sound.js';

export function splitTextToChars(element) {
  if (!element) return [];
  const text = element.innerText;
  element.innerHTML = '';
  const charElements = [];

  const words = text.split(' ');
  words.forEach((word, wIdx) => {
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';

    for (let char of word) {
      const maskSpan = document.createElement('span');
      maskSpan.className = 'char-mask';

      const innerSpan = document.createElement('span');
      innerSpan.className = 'char-inner';
      innerSpan.textContent = char;

      maskSpan.appendChild(innerSpan);
      wordSpan.appendChild(maskSpan);
      charElements.push(innerSpan);
    }

    element.appendChild(wordSpan);
    if (wIdx < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }
  });

  return charElements;
}

export function scrambleText(element, finalString, duration = 1.2) {
  if (!element) return;
  const chars = '0123456789♏✨★☆*#%@';
  const length = finalString.length;
  let frame = 0;
  const totalFrames = Math.round(duration * 60);

  const interval = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    let output = '';

    for (let i = 0; i < length; i++) {
      if (finalString[i] === ' ' || finalString[i] === '·') {
        output += finalString[i];
      } else if (progress * length > i) {
        output += finalString[i];
      } else {
        output += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    element.textContent = output;

    if (frame >= totalFrames) {
      clearInterval(interval);
      element.textContent = finalString;
    }
  }, 1000 / 60);
}

export function runTypewriter(container, fullText, onComplete = null) {
  if (!container) return;
  container.innerHTML = '';
  let idx = 0;
  const speed = 25; // ms per char

  function typeChar() {
    if (idx < fullText.length) {
      const char = fullText[idx];
      if (char === '\n') {
        container.appendChild(document.createElement('br'));
      } else {
        const span = document.createElement('span');
        span.textContent = char;
        // Highlight Aastha and Bundi
        container.appendChild(span);
      }

      if (idx % 3 === 0 && char !== ' ' && char !== '\n') {
        sound.playTypewriter();
      }

      idx++;
      setTimeout(typeChar, speed);
    } else {
      if (onComplete) onComplete();
    }
  }

  typeChar();
}

