import * as THREE from 'three';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';

export class FireworksManager {
  constructor(scene) {
    this.scene = scene;
    this.explosions = [];
    this.colors = [
      new THREE.Color('#FF4F86'), // Hot pink
      new THREE.Color('#FFD9E8'), // Blush
      new THREE.Color('#FFF3C4'), // Cream
      new THREE.Color('#B79CFF'), // Lavender
      new THREE.Color('#FFC9A8'), // Peach
      new THREE.Color('#FF3D6E')  // Antares pink
    ];
  }

  launch(origin = null) {
    const startX = origin ? origin.x : (Math.random() - 0.5) * 16;
    const startY = origin ? origin.y : 8 + Math.random() * 8;
    const startZ = origin ? origin.z : -46 + (Math.random() - 0.5) * 12;

    const count = 180;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseCol = this.colors[Math.floor(Math.random() * this.colors.length)];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = startX;
      positions[i * 3 + 1] = startY;
      positions[i * 3 + 2] = startZ;

      // Spherical explosion velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 4.0 + Math.random() * 6.0;

      velocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      velocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      velocities[i * 3 + 2] = speed * Math.cos(phi);

      colors[i * 3] = baseCol.r;
      colors[i * 3 + 1] = baseCol.g;
      colors[i * 3 + 2] = baseCol.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 1.0 }
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (220.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uOpacity;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float glow = exp(-d * 4.0);
          gl_FragColor = vec4(vColor, glow * uOpacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geom, mat);
    this.scene.add(points);

    sound.playFirework();
    haptics.celebrate();

    this.explosions.push({
      mesh: points,
      geom: geom,
      mat: mat,
      velocities: velocities,
      life: 1.0,
      decay: 0.012 + Math.random() * 0.006
    });
  }

  showGrandFinale(count = 8) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.launch();
      }, i * 400);
    }
  }

  update(delta) {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.life -= exp.decay;
      exp.mat.uniforms.uOpacity.value = Math.max(0, exp.life);

      const pos = exp.geom.attributes.position.array;
      const vel = exp.velocities;

      for (let j = 0; j < pos.length / 3; j++) {
        pos[j * 3] += vel[j * 3] * delta;
        pos[j * 3 + 1] += vel[j * 3 + 1] * delta;
        pos[j * 3 + 2] += vel[j * 3 + 2] * delta;

        // Gravity & air drag
        vel[j * 3 + 1] -= 2.5 * delta;
        vel[j * 3] *= 0.98;
        vel[j * 3 + 1] *= 0.98;
        vel[j * 3 + 2] *= 0.98;
      }

      exp.geom.attributes.position.needsUpdate = true;

      if (exp.life <= 0) {
        this.scene.remove(exp.mesh);
        exp.geom.dispose();
        exp.mat.dispose();
        this.explosions.splice(i, 1);
      }
    }
  }
}

