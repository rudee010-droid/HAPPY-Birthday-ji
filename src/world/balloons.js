import * as THREE from 'three';

export class BalloonsField {
  constructor(scene, tier = 'high') {
    this.scene = scene;
    this.count = tier === 'low' ? 18 : (tier === 'medium' ? 32 : 55);
    this.balloonData = [];
    this.dummy = new THREE.Object3D();

    this.initBalloons();
  }

  initBalloons() {
    // Balloon geometry (elongated sphere with knot base)
    const balloonGeom = new THREE.SphereGeometry(0.8, 20, 20);
    balloonGeom.scale(1.0, 1.3, 1.0);

    // Glossy metallic/plastic material with pastel shades
    this.material = new THREE.MeshPhysicalMaterial({
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.2, // soft translucency
      ior: 1.4,
      transparent: true,
      opacity: 0.95
    });

    this.instancedMesh = new THREE.InstancedMesh(balloonGeom, this.material, this.count);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const colors = [
      new THREE.Color('#FF4F86'), // Hot pink
      new THREE.Color('#FFD9E8'), // Blush
      new THREE.Color('#B79CFF'), // Lavender
      new THREE.Color('#FFC9A8'), // Peach
      new THREE.Color('#FFF3C4')  // Cream
    ];

    for (let i = 0; i < this.count; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = -2 + Math.random() * 18;
      const z = -6 + Math.random() * 14;
      const scale = 0.5 + Math.random() * 0.7;

      this.balloonData.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        speed: 0.3 + Math.random() * 0.5,
        wobbleSpeed: 1.0 + Math.random() * 2.0,
        wobbleAmp: 0.1 + Math.random() * 0.2,
        scale: scale,
        phase: Math.random() * Math.PI * 2
      });

      this.instancedMesh.setColorAt(i, colors[i % colors.length]);
    }

    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.scene.add(this.instancedMesh);
  }

  update(time, scroll) {
    // Balloons are most active in Chapters 0 and 1 (sunset), drift upwards
    let opacity = 1.0;
    if (scroll > 0.15) {
      opacity = 1.0 - THREE.MathUtils.smoothstep(scroll, 0.15, 0.25);
    }
    this.material.opacity = opacity * 0.95;

    if (opacity <= 0.01) {
      this.instancedMesh.visible = false;
      return;
    }
    this.instancedMesh.visible = true;

    for (let i = 0; i < this.count; i++) {
      const b = this.balloonData[i];
      const yOffset = Math.sin(time * b.speed + b.phase) * 0.6;
      const xOffset = Math.sin(time * b.wobbleSpeed + b.phase) * b.wobbleAmp;

      this.dummy.position.set(b.baseX + xOffset, b.baseY + yOffset, b.baseZ);
      this.dummy.rotation.set(
        Math.sin(time * 0.8 + b.phase) * 0.1,
        time * 0.2 + b.phase,
        Math.cos(time * 0.8 + b.phase) * 0.1
      );
      this.dummy.scale.setScalar(b.scale);
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
}

