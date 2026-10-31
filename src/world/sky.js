import * as THREE from 'three';
import skyVert from '../shaders/sky.vert?raw';
import skyFrag from '../shaders/sky.frag?raw';

export class SkyBackground {
  constructor(scene) {
    this.scene = scene;
    
    this.uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    // Screen quad camera & mesh for independent background rendering
    this.bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.bgScene = new THREE.Scene();

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: skyVert,
      fragmentShader: skyFrag,
      uniforms: this.uniforms,
      depthWrite: false,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geometry, this.material);
    this.bgScene.add(mesh);
  }

  resize(width, height) {
    this.uniforms.uResolution.value.set(width, height);
  }

  update(time, scroll) {
    this.uniforms.uTime.value = time;
    this.uniforms.uScroll.value = scroll;
  }

  render(renderer) {
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(this.bgScene, this.bgCamera);
  }
}

