import { Level } from '../../Level';
import * as THREE from 'three';
import { GUIController } from 'dat.gui';
import { noise as pNoise, noiseDetail, resetPerlin } from '../../NoiseFunctions/Perlin';
import { MeshManager } from './MeshManager';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, oscilate, wrap } from '../../MathUtils';

const MESH_SIZE = 64;
const MAX_HEIGHT = 10 ** 1.25;
const DAY_COLOR = new THREE.Color('#d1b26b');
const NIGHT_COLOR = new THREE.Color('#101010');

export class Terrain extends Level {
  pmrem: THREE.PMREMGenerator;
  meshManager: MeshManager;
  slider: GUIController;
  sunPivot: THREE.Object3D;

  constructor(gui: dat.GUI, pmrem: THREE.PMREMGenerator) {
    super(gui);

    this.pmrem = pmrem;
    this.meshManager = new MeshManager();
    this.sunPivot = new THREE.Object3D();
    this.slider = this.gui.add({ scale: 2 }, 'scale', 20, 15);
  }

  async init() {
    const sunColor = new THREE.Color('#FDB813');
    const sunGeo = new THREE.SphereGeometry(1, 20, 20);
    const sunMat = new THREE.MeshStandardMaterial({
      toneMapped: false,
      emissive: sunColor,
      color: sunColor,
      emissiveIntensity: 10,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    const pointLight = new THREE.PointLight(sunColor.convertSRGBToLinear(), 0.9, 200);
    pointLight.add(sunMesh);
    pointLight.position.set(40, 0, 0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    pointLight.shadow.camera.near = 10;
    pointLight.shadow.camera.far = 500;

    this.sunPivot.add(pointLight);
    this.scene.add(this.sunPivot);

    const envMapTexture = await new RGBELoader().setDataType(THREE.FloatType).loadAsync('/src/Levels/Terrain/assets/envmap.hdr');
    const envMap = this.pmrem.fromEquirectangular(envMapTexture).texture;

    const textureLoader = new THREE.TextureLoader();
    const stone = textureLoader.load('/src/Levels/Terrain/assets/stone.png');
    const sand = textureLoader.load('/src/Levels/Terrain/assets/sand.jpg');
    const grass = textureLoader.load('/src/Levels/Terrain/assets/grass.jpg');
    const dirt = textureLoader.load('/src/Levels/Terrain/assets/dirt.png');
    const dirt2 = textureLoader.load('/src/Levels/Terrain/assets/dirt2.jpg');
    const water = textureLoader.load('/src/Levels/Terrain/assets/water.jpg');

    this.meshManager.setMaterials([
      { key: 'stone', material: new THREE.MeshStandardMaterial({ map: stone, flatShading: true, envMapIntensity: 0.135 }) },
      { key: 'sand', material: new THREE.MeshStandardMaterial({ map: sand, flatShading: true, envMapIntensity: 0.135 }) },
      { key: 'grass', material: new THREE.MeshStandardMaterial({ map: grass, flatShading: true, envMapIntensity: 0.135 }) },
      { key: 'dirt', material: new THREE.MeshStandardMaterial({ map: dirt, flatShading: true, envMapIntensity: 0.135 }) },
      { key: 'dirt2', material: new THREE.MeshStandardMaterial({ map: dirt2, flatShading: true, envMapIntensity: 0.135 }) },
      { key: 'Leaves', material: new THREE.MeshStandardMaterial({ map: dirt, flatShading: true, envMapIntensity: 0.135 }) },
      { key: 'Base', material: new THREE.MeshStandardMaterial({ map: grass, flatShading: true, envMapIntensity: 0.135 }) },
    ]);

    const treeParadigm = await loadModelHelper('/src/Levels/Terrain/assets/strom.glb', 0.5, true);
    this.meshManager.overrideSceneMeshMaterial(treeParadigm);

    const waterGeo = new THREE.CylinderGeometry(MESH_SIZE / 2 + 1, MESH_SIZE / 2 + 1, MAX_HEIGHT * 0.1, 50);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#55aaff').convertSRGBToLinear().multiplyScalar(3),
      ior: 1.4,
      transmission: 1,
      transparent: true,
      thickness: 0.2,
      envMapIntensity: 0.2,
      roughness: 0.4,
      metalness: 0.025,
      metalnessMap: water,
      roughnessMap: water,
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, MAX_HEIGHT * 0.05, 0);
    waterMesh.receiveShadow = true;

    generateWorld(treeParadigm, this.meshManager, this.scene);

    const meshes = this.meshManager.generateMeshes(mesh => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    this.scene.environment = envMap;
    this.scene.add(...meshes);
    this.scene.add(waterMesh);
    this.scene.background = new THREE.Color('#d1b26b');
  }

  update(time: number): void {
    const speed = 2;
    const increment = speed * (time / 10000);

    this.sunPivot.rotation.z = wrap(increment / 4, 0, 1) * Math.PI * 2;
    this.scene.background = new THREE.Color().lerpColors(NIGHT_COLOR, DAY_COLOR, clamp(0, 1, oscilate(increment + 1, -1, 1)));
  }

  destroy(): void {
    this.scene.remove();
    this.gui.remove(this.slider);
  }
}

const generateWorld = (treeParadigm: THREE.Group, meshManager: MeshManager, scene: THREE.Scene) => {
  noiseDetail(8, 0.5);
  for (let y = -MESH_SIZE / 2; y <= MESH_SIZE / 2; y++) {
    for (let x = -MESH_SIZE / 2; x <= MESH_SIZE / 2; x++) {
      const position = tileToPos({ x, y });
      if (position.length() > MESH_SIZE / 2 + 1) continue;

      let noise = pNoise((x + MESH_SIZE) * 0.2, (y + MESH_SIZE) * 0.2);
      noise = (noise * 10) ** 2.25;
      const height = noise / 10;

      const newHex = generateHexagon(height, position);

      if (height < MAX_HEIGHT * 0.15) {
        meshManager.addGeometry('sand', newHex);
      } else if (height < MAX_HEIGHT * 0.25) {
        meshManager.addGeometry('grass', newHex);
        if (Math.random() < 0.05) {
          const newTree = generateTree(new THREE.Vector3(position.x, height, position.y), treeParadigm);
          scene.add(newTree);
        }
      } else if (height < MAX_HEIGHT * 0.4) {
        meshManager.addGeometry('dirt', newHex);
      } else if (height < MAX_HEIGHT * 0.5) {
        meshManager.addGeometry('dirt2', newHex);
      } else {
        meshManager.addGeometry('stone', newHex);
      }
    }
  }
  resetPerlin();
};

const generateTree = (position: THREE.Vector3, treeParadigm: THREE.Group): THREE.Group => {
  const tree = treeParadigm.clone();
  tree.position.set(position.x, position.y, position.z);
  return tree;
};

const generateHexagon = (height: number, position: THREE.Vec2) => {
  const geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);

  geo.translate(position.x, height * 0.5, position.y);

  return geo;
};

const loadModelHelper = async (url: string, scale: number = 1, shadows: boolean = false) => {
  const loader = new GLTFLoader();
  const model = (await loader.loadAsync(url)).scene;
  model.traverse(obj => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = shadows;
      obj.receiveShadow = shadows;
    }
  });
  model.scale.set(scale, scale, scale);
  return model;
};

const tileToPos = (tile: THREE.Vec2): THREE.Vector2 => new THREE.Vector2((tile.x + (tile.y % 2) * 0.5) * 1.77, tile.y * 1.535);
