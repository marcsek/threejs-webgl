import { Level } from '../Level';
import * as THREE from 'three';
import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';
import { GUIController } from 'dat.gui';

export class Test extends Level {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  slider: GUIController;

  constructor(gui: dat.GUI) {
    super(gui);

    //const geometry = new THREE.BoxGeometry(16, 16, 16, 1, 16, 16);
    const geometry = new THREE.PlaneGeometry(16, 16, 16, 16);
    //    const geometry = new THREE.SphereGeometry(1, 10, 10);
    const material = new THREE.ShaderMaterial({ fragmentShader: fragment, vertexShader: vertex, wireframe: false });
    this.mesh = new THREE.Mesh(geometry, material);

    this.slider = this.gui.add({ scale: 2 }, 'scale', 1, 15);
  }

  init(): void {
    this.mesh.material.uniforms.uTime = { value: 1 };

    this.slider.onChange(e => this.mesh.scale.setScalar(e));

    this.scene.add(this.mesh);
  }

  update(time: number): void {
    this.mesh.material.uniforms.uTime = { value: time / 1000 };
  }

  destroy(): void {
    this.gui.remove(this.slider);
  }
}
