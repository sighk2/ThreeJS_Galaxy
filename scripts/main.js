// Web Audio API Setup
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const size = 1024;

// Create Drum Analyser
const warpaintAnalyser = audioCtx.createAnalyser();
warpaintAnalyser.fftSize = size;
const warpaintBufferLength = warpaintAnalyser.frequencyBinCount;
console.log(`Warpaint Buffer Length is ${warpaintBufferLength}`);
const warpaintDataArray = new Float32Array(warpaintBufferLength);
const warpaintArray = [];

// Create Audio Element
const warpaint = new Audio("warpaint.mp3");

// Create Audio Node
const warpaintSource = audioCtx.createMediaElementSource(warpaint);

// Create FIlter Node
const filter = audioCtx.createBiquadFilter();
filter.type = "allpass";

// Connect Audio Nodes to Analyser
warpaintSource.connect(filter);

filter.connect(warpaintAnalyser);

// Create Gain Node
const gainNode = audioCtx.createGain();

// Connect Audio to Filter
warpaintAnalyser.connect(gainNode);

// Connect Analyser to Audio Context Destination
gainNode.connect(audioCtx.destination);

// Audio Control Methods
const songPlay = () => {
  warpaint.play();
};

const songPause = () => {
  warpaint.pause();
};

const songSetTime = value => {
  warpaint.currentTime = value;
};

// Web Audio API Setup Done
// Three.js Setup

let shadowBool = false; // Turn on/off Shadow

// Canvas Setup
const canvas = document.getElementById("three");
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(0xffffff);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvasWidth, canvasHeight);
renderer.shadowMap.enabled = shadowBool;
// Increase Shadow Quality
renderer.shadowMapSoft = shadowBool;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene Setup
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  65, // Filed of View: the extent of the scene that is seen on the display at any given moment
  canvasWidth / canvasHeight, // Aspect Ratio: usually element width / height
  // Render Range
  0.1, // Near
  1000 // Far
);

// Setup Camera to Orbit Around Object
const orbitControls = new THREE.OrbitControls(camera);

// Set Camera Position
camera.position.set(5, 5, 5);
orbitControls.enabled = false;
orbitControls.update(); // Orbit Controls

// Lights Setup
const ambLight = new THREE.AmbientLight(0xfffff, 0.8);
scene.add(ambLight);
const pointLight = new THREE.PointLight(0xfffff, 0.6);
pointLight.position.set(-5, 20, 20);
pointLight.castShadow = shadowBool;
// Increase Shadow Quality
pointLight.shadow.bias = 0.0001;
pointLight.shadow.mapSize.width = 512; // Increase this to 2048 to achieve okay shadow
pointLight.shadow.mapSize.height = 512; // Increase this to 2048 to achieve okay shadow

scene.add(pointLight);

// Create Box Object
const geometryBox = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshPhongMaterial({
  color: 0x7777ff,
  specular: 0x7777ff,
  shininess: 5
});

const box = new THREE.Mesh(geometryBox, boxMaterial);
box.position.set(2, 2, 2);
box.castShadow = shadowBool;
scene.add(box);

// Create Plane
const geometryPlane = new THREE.PlaneGeometry(1000, 1000, 1000);
const planeMaterial = new THREE.MeshPhongMaterial({
  color: 0x000000,
  specular: 0x000000,
  shininess: 1
});
const plane = new THREE.Mesh(geometryPlane, planeMaterial);
plane.material.side = THREE.DoubleSide;
plane.receiveShadow = shadowBool;
plane.rotation.x = 0.5 * Math.PI;
scene.add(plane);

// Create Start Points
const starsGeometry = new THREE.Geometry();
const startsCount = 3000;
for (let i = 0; i < startsCount; i++) {
  let star = new THREE.Vector3();
  star.x = THREE.Math.randFloatSpread(30); // Spread Stars On X Coordinate
  star.y = THREE.Math.randFloat(0, 10); // Spread Stars On Y Coordinate
  star.z = THREE.Math.randFloatSpread(30); // Spread Stars On Z Coordinate
  starsGeometry.vertices.push(star);
}
const starsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.35,
  map: new THREE.TextureLoader().load("imgs/star.png"),
  transparent: true
});
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// Helper
// AxesHelper: X aixs (red), Y aixs (green), Z axis (blue)
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);
// GridHelper
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);
// Pointlight Helper
const pointLightHelper = new THREE.PointLightHelper(pointLight, 1, 0x000000);
scene.add(pointLightHelper);

// dat GUI
const guiControl = new function() {
  this.Gain = 0.5;
  this.rotationX = 0.001;
  this.rotationY = 0.001;
  this.rotationZ = 0.001;
  this.songPos = 0;
  this.songPosControl = 0;
  this.cameraControl = false;
  this.Play = () => {
    songPlay();
  };
  this.Pause = () => {
    songPause();
  };
  this.Stop = () => {
    songPause();
    songSetTime(0);
  };
}();

const datGUI = new dat.GUI();
const folder1 = datGUI.addFolder("Aduio Controls");
folder1.add(guiControl, "Play");
folder1.add(guiControl, "Pause");
folder1.add(guiControl, "Stop");
folder1.add(guiControl, "Gain", 0, 1);

const folder2 = datGUI.addFolder("Rotation Control");
folder2.add(guiControl, "rotationX", 0, 0.02);
folder2.add(guiControl, "rotationY", 0, 0.02);
folder2.add(guiControl, "rotationZ", 0, 0.02);

const folder3 = datGUI.addFolder("Camera Control");
folder3.add(guiControl, "cameraControl");

let songDuration;
let controller;
warpaint.onloadedmetadata = () => {
  songDuration = warpaint.duration;
  controller = folder1.add(guiControl, "songPosControl", 0, songDuration);
  folder1.add(guiControl, "songPos", 0, songDuration).listen();
  controller.onFinishChange(value => {
    songPlay();
    songSetTime(value);
  });
};

// Rescale Animation Function
const boxRescale = value => {
  const size = box.scale;
  const tween = new TWEEN.Tween(size)
    .to({ x: value, y: value, z: value }, 200)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
};

let isRenderding = true;

// Render The Scene
const render = () => {
  if (!isRenderding) return;
  requestAnimationFrame(render);

  // Init Value: Reset everytime the scene is rendered
  if (box.scale.x === 1.25) {
    boxRescale(1);
  }

  // Get & Update Data
  guiControl.songPos = warpaint.currentTime;
  warpaintAnalyser.getFloatFrequencyData(warpaintDataArray); // Get Drum Track Data from Audio Analysers

  const kickThreshold = 30;
  let kick = Math.floor(warpaintDataArray[2] + kickThreshold);
  if (kick >= 4 && kick <= 6) {
    boxRescale(1.25);
    console.log(kick);
  }

  // Set Audio Volume
  gainNode.gain.value = guiControl.Gain;

  // Camera Position
  orbitControls.enabled = guiControl.cameraControl;
  orbitControls.update();

  // Animations
  starField.rotation.y += 0.001; // StarField Rotation
  TWEEN.update();

  box.rotation.x += guiControl.rotationX;
  box.rotation.y += guiControl.rotationY;
  box.rotation.z += guiControl.rotationZ;

  // Render Scene & Camera
  renderer.render(scene, camera);
};

render();

// Window Resize Handler
window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

warpaint.addEventListener("ended", function() {
  console.log("ended");
});
