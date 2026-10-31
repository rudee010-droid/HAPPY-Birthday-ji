import * as THREE from 'three';
import { CameraRig } from './camera-rig.js';
import { SkyBackground } from './sky.js';
import { Starfield } from './stars.js';
import { BalloonsField } from './balloons.js';
import { PhotoMeshes } from './photo-meshes.js';
import { LanternField } from './lanterns.js';
import { CakeIsland } from './cake.js';
import { FireworksManager } from './fireworks.js';

export class WorldScene {
  constructor(canvas, tier = 'high') {
    this.canvas = canvas;
    this.tier = tier;
    this.isSupported = true;
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
    this.currentDpr = this.getInitialDpr();

    this.init();
  }

  getInitialDpr() {
    const rawDpr = window.devicePixelRatio || 1;
    if (this.tier === 'low') return 1.0;
    if (this.tier === 'medium') return Math.min(rawDpr, 1.5);
    return Math.min(rawDpr, 2.0);
  }

  init() {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: this.tier !== 'low',
        alpha: false,
        powerPreference: 'high-performance'
      });
      this.renderer.setPixelRatio(this.currentDpr);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.1;
    } catch (e) {
      console.error("WebGL Initialization failed:", e);
      this.isSupported = false;
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 200);
    this.cameraRig = new CameraRig(this.camera);

    // Soft Lighting
    this.hemiLight = new THREE.HemisphereLight(0xFFD9E8, 0x14102E, 0.9);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xFFF3C4, 1.2);
    this.dirLight.position.set(5, 10, 7);
    this.scene.add(this.dirLight);

    // Sub-systems
    this.sky = new SkyBackground(this.scene);
    this.stars = new Starfield(this.scene, this.tier);
    this.balloons = new BalloonsField(this.scene, this.tier);
    this.photoMeshes = new PhotoMeshes(this.scene);
    this.lanterns = new LanternField(this.scene, this.tier);
    this.cakeIsland = new CakeIsland(this.scene, () => {
      this.cameraRig.startCakeOrbit();
      this.fireworks.showGrandFinale();
      const banner = document.getElementById('wish-blown-banner');
      if (banner) banner.classList.remove('hidden');
    });
    this.fireworks = new FireworksManager(this.scene);

    this.clock = new THREE.Clock();
    this.scrollProgress = 0;
    this.scrollVelocity = 0;

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('resize', () => this.onResize());
    
    // Tap raycaster for star chimes and shooting stars
    window.addEventListener('pointerdown', (e) => {
      if (this.stars) {
        this.stars.onTap(this.camera, e.clientX, e.clientY);
      }
    }, { passive: true });
  }

  onResize() {
    if (!this.isSupported) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.sky.resize(w, h);
  }

  setScroll(val, velocity = 0) {
    this.scrollProgress = val;
    this.scrollVelocity = velocity;
    if (this.cameraRig) {
      this.cameraRig.setScroll(val, velocity);
    }
  }

  // Dynamic Resolution Scaling
  checkPerformance(delta) {
    const fps = 1 / Math.max(delta, 0.001);
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 60) this.fpsHistory.shift();

    if (this.fpsHistory.length === 60) {
      const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / 60;
      if (avgFps < 48 && this.currentDpr > 1.0) {
        this.currentDpr = Math.max(1.0, this.currentDpr - 0.2);
        this.renderer.setPixelRatio(this.currentDpr);
        this.fpsHistory = [];
        console.log(`[Performance Tier] Auto-adjusted DPR to ${this.currentDpr} to sustain 60fps`);
      }
    }
  }

  render() {
    if (!this.isSupported) return;
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    this.checkPerformance(delta);

    // Update Camera
    this.cameraRig.update(delta);

    // Update World Objects
    this.sky.update(time, this.scrollProgress);
    this.stars.update(delta, time, this.scrollProgress);
    this.balloons.update(time, this.scrollProgress);
    this.photoMeshes.update(time, this.scrollProgress, this.scrollVelocity, this.camera);
    this.lanterns.update(time, this.scrollProgress);
    this.cakeIsland.update(time);
    this.fireworks.update(delta);

    // Render 2 passes: Sky background, then 3D scene
    this.sky.render(this.renderer);
    this.renderer.render(this.scene, this.camera);
  }
}

