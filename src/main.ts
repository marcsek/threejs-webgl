import * as THREE from 'three';
import dat from 'dat.gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import { LevelGenerator, LevelID, levelIDS } from './LevelGenerator';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setClearColor(0x0f0f0f);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const gui = new dat.GUI();

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.listenToKeyEvents(window);
orbit.enableDamping = true;

gui.add<{ level: LevelID }>({ level: 'Test' }, 'level', levelIDS).onChange(e => {
  level.destroy();
  level = LevelGenerator.createLevel(e, levelFolder);
  level.init();
});

const levelFolder = gui.addFolder('Level atributes');
levelFolder.open();

let level = LevelGenerator.createLevel('Test', levelFolder);
level.init();

camera.position.set(-12, 9, 16);

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
