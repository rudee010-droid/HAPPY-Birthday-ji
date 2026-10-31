import * as THREE from 'three';
import { sound } from '../fx/sound.js';
import { haptics } from '../fx/haptics.js';

export class CakeIsland {
  constructor(scene, onAllCandlesBlown = null) {
    this.scene = scene;
    this.onAllCandlesBlown = onAllCandlesBlown;
    this.group = new THREE.Group();
    this.candles = [];
    this.candlesBlownCount = 0;
    this.totalCandles = 5;

    this.initIslandAndCake();
  }

  initIslandAndCake() {
    // Cake Island located at Z = -48
    this.group.position.set(0, 0, -48);

    // Floating island rock base
    const islandGeom = new THREE.CylinderGeometry(4.0, 1.5, 2.0, 16);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x2A1B3D,
      roughness: 0.9,
      metalness: 0.1
    });
    const island = new THREE.Mesh(islandGeom, islandMat);
    island.position.y = -1.2;
    this.group.add(island);

    // Cake Tier 1 (Bottom, Vanilla Strawberry)
    const tier1Geom = new THREE.CylinderGeometry(2.5, 2.5, 1.2, 32);
    const tier1Mat = new THREE.MeshStandardMaterial({
      color: 0xFFD9E8, // Blush frosting
      roughness: 0.3
    });
    const tier1 = new THREE.Mesh(tier1Geom, tier1Mat);
    tier1.position.y = 0.4;
    this.group.add(tier1);

    // Cake Tier 2 (Top, Whipped Cream)
    const tier2Geom = new THREE.CylinderGeometry(1.7, 1.7, 1.0, 32);
    const tier2Mat = new THREE.MeshStandardMaterial({
      color: 0xFFF3C4, // Cream frosting
      roughness: 0.25
    });
    const tier2 = new THREE.Mesh(tier2Geom, tier2Mat);
    tier2.position.y = 1.45;
    this.group.add(tier2);

    // Icing Drips Ring
    const dripGeom = new THREE.TorusGeometry(1.72, 0.12, 12, 32);
    const dripMat = new THREE.MeshStandardMaterial({
      color: 0xFF4F86, // Hot pink drip glaze
      roughness: 0.1
    });
    const drip = new THREE.Mesh(dripGeom, dripMat);
    drip.rotation.x = Math.PI / 2;
    drip.position.y = 1.9;
    this.group.add(drip);

    // Colorful Sprinkles (Instanced small cylinders)
    const sprinkleGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8);
    const sprinkleMat = new THREE.MeshStandardMaterial({ roughness: 0.4 });
    const sprinkleCount = 60;
    const sprinkleMesh = new THREE.InstancedMesh(sprinkleGeom, sprinkleMat, sprinkleCount);
    const dummy = new THREE.Object3D();
    const sprinkleColors = [
      new THREE.Color('#FF4F86'),
      new THREE.Color('#B79CFF'),
      new THREE.Color('#FFC9A8'),
      new THREE.Color('#FF3D6E'),
      new THREE.Color('#FFF3C4')
    ];

    for (let i = 0; i < sprinkleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() < 0.6 ? Math.random() * 1.6 : 1.7 + Math.random() * 0.7;
      const y = r < 1.7 ? 1.98 : 1.02;

      dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      dummy.rotation.set(Math.PI / 2, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.updateMatrix();

      sprinkleMesh.setMatrixAt(i, dummy.matrix);
      sprinkleMesh.setColorAt(i, sprinkleColors[i % sprinkleColors.length]);
    }
    sprinkleMesh.instanceMatrix.needsUpdate = true;
    if (sprinkleMesh.instanceColor) sprinkleMesh.instanceColor.needsUpdate = true;
    this.group.add(sprinkleMesh);

    // 5 Candles with flickering flame sprites
    const candleGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 12);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });

    const candleRadius = 1.0;
    for (let i = 0; i < this.totalCandles; i++) {
      const angle = (i / this.totalCandles) * Math.PI * 2;
      const cx = Math.cos(angle) * candleRadius;
      const cz = Math.sin(angle) * candleRadius;
      const cy = 2.3;

      const candleStick = new THREE.Mesh(candleGeom, candleMat);
      candleStick.position.set(cx, cy, cz);
      this.group.add(candleStick);

      // Flame Mesh (additive glowing teardrop)
      const flameGeom = new THREE.SphereGeometry(0.12, 12, 12);
      flameGeom.scale(1.0, 1.8, 1.0);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xFF9933,
        transparent: true,
        opacity: 0.95
      });
      const flame = new THREE.Mesh(flameGeom, flameMat);
      flame.position.set(cx, cy + 0.45, cz);
      this.group.add(flame);

      // Point Light for local candle flicker
      const light = new THREE.PointLight(0xFFAA44, 1.2, 4);
      light.position.set(cx, cy + 0.5, cz);
      this.group.add(light);

      this.candles.push({
        index: i,
        flame: flame,
        light: light,
        isBlown: false,
        flameBaseY: cy + 0.45,
        flickerPhase: Math.random() * Math.PI * 2
      });
    }

    this.scene.add(this.group);
  }

  blowCandle(index) {
    if (index >= 0 && index < this.candles.length) {
      const c = this.candles[index];
      if (!c.isBlown) {
        c.isBlown = true;
        c.flame.visible = false;
        c.light.intensity = 0;
        this.candlesBlownCount++;

        sound.playCandleBlow();
        haptics.heartbeat();

        if (this.candlesBlownCount === this.totalCandles) {
          if (this.onAllCandlesBlown) {
            this.onAllCandlesBlown();
          }
        }
        return true;
      }
    }
    return false;
  }

  update(time) {
    // Gentle floating island bobbing
    this.group.position.y = Math.sin(time * 1.2) * 0.12;

    // Flickering candle flames
    this.candles.forEach((c) => {
      if (!c.isBlown) {
        const flicker = Math.sin(time * 14.0 + c.flickerPhase) * 0.12 + 1.0;
        c.flame.scale.set(flicker, flicker * 1.2, flicker);
        c.light.intensity = 1.0 * flicker;
      }
    });
  }
}

