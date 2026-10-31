import * as THREE from 'three';

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.targetScroll = 0;
    this.currentScroll = 0;
    this.velocity = 0;
    this.baseFov = camera.fov;

    // Mouse / Pointer Parallax
    this.pointer = { x: 0, y: 0 };
    this.targetPointer = { x: 0, y: 0 };

    // Spline path for camera position
    this.camPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 5),      // Ch 0: Gift cover
      new THREE.Vector3(0, 2, 12),     // Ch 1: Hero sunset
      new THREE.Vector3(0, 7, 18),     // Ch 2: Scorpio night
      new THREE.Vector3(3, 4, 10),     // Ch 3: Memory galaxy start
      new THREE.Vector3(-3, 6, 2),     // Ch 3: Memory galaxy mid
      new THREE.Vector3(0, 3, -6),     // Ch 3: Memory galaxy end
      new THREE.Vector3(0, 1.5, -12),  // Ch 4: Lantern river
      new THREE.Vector3(0, 3, -18),    // Ch 5: Arcade quiz
      new THREE.Vector3(0, 2, -24),    // Ch 6: The big question
      new THREE.Vector3(0, 2.5, -30),  // Ch 7: Movie date
      new THREE.Vector3(0, 3, -36),    // Ch 8: Scratch cards
      new THREE.Vector3(0, 2, -42),    // Ch 9: Love letter
      new THREE.Vector3(0, 2.5, -48),  // Ch 10: Cake island
      new THREE.Vector3(0, 6, -52),    // Ch 11: Wishes wall
      new THREE.Vector3(0, 14, -58)    // Ch 12: Sunrise credits
    ]);

    // Spline path for camera lookAt target
    this.lookPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(0, 9, 0),
      new THREE.Vector3(0, 3, 0),
      new THREE.Vector3(0, 4, -4),
      new THREE.Vector3(0, 2, -10),
      new THREE.Vector3(0, 1, -16),
      new THREE.Vector3(0, 2, -22),
      new THREE.Vector3(0, 1.5, -28),
      new THREE.Vector3(0, 2, -34),
      new THREE.Vector3(0, 2, -40),
      new THREE.Vector3(0, 1.5, -46),
      new THREE.Vector3(0, 1, -52),
      new THREE.Vector3(0, 5, -56),
      new THREE.Vector3(0, 16, -64)
    ]);

    this.currentCamPos = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this.orbitAngle = 0;
    this.isOrbiting = false; // Cake island wish celebration

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('pointermove', (e) => {
      this.targetPointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetPointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Gyroscope tilt support for mobile
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          this.targetPointer.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
          this.targetPointer.y = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
        }
      }, { passive: true });
    }
  }

  setScroll(val, velocity = 0) {
    this.targetScroll = THREE.MathUtils.clamp(val, 0, 1);
    this.velocity = velocity;
  }

  startCakeOrbit() {
    this.isOrbiting = true;
  }

  update(delta) {
    // Damped lerp for silky camera flight
    const lerpFactor = 0.08;
    this.currentScroll += (this.targetScroll - this.currentScroll) * lerpFactor;
    this.pointer.x += (this.targetPointer.x - this.pointer.x) * 0.05;
    this.pointer.y += (this.targetPointer.y - this.pointer.y) * 0.05;

    const t = THREE.MathUtils.clamp(this.currentScroll, 0, 0.999);
    const camPoint = this.camPath.getPointAt(t);
    const lookPoint = this.lookPath.getPointAt(t);

    if (this.isOrbiting && t > 0.85) {
      this.orbitAngle += delta * 0.5;
      camPoint.x += Math.sin(this.orbitAngle) * 3.5;
      camPoint.z += Math.cos(this.orbitAngle) * 3.5;
    }

    // Apply pointer parallax
    camPoint.x += this.pointer.x * 0.5;
    camPoint.y -= this.pointer.y * 0.35;

    this.currentCamPos.copy(camPoint);
    this.currentLookAt.copy(lookPoint);

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);

    // Camera roll banks on curves
    const tangent = this.camPath.getTangentAt(t);
    this.camera.rotation.z = -tangent.x * 0.15 + this.pointer.x * 0.04;

    // FOV widens slightly on fast scrolls
    const speedRatio = Math.min(Math.abs(this.velocity) * 0.005, 0.3);
    this.camera.fov = this.baseFov + speedRatio * 8;
    this.camera.updateProjectionMatrix();
  }
}

