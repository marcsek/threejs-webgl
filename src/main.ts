import * as THREE from 'three';
import dat from 'dat.gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import { LevelGenerator, LevelID, levelIDS } from './LevelGenerator';
import { Level } from './Level';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.setClearColor(0xd1b26b);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const gui = new dat.GUI();

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.listenToKeyEvents(window);
orbit.enableDamping = true;

const pmrem = new THREE.PMREMGenerator(renderer);

const loaderDiv = document.getElementById('loader');
const setLoading = (s: boolean) => (loaderDiv!.style.display = !s ? 'none' : '');

gui.add<{ level: LevelID }>({ level: 'Terrain' }, 'level', levelIDS).onChange(e => {
  level.destroy();
  level = LevelGenerator.createLevel(e, levelFolder, pmrem);
  loadLevel(level);
});

const levelFolder = gui.addFolder('Level attributes');
levelFolder.open();

let level = LevelGenerator.createLevel('Terrain', levelFolder, pmrem);
loadLevel(level);
camera.position.set(0, 16, 0);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const loop: XRFrameRequestCallback = time => {
  stats.begin();
  level.update(time);

  renderer.render(level.scene, camera);

  orbit.update();
  stats.end();
};

renderer.setAnimationLoop(loop);

window.addEventListener(
  'resize',
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

function loadLevel(level: Level) {
  setLoading(true);
  level.init();
  setLoading(false);
}
