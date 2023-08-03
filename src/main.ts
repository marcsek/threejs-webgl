import * as THREE from 'three';
import dat from 'dat.gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import { LevelGenerator, LevelID, levelIDS } from './LevelGenerator';
import { Level } from './Level';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.setClearColor(0x050505);
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
  composer.addPass(new RenderPass(level.scene, camera));
  level = LevelGenerator.createLevel(e, levelFolder, pmrem);
  loadLevel(level);
});

const levelFolder = gui.addFolder('Level attributes');
levelFolder.open();

let level = LevelGenerator.createLevel('Terrain', levelFolder, pmrem);
loadLevel(level);
camera.position.set(0, 30, 50);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(level.scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.2, 0.5, 1);
composer.addPass(bloomPass);

const loop: XRFrameRequestCallback = time => {
  stats.begin();
  level.update(time);

  composer.render();

  orbit.update();
  stats.end();
};

renderer.setAnimationLoop(loop);

window.addEventListener(
  'resize',
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    composer.setSize(window.innerWidth, window.innerHeight);

    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

function loadLevel(level: Level) {
  setLoading(true);
  level.init();
  setLoading(false);
}
