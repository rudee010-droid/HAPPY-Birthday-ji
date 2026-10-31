import * as THREE from 'three';

export class LanternField {
  constructor(scene, tier = 'high') {
    this.scene = scene;
    this.count = tier === 'low' ? 16 : (tier === 'medium' ? 30 : 60);
    this.lanternData = [];
    this.dummy = new THREE.Object3D();

    this.initLanterns();
    this.initFireflies();
  }

  initLanterns() {
    // Octagonal cylinder paper lantern
    const geom = new THREE.CylinderGeometry(0.5, 0.45, 1.1, 8);

    // Warm luminous paper material with inner warm glow
    this.material = new THREE.MeshStandardMaterial({
      color: 0xFFC9A8, // Peach / amber paper
      emissive: 0xFF4F86, // Hot pink / warm core
      emissiveIntensity: 0.8,
      roughness: 0.6,
      transparent: true,
      opacity: 0.95
    });

    this.instancedMesh = new THREE.InstancedMesh(geom, this.material, this.count);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // River along Chapter 4 (Z: -8 to -16)
    for (let i = 0; i < this.count; i++) {
      const x = (Math.random() - 0.5) * 14;
      const y = -0.5 + Math.random() * 5.0;
      const z = -7 - Math.random() * 10;
      const scale = 0.5 + Math.random() * 0.6;

      this.lanternData.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        driftSpeed: 0.2 + Math.random() * 0.3,
        bobSpeed: 1.2 + Math.random() * 1.5,
        scale: scale,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.scene.add(this.instancedMesh);
  }

  initFireflies() {
    const count = 40;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 6.0;
      pos[i * 3 + 2] = -6 - Math.random() * 12;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    this.fireflyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.0 }
      },
      vertexShader: `
        uniform float uTime;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 1.2 + position.y * 3.0) * 0.3;
          p.y += cos(uTime * 1.5 + position.x * 2.0) * 0.25;
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (120.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float glow = exp(-d * 5.0);
          gl_FragColor = vec4(1.0, 0.95, 0.6, glow * uOpacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflies = new THREE.Points(geom, this.fireflyMaterial);
    this.scene.add(this.fireflies);
  }

  update(time, scroll) {
    // Visible primarily around Chapter 4 (0.35 to 0.55)
    let opacity = 0;
    if (scroll > 0.30 && scroll < 0.60) {
      opacity = THREE.MathUtils.smoothstep(scroll, 0.30, 0.40);
      if (scroll > 0.48) {
        opacity *= (1.0 - THREE.MathUtils.smoothstep(scroll, 0.48, 0.60));
      }
    }

    this.material.opacity = opacity * 0.95;
    if (this.fireflyMaterial) {
      this.fireflyMaterial.uniforms.uTime.value = time;
      this.fireflyMaterial.uniforms.uOpacity.value = opacity;
    }

    if (opacity <= 0.01) {
      this.instancedMesh.visible = false;
      this.fireflies.visible = false;
      return;
    }
    this.instancedMesh.visible = true;
    this.fireflies.visible = true;

    for (let i = 0; i < this.count; i++) {
      const l = this.lanternData[i];
      const y = l.baseY + Math.sin(time * l.bobSpeed + l.phase) * 0.3;
      const x = l.baseX + Math.sin(time * 0.5 + l.phase) * 0.4;

      this.dummy.position.set(x, y, l.baseZ);
      this.dummy.rotation.set(
        Math.sin(time * 0.8 + l.phase) * 0.08,
        time * 0.2 + l.phase,
        Math.cos(time * 0.8 + l.phase) * 0.08
      );
      this.dummy.scale.setScalar(l.scale);
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
}

