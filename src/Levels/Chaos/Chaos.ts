import { Level } from '../../Level';
import * as THREE from 'three';
import { GUIController } from 'dat.gui';
import World from './World';

export class Chaos extends Level {
  world: World;
  slider: GUIController | undefined;
  constructor(gui: dat.GUI) {
    super(gui);

    this.world = new World();
  }

  init(): void {
    const sunGeo = new THREE.SphereGeometry(2, 20, 20);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(sun);

    this.world = new World();
    this.world.generateObjects(10);

    this.slider = this.gui.add({ objectAmount: 10 }, 'objectAmount', 1, 1000).onChange(e => {
      this.scene.remove(...this.world.parseObjectsAsMesh());
      this.world.generateObjects(e);
      this.scene.add(...this.world.parseObjectsAsMesh());
    });

    this.scene.add(...this.world.parseObjectsAsMesh());

    const ambLight = new THREE.AmbientLight(0xffffff, 0.05);
    const pointLight = new THREE.PointLight(0xffffff, 1);

    this.scene.add(pointLight, ambLight, sun);
  }

  update(time: number): void {
    this.world.updateWorld(time);
  }

  destroy(): void {
    this.scene.remove();
    this.slider && this.gui.remove(this.slider);
  }
}
