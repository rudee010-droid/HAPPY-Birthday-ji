# 🎂 Happy Birthday Aastha (Bundi)! 🍬
### *An Awwwards-Level Cinematic, Scroll-Driven 3D Interactive Journey*
**Handcrafted with all my love by Laddu 🍬 for Bundi aka Aastha**

---

## 🌟 The Experience: "The Longest Night, The Brightest Morning"

This website is designed as a continuous 3D interactive film that unfolds as she scrolls on her phone. From the moment she taps open the bouncing pink gift box, the camera ascends into a pastel sunset sky, flies through the star-studded Scorpio constellation of the night she was born (1 November 2005), travels through an 8-photo memory galaxy, sails down a glowing river of lanterns, challenges her with a playful arcade quiz, tests her with an elusive dodging "No" button, prints movie date tickets, lets her scratch secret prize cards, streams a handwritten love letter, descends onto a floating 3D birthday cake island where she blows out 5 flickering candles, and launches a fireworks show into a golden sunrise new year.

---

## 📱 Phone-First Architecture
Designed primarily for mobile screens (`390×844`, `360×640`, `412×915`, `430×932`, landscape, and tablet).
- **Responsive Layout**: Fluid scales with `clamp()`, `rem`, and `%` (no fixed pixel widths).
- **Safe-Area Insets**: Proper `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` everywhere.
- **Touch-Optimized Targets**: Every interactive button and card has a minimum hit target of `48×48px`.
- **Keyboard Protection**: Inputs use `16px` font size so iOS Safari never zooms uncontrollably.
- **Desktop Adaptation**: On wider screens (> 1024px), content centers in a sleek 480px glass column while the 3D WebGL cosmos spans the full viewport.
- **Dynamic Performance Tiers**:
  - Automatically assesses device hardware concurrency & frame duration.
  - Automatically adapts resolution (DPR) to sustain a silky 60fps even on mid-range phones.
  - Pauses render loop when tab is hidden or inactive.
- **Reduced Motion & No-WebGL Graceful Fallbacks**:
  - Full support for `prefers-reduced-motion` and systems without WebGL (smooth CSS gradient sky fallback).

---

## 📁 Project Structure

```
d:\B-day/
├── index.html                  # Viewport-fit=cover, semantic HTML5, safe-area wrappers
├── package.json                # Dependencies: three, gsap, lenis, tailwindcss, vite
├── vite.config.js              # Vite bundler configuration
├── tailwind.config.js          # Custom colors (blush, hot-pink, lavender, peach, cream, plum, midnight)
├── src/
│   ├── config.js               # ⭐ ALL EDITABLE CONTENT (text, photos, quiz, letter, vouchers, wishes)
│   ├── main.js                 # App bootstrap, Lenis + ScrollTrigger sync, performance tiering
│   ├── style.css               # Glassmorphic tokens, safe-area utilities, animations
│   ├── world/
│   │   ├── scene.js            # Three.js WebGLRenderer, lights, dynamic resolution scaler
│   │   ├── camera-rig.js       # CatmullRomCurve3 spline path & lookAt lerp + pointer parallax
│   │   ├── sky.js              # Full-screen gradient ShaderMaterial (sunset -> dusk -> night -> dawn)
│   │   ├── stars.js            # Scorpius constellation lines, twinkling starfield, pulsing Antares heart
│   │   ├── balloons.js         # InstancedMesh glossy balloons & floating hearts
│   │   ├── photo-meshes.js     # Floating framed portrait (Hero) & 8 spiral memory galaxy meshes
│   │   ├── lanterns.js         # Floating paper lanterns with inner glow points & fireflies
│   │   ├── cake.js             # Procedural 3D cake island, tiered cylinders, icing drips, 5 candles
│   │   └── fireworks.js        # GPU particle fireworks bursts with physics & fading glow
│   ├── shaders/
│   │   ├── sky.frag            # Twilight/night/sunrise gradient blending with simplex noise clouds & aurora
│   │   ├── sky.vert            # Fullscreen quad vertex shader
│   │   ├── photo.frag          # Photo shader with rim glow, touch ripple wave, chromatic aberration
│   │   └── photo.vert          # Vertex shader with scroll stretch
│   ├── chapters/
│   │   ├── chapter0-gift.js    # Chapter 0: 3D gift unboxing, lid pop, audio unlock, confetti burst
│   │   ├── chapter1-hero.js    # Chapter 1: Sunset hero reveal, SplitText mask-up, scramble chip
│   │   ├── chapter2-night.js   # Chapter 2: Scorpio night, constellation drawing, star tap chimes
│   │   ├── chapter3-galaxy.js  # Chapter 3: 8 memory galaxy photo flight, fullscreen zoom modal
│   │   ├── chapter4-lanterns.js# Chapter 4: Horizontal pinned lantern river with "Reasons I love you"
│   │   ├── chapter5-quiz.js    # Chapter 5: 5-question arcade quiz with feedback, sound, score card
│   │   ├── chapter6-question.js# Chapter 6: "Do you love me?" with magnetic Yes and dodging No button
│   │   ├── chapter7-movie.js   # Chapter 7: 3D tilt movie date posters, ticket stub tear & vouchers
│   │   ├── chapter8-scratch.js # Chapter 8: 3 interactive scratch-off canvas cards with sparkle bursts
│   │   ├── chapter9-letter.js  # Chapter 9: Typewriter love letter with blurred photo backdrop
│   │   ├── chapter10-cake.js   # Chapter 10: Candle blow interaction, smoke wisps, massive sky fireworks
│   │   ├── chapter11-wishes.js # Chapter 11: Wishes wall with localStorage persistence & add wish form
│   │   └── chapter12-credits.js# Chapter 12: Sunrise credits roll, movie poster photo 10, secret message
│   └── fx/
│       ├── sound.js            # 100% Web Audio API procedural sound (no external audio files needed!)
│       ├── confetti.js         # Custom 2D canvas confetti physics engine
│       ├── sparkles.js         # Pointer & touch sparkle trail
│       ├── haptics.js          # navigator.vibrate wrapper with device checks
│       └── split-text.js       # Lightweight DOM character/word splitter with mask-up spans
├── public/
│   └── photos/
│       ├── 01.jpg              # Hero floating framed portrait
│       ├── 02.jpg ... 09.jpg   # Memory Galaxy photos 1 to 8
│       └── 10.jpg              # Final credits movie poster ("Starring Aastha")
```

---

## 🎨 How to Edit Content (`src/config.js`)

All text, questions, choices, vouchers, and memory captions live in a single, organized file: `src/config.js`.

### 1. Changing Text & Inside Jokes
Open `src/config.js` and edit:
- `name`: Her name ("Aastha")
- `nickname`: Her nickname ("Bundi")
- `insideJoke`: Any inside joke (e.g. stealing hoodies, late-night Maggi)
- `memory`: Your favourite memory together
- `thingsSheLoves`: List of things she loves

### 2. Updating Photos
All 10 photos reside in `public/photos/`:
- `01.jpg`: The Hero portrait (floating framed photo in Chapter 1)
- `02.jpg` to `09.jpg`: The 8 memories in the 3D Memory Galaxy (Chapter 3)
- `10.jpg`: The "Starring Aastha aka Bundi" movie poster shot in the final credits (Chapter 12)

**Photo Guidelines for Best Performance:**
- **Dimensions**: ~1200px to 1600px on the longest side.
- **File size**: Under 300KB each (the current images are already optimized at 90KB–160KB!).
- **Object Position**: You can customize `objectPosition` in `src/config.js` (e.g. `"center 20%"` or `"center top"`) so her face is always framed perfectly whether in portrait or landscape.
- **Missing Photo Protection**: If any image fails to load or is deleted, a custom procedural pastel shader with a camera icon automatically renders—no broken image links ever!

### 3. Customizing the Sound System
All music and sound effects are 100% synthesized in real time via the Web Audio API (`src/fx/sound.js`). No MP3 or WAV files are required!
- Muted by default until her first tap (opening the Chapter 0 gift box automatically unlocks and begins the gentle ambient chord progression).
- Sound toggle button in the top-right corner allows instant muting/unmuting at any time.

---

## 🚀 Local Development & Preview

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the local dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview the production build**:
   ```bash
   npm run preview
   ```

---

## 🌐 How to Deploy (Send Her The Link!)

### Option A: Deploy to Vercel (Fastest & Free)
1. Install Vercel CLI (or push this repo to GitHub and import it on [vercel.com](https://vercel.com)):
   ```bash
   npx vercel
   ```
2. Follow the 3 prompts (default settings: Output Directory is `dist`).
3. You will immediately get a live production link (e.g. `https://happy-birthday-aastha.vercel.app`) to send to her!

### Option B: Deploy to Netlify
1. Run `npm run build` to generate the `dist` folder.
2. Drag and drop the `dist` folder into [app.netlify.com/drop](https://app.netlify.com/drop).
3. Copy the URL and share it with Bundi!

---

## 💖 Special Hidden Easter Egg
- In the final credits (Chapter 12), tapping the title **"Happy Birthday Bundi!"** 3 times unlocks the secret vault modal with a special hidden message from Laddu! 🍬

