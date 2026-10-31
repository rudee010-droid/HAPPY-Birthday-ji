import * as THREE from 'three';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';

export class Starfield {
  constructor(scene, tier = 'high') {
    this.scene = scene;
    this.tier = tier;
    this.starsMesh = null;
    this.constellationGroup = new THREE.Group();
    this.shootingStars = [];
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points.threshold = 0.8;
    this.pointer = new THREE.Vector2();

    this.initStars();
    this.initScorpiusConstellation();
    this.initShootingStars();
  }

  initStars() {
    const count = this.tier === 'low' ? 600 : (this.tier === 'medium' ? 1200 : 2500);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    const colorPalette = [
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#FFD9E8'),
      new THREE.Color('#B79CFF'),
      new THREE.Color('#FFF3C4'),
      new THREE.Color('#FFC9A8')
    ];

    for (let i = 0; i < count; i++) {
      // Sphere distribution around scene
      const radius = 35 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(radius * Math.sin(phi) * Math.sin(theta)); // Keep above horizon
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      scales[i] = 1.0 + Math.random() * 2.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom shader material for twinkling stars with circular blur
    this.starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.0 } // Controlled by scroll (fades in during night)
      },
      vertexShader: `
        attribute float scale;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(uTime * 3.0 + position.x * 0.1) * 0.3 + 0.7;
          gl_PointSize = scale * twinkle * (180.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uOpacity;
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          float glow = exp(-dist * 4.0);
          gl_FragColor = vec4(vColor, glow * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.starsMesh = new THREE.Points(geometry, this.starMaterial);
    this.scene.add(this.starsMesh);
  }

  initScorpiusConstellation() {
    // Scorpius constellation coordinates centered around (0, 9, 0)
    // Antares is the glowing heart
    const starNodes = [
      { id: 'acrab', pos: new THREE.Vector3(-3.2, 12.0, -10), size: 1.2 },
      { id: 'dschubba', pos: new THREE.Vector3(-2.4, 11.2, -10), size: 1.3 },
      { id: 'pi_sco', pos: new THREE.Vector3(-3.0, 10.4, -10), size: 1.1 },
      { id: 'antares', pos: new THREE.Vector3(-1.0, 9.8, -10), size: 2.4, isHeart: true }, // Antares 💖
      { id: 'al_niyat', pos: new THREE.Vector3(-1.8, 10.2, -10), size: 1.2 },
      { id: 'tau_sco', pos: new THREE.Vector3(-0.4, 9.0, -10), size: 1.2 },
      { id: 'epsilon_sco', pos: new THREE.Vector3(0.5, 8.2, -10), size: 1.3 },
      { id: 'mu_sco', pos: new THREE.Vector3(1.2, 7.3, -10), size: 1.1 },
      { id: 'zeta_sco', pos: new THREE.Vector3(2.0, 6.5, -10), size: 1.2 },
      { id: 'eta_sco', pos: new THREE.Vector3(2.6, 6.2, -10), size: 1.2 },
      { id: 'sargas', pos: new THREE.Vector3(3.2, 6.6, -10), size: 1.4 },
      { id: 'shaula', pos: new THREE.Vector3(3.4, 7.8, -10), size: 1.6 }, // Stinger
      { id: 'lesath', pos: new THREE.Vector3(3.1, 8.3, -10), size: 1.3 }
    ];

    // Constellation lines connection graph
    const linesIndices = [
      ['acrab', 'dschubba'],
      ['dschubba', 'pi_sco'],
      ['dschubba', 'al_niyat'],
      ['al_niyat', 'antares'],
      ['antares', 'tau_sco'],
      ['tau_sco', 'epsilon_sco'],
      ['epsilon_sco', 'mu_sco'],
      ['mu_sco', 'zeta_sco'],
      ['zeta_sco', 'eta_sco'],
      ['eta_sco', 'sargas'],
      ['sargas', 'shaula'],
      ['shaula', 'lesath']
    ];

    // Line segments geometry
    const linePositions = [];
    linesIndices.forEach(([startId, endId]) => {
      const p1 = starNodes.find(n => n.id === startId).pos;
      const p2 = starNodes.find(n => n.id === endId).pos;
      linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    });

    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    this.constellationLineMaterial = new THREE.LineBasicMaterial({
      color: 0xFFD9E8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });

    const linesMesh = new THREE.LineSegments(lineGeom, this.constellationLineMaterial);
    this.constellationGroup.add(linesMesh);

    // Glowing spheres for constellation nodes
    this.starSpheres = [];
    starNodes.forEach((node) => {
      const color = node.isHeart ? 0xFF3D6E : 0xFFF3C4;
      const sphereGeom = new THREE.SphereGeometry(node.size * 0.15, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.0
      });

      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.copy(node.pos);
      sphere.userData = { isHeart: !!node.isHeart, id: node.id, baseScale: node.size };
      this.constellationGroup.add(sphere);
      this.starSpheres.push(sphere);
    });

    this.scene.add(this.constellationGroup);
  }

  initShootingStars() {
    this.shootingStarGroup = new THREE.Group();
    this.scene.add(this.shootingStarGroup);
  }

  triggerShootingStar(origin = null) {
    const start = origin ? origin.clone() : new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      12 + Math.random() * 8,
      -10 + Math.random() * 5
    );

    const dir = new THREE.Vector3(1.5, -1.0, 0.5).normalize();
    const length = 4.0;
    const geom = new THREE.BufferGeometry();
    const p1 = start;
    const p2 = start.clone().add(dir.clone().multiplyScalar(length));
    geom.setAttribute('position', new THREE.Float32BufferAttribute([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z], 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0xFFF3C4,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const line = new THREE.Line(geom, mat);
    this.shootingStarGroup.add(line);

    this.shootingStars.push({
      mesh: line,
      life: 1.0,
      vel: dir.clone().multiplyScalar(15.0)
    });
  }

  triggerStarRain() {
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        this.triggerShootingStar();
      }, i * 150);
    }
  }

  onTap(camera, screenX, screenY) {
    this.pointer.x = (screenX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(screenY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, camera);
    const intersects = this.raycaster.intersectObjects(this.starSpheres);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      sound.playChime(hit.userData.isHeart);
      haptics.light();
      this.triggerShootingStar(hit.position);
      return true;
    }
    return false;
  }

  update(delta, time, scroll) {
    // Opacity fades in during Chapter 2 (0.12) to Chapter 9 (0.85)
    let starAlpha = 0;
    if (scroll > 0.08 && scroll < 0.90) {
      starAlpha = THREE.MathUtils.smoothstep(scroll, 0.08, 0.22);
      if (scroll > 0.78) {
        starAlpha *= (1.0 - THREE.MathUtils.smoothstep(scroll, 0.78, 0.90));
      }
    }

    if (this.starMaterial) {
      this.starMaterial.uniforms.uTime.value = time;
      this.starMaterial.uniforms.uOpacity.value = starAlpha;
    }

    // Scorpius constellation lines and nodes appear prominently in Chapter 2 (0.12 - 0.25)
    let constAlpha = 0;
    if (scroll > 0.12 && scroll < 0.28) {
      constAlpha = THREE.MathUtils.smoothstep(scroll, 0.12, 0.18);
      if (scroll > 0.22) {
        constAlpha *= (1.0 - THREE.MathUtils.smoothstep(scroll, 0.22, 0.28));
      }
    }

    if (this.constellationLineMaterial) {
      this.constellationLineMaterial.opacity = constAlpha;
    }

    this.starSpheres.forEach((sphere) => {
      sphere.material.opacity = constAlpha;
      if (sphere.userData.isHeart) {
        // Antares pulse like a beating heart
        const pulse = 1.0 + Math.sin(time * 5.0) * 0.35;
        sphere.scale.setScalar(sphere.userData.baseScale * pulse);
      }
    });

    // Update shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.life -= delta * 1.8;
      ss.mesh.position.add(ss.vel.clone().multiplyScalar(delta));
      ss.mesh.material.opacity = Math.max(0, ss.life);

      if (ss.life <= 0) {
        this.shootingStarGroup.remove(ss.mesh);
        ss.mesh.geometry.dispose();
        ss.mesh.material.dispose();
        this.shootingStars.splice(i, 1);
      }
    }
  }
}

