// Interactive Sparkle Trail Canvas
class SparkleTrail {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.sparkles = [];
    this.animId = null;
    this.colors = ['#FFD9E8', '#FF4F86', '#FFF3C4', '#B79CFF', '#FFC9A8'];
  }

  init() {
    this.canvas = document.getElementById('sparkle-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Touch & Pointer listeners
    const addPoint = (x, y) => {
      this.addSparkles(x, y, 2);
    };

    window.addEventListener('pointermove', (e) => {
      addPoint(e.clientX, e.clientY);
      // Desktop cursor glow
      const cursor = document.getElementById('cursor-glow');
      if (cursor) {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        addPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.ctx) this.ctx.scale(dpr, dpr);
  }

  addSparkles(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
      this.sparkles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        size: 2 + Math.random() * 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        life: 1,
        decay: 0.03 + Math.random() * 0.03,
        rot: Math.random() * Math.PI
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  loop() {
    if (this.sparkles.length === 0) {
      if (this.ctx) this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.animId = null;
      return;
    }

    if (this.ctx) {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = this.sparkles.length - 1; i >= 0; i--) {
        const s = this.sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.rot += 0.05;
        s.life -= s.decay;

        if (s.life <= 0) {
          this.sparkles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(s.x, s.y);
        this.ctx.rotate(s.rot);
        this.ctx.fillStyle = s.color;
        this.ctx.globalAlpha = s.life;

        // Draw 4-point star
        const r = s.size * s.life;
        this.ctx.beginPath();
        for (let j = 0; j < 4; j++) {
          const a = (j * Math.PI) / 2;
          this.ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          const aInner = a + Math.PI / 4;
          this.ctx.lineTo(Math.cos(aInner) * (r * 0.35), Math.sin(aInner) * (r * 0.35));
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
}

export const sparkles = new SparkleTrail();

