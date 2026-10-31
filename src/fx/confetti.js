// Custom Hand-written Confetti Engine (zero external dependencies)
class ConfettiEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animId = null;
    this.colors = ['#FFD9E8', '#FF4F86', '#B79CFF', '#FFC9A8', '#FFF3C4', '#FF3D6E', '#FFFFFF'];
  }

  init() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'confetti-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '60';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.ctx) this.ctx.scale(dpr, dpr);
  }

  burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 75) {
    this.init();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5, // slight upward boost
        size: 5 + Math.random() * 7,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'heart'),
        wobble: Math.random() * 10
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  rain(duration = 2000) {
    this.init();
    const interval = setInterval(() => {
      this.burst(Math.random() * window.innerWidth, -10, 8);
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
    }, duration);
  }

  loop() {
    if (this.particles.length === 0) {
      if (this.ctx) this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.animId = null;
      return;
    }

    if (this.ctx) {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rotSpeed;
        p.wobble += 0.1;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > window.innerHeight + 50) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.scale(Math.cos(p.wobble), 1);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.life);

        if (p.shape === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 'circle') {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (p.shape === 'heart') {
          this.ctx.beginPath();
          const s = p.size * 0.5;
          this.ctx.moveTo(0, s * 0.3);
          this.ctx.bezierCurveTo(-s, -s * 0.6, -s * 1.3, s * 0.4, 0, s * 1.3);
          this.ctx.bezierCurveTo(s * 1.3, s * 0.4, s, -s * 0.6, 0, s * 0.3);
          this.ctx.fill();
        }

        this.ctx.restore();
      }
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
}

export const confetti = new ConfettiEngine();

