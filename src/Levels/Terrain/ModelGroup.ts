import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DEFAULT_MATERIAL = THREE.MeshPhysicalMaterial;

export class ModelGroup {
  model: THREE.Group;

  constructor() {
    this.model = new THREE.Group();
  }

  async load(url: string) {
    const loader = new GLTFLoader();
    this.model = (await loader.loadAsync(url)).scene;

    this.replaceMaterial();
    return this;
  }

  modifyMeshAtt(callback: (mesh: THREE.Mesh) => void) {
    this.model.traverse(obj => {
      if (obj instanceof THREE.Mesh) callback(obj);
    });
  }

  replaceMaterial() {
    this.model.children.forEach(child => {
      if ('material' in child && typeof child.material === 'object') {
        child.material = new DEFAULT_MATERIAL({
          ...child.material,
        });
      }
    });
  }

  setMaterial(callback: (previous: THREE.MaterialParameters) => void) {
    this.model.children.forEach(child => {
      if ('material' in child && typeof child.material === 'object') {
        child.material = callback(child.material as THREE.MaterialParameters);
      }
    });
  }
}
