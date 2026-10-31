import * as THREE from 'three';
import photoVert from '../shaders/photo.vert?raw';
import photoFrag from '../shaders/photo.frag?raw';
import { config } from '../config.js';

export class PhotoMeshes {
  constructor(scene) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
    this.photos = [];
    this.group = new THREE.Group();

    this.initPhotos();
  }

  initPhotos() {
    const photoConfigs = config.photos;
    // Spiral configuration for photos 02 to 09 (indices 1 to 8)
    // Photo 01 (index 0) is Hero
    // Photo 10 (index 9) is Credits

    photoConfigs.forEach((cfg, idx) => {
      let pos = new THREE.Vector3();
      let rot = new THREE.Euler(0, 0, 0);

      if (idx === 0) {
        // Photo 01: Hero floating portrait
        pos.set(0, 1.8, 4.5);
      } else if (idx >= 1 && idx <= 8) {
        // Photos 02 to 09: Memory Galaxy 3D spiral curve
        const step = idx - 1; // 0 to 7
        const angle = step * 0.95;
        const radius = 2.8 + (step % 2) * 0.8;
        const zPos = 2.0 - step * 5.2; // Spaced along Z axis
        const yPos = 3.5 + Math.sin(angle) * 1.5;
        const xPos = Math.cos(angle) * radius;

        pos.set(xPos, yPos, zPos);
        rot.set(0, -Math.sin(angle) * 0.4, (Math.random() - 0.5) * 0.1);
      } else {
        // Photo 10: Credits poster
        pos.set(0, 14, -62);
      }

      const uniforms = {
        uTexture: { value: null },
        uHasTexture: { value: 0.0 },
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uTouchPos: { value: new THREE.Vector2(0.5, 0.5) },
        uTouchTime: { value: -10.0 },
        uAspectRatio: { value: 0.8 }
      };

      const material = new THREE.ShaderMaterial({
        vertexShader: photoVert,
        fragmentShader: photoFrag,
        uniforms: uniforms,
        transparent: true,
        side: THREE.DoubleSide
      });

      // Load texture with error handling
      this.textureLoader.load(
        cfg.path,
        (tex) => {
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          uniforms.uTexture.value = tex;
          uniforms.uHasTexture.value = 1.0;
        },
        undefined,
        (err) => {
          console.warn(`Photo ${cfg.path} not loaded, using fallback shader:`, err);
          uniforms.uHasTexture.value = 0.0;
        }
      );

      const geom = new THREE.PlaneGeometry(2.4, 3.0, 16, 16);
      const mesh = new THREE.Mesh(geom, material);
      mesh.position.copy(pos);
      mesh.rotation.copy(rot);
      mesh.userData = {
        index: idx,
        caption: cfg.caption,
        path: cfg.path,
        basePos: pos.clone(),
        baseRot: rot.clone()
      };

      this.group.add(mesh);
      this.photos.push(mesh);
    });

    this.scene.add(this.group);
  }

  triggerTouchRipple(photoIndex, u, v, currentTime) {
    if (this.photos[photoIndex]) {
      const mat = this.photos[photoIndex].material;
      mat.uniforms.uTouchPos.value.set(u, v);
      mat.uniforms.uTouchTime.value = currentTime;
    }
  }

  update(time, scroll, velocity, camera) {
    this.photos.forEach((mesh) => {
      const mat = mesh.material;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uVelocity.value = velocity;

      // Gentle floating bobbing
      const idx = mesh.userData.index;
      mesh.position.y = mesh.userData.basePos.y + Math.sin(time * 1.5 + idx) * 0.15;

      // In Memory Galaxy (photos 1 to 8), turn towards camera as it nears
      if (idx >= 1 && idx <= 8) {
        const distToCam = mesh.position.distanceTo(camera.position);
        if (distToCam < 8.0) {
          mesh.lookAt(camera.position);
        } else {
          mesh.rotation.copy(mesh.userData.baseRot);
        }
      }
    });
  }
}

