import * as THREE from 'three';
import { get_ndrn } from './distribution';

interface WorldObject {
  pivot: THREE.Object3D;
  pRotationSpeed: THREE.Vector3;
  sRotationSpeed: THREE.Vector3;
}

class World {
  private worldObjects: WorldObject[] = [];

  generateObjects(n: number) {
    if (n < this.worldObjects.length) {
      this.worldObjects.splice(-n, n);
      return;
    }

    for (let i = this.worldObjects.length; i < n; i++) {
      const size = get_ndrn(2, 0.5);

      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshLambertMaterial({ color: 0xcf5dcf });
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.position.x = 5 + 5 * get_ndrn(10, 3);

      const pivot = new THREE.Object3D();
      pivot.add(cube);

      this.worldObjects.push({
        pivot,
        pRotationSpeed: new THREE.Vector3(get_ndrn(3, 5), get_ndrn(3, 5), get_ndrn(3, 5)),
        sRotationSpeed: new THREE.Vector3(get_ndrn(3, 5), get_ndrn(3, 5), get_ndrn(3, 5)),
      });
    }
  }

  parseObjectsAsMesh() {
    return this.worldObjects.map(e => e.pivot);
  }

  getNumberOfInstances() {
    return this.worldObjects.length;
  }

  updateWorld(time: number) {
    for (const object of this.worldObjects) {
      object.pivot.rotateX(object.pRotationSpeed.x / 1000);
      object.pivot.rotateY(object.pRotationSpeed.y / 1000);
      object.pivot.rotateZ(object.pRotationSpeed.z / 1000);

      object.pivot.children[0].rotateX(object.sRotationSpeed.x / 1000);
      object.pivot.children[0].rotateY(object.sRotationSpeed.y / 1000);
      object.pivot.children[0].rotateZ(object.sRotationSpeed.z / 1000);
    }
  }
}

export default World;
