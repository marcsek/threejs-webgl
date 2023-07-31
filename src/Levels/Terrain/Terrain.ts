import { Level } from '../../Level';
import * as THREE from 'three';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';
import { GUIController } from 'dat.gui';
import { noise as pNoise, noiseDetail, noiseSeed, resetPerlin } from '../../NoiseFunctions/Perlin';
import { MeshManager } from './MeshManager';

const MESH_SIZE = 32;
const MAX_HEIGHT = 10 ** 1.25;

export class Terrain extends Level {
  meshManager: MeshManager;
  slider: GUIController;

  constructor(gui: dat.GUI) {
    super(gui);

    this.meshManager = new MeshManager();
    this.slider = this.gui.add({ scale: 2 }, 'scale', 20, 15);
  }

  async init() {
    const pointLight = new THREE.PointLight(new THREE.Color('#fcc168').convertLinearToSRGB(), 0.8, 200);
    pointLight.position.set(10, 20, 10);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 500;

    this.scene.add(pointLight, new THREE.AmbientLight(0xffc14d, 0.05));

    const textureLoader = new THREE.TextureLoader();

    const stone = textureLoader.load('/src/Levels/Terrain/assets/stone.png');
    const sand = textureLoader.load('/src/Levels/Terrain/assets/sand.jpg');
    const grass = textureLoader.load('/src/Levels/Terrain/assets/grass.jpg');
    const dirt = textureLoader.load('/src/Levels/Terrain/assets/dirt.png');
    const dirt2 = textureLoader.load('/src/Levels/Terrain/assets/dirt2.jpg');

    this.meshManager.setMaterials([
      { key: 'stone', material: new THREE.MeshPhysicalMaterial({ map: stone, flatShading: true }) },
      { key: 'sand', material: new THREE.MeshPhysicalMaterial({ map: sand, flatShading: true }) },
      { key: 'grass', material: new THREE.MeshPhysicalMaterial({ map: grass, flatShading: true }) },
      { key: 'dirt', material: new THREE.MeshPhysicalMaterial({ map: dirt, flatShading: true }) },
      { key: 'dirt2', material: new THREE.MeshPhysicalMaterial({ map: dirt2, flatShading: true }) },
    ]);

    const tileToPos = (tile: THREE.Vec2): THREE.Vector2 => new THREE.Vector2((tile.x + (tile.y % 2) * 0.5) * 1.77, tile.y * 1.535);

    noiseDetail(8, 0.5);

    for (let y = -MESH_SIZE / 2; y <= MESH_SIZE / 2; y++) {
      for (let x = -MESH_SIZE / 2; x <= MESH_SIZE / 2; x++) {
        const position = tileToPos({ x, y });
        if (position.length() > MESH_SIZE / 2 + 1) continue;

        let noise = pNoise((x + 15) * 0.2, (y + 15) * 0.2);
        noise = (noise * 10) ** 2.25;

        const height = noise / 10;
        const newHex = this.generateHexagon(height, position);
        if (height < MAX_HEIGHT * 0.1) {
          this.meshManager.addGeometry('sand', newHex);
        } else if (height < MAX_HEIGHT * 0.2) {
          this.meshManager.addGeometry('grass', newHex);
        } else if (height < MAX_HEIGHT * 0.3) {
          this.meshManager.addGeometry('dirt', newHex);
        } else if (height < MAX_HEIGHT * 0.5) {
          this.meshManager.addGeometry('dirt2', newHex);
        } else {
          this.meshManager.addGeometry('stone', newHex);
        }
      }
    }

    resetPerlin();

    // this.mesh.material.uniforms.uTime = { value: 1 };

    const meshes = this.meshManager.generateMeshes(mesh => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    this.scene.add(...meshes);
  }

  update(time: number): void {
    // this.mesh.material.uniforms.uTime = { value: time / 1000 };
  }

  destroy(): void {
    this.scene.remove();
    this.scene.clear();
    this.gui.remove(this.slider);
  }

  generateHexagon(height: number, position: THREE.Vec2) {
    const geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);

    geo.translate(position.x, height * 0.5, position.y);

    return geo;
  }
}
