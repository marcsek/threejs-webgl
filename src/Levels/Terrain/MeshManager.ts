import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export class MeshManager {
  public meshes: Map<string, { material: THREE.Material; geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes> }>;

  constructor() {
    this.meshes = new Map();
  }

  setMaterials(materials: { key: string; material: THREE.Material }[]) {
    materials.forEach(e => {
      const foundMesh = this.meshes.get(e.key);
      this.meshes.set(e.key, { material: e.material, geometry: foundMesh?.geometry ?? new THREE.BoxGeometry(0, 0, 0) });
    });
  }

  addGeometry(key: string, newGeometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>) {
    const foundMesh = this.meshes.get(key);
    if (foundMesh) {
      this.meshes.set(key, { ...foundMesh, geometry: mergeGeometries([foundMesh.geometry, newGeometry]) });
    } else {
      this.meshes.set(key, { material: new THREE.MeshBasicMaterial(), geometry: newGeometry });
    }
  }

  generateMeshes(meshGenerator: (mesh: THREE.Mesh) => void) {
    return [...this.meshes.values()].map(e => {
      const newMesh = new THREE.Mesh(e.geometry, e.material);
      meshGenerator(newMesh);
      return newMesh;
    });
  }
}
