import * as THREE from 'three';

export abstract class Level {
  scene: THREE.Scene;
  gui: dat.GUI;

  constructor(gui: dat.GUI) {
    this.scene = new THREE.Scene();
    this.gui = gui;
  }

  abstract update(time: number): void;
  abstract init(): void;
  abstract destroy(): void;
}
