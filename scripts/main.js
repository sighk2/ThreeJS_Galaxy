// Web Audio API Setup
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const size = 1024;
const webAudioTouchUnlock = context => {
  // Audio Context bt default is diabled on iOS deveices
  // This Function is to unlock its state by listening to a touch event
  if (context.state === "suspended" && "ontouchstart" in window) {
    const unlock = () => {
      context.resume().then(() => {
        document.body.removeEventListener("touchstart", unlock);
        document.body.removeEventListener("touchend", unlock);
      });
    };

    document.body.addEventListener("touchstart", unlock, false);
    document.body.addEventListener("touchend", unlock, false);
  }
};
webAudioTouchUnlock(audioCtx);

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

const colorsPalette = {
  lightRed: 0xdb050d,
  grey: 0xad6a64,
  pink: 0xc92323,
  background: 0x4f1521,
  darkRed: 0x8e0813,
  sand: 0xddb967
};
let shadowBool = false; // Turn on/off Shadow

// Canvas Setup
const canvas = document.getElementById("three");
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(colorsPalette.background);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvasWidth, canvasHeight);
renderer.shadowMap.enabled = shadowBool;
// Increase Shadow Quality
renderer.shadowMapSoft = shadowBool;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(colorsPalette.background, 1, 75);

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  65, // Filed of View: the extent of the scene that is seen on the display at any given moment
  canvasWidth / canvasHeight, // Aspect Ratio: usually element width / height
  // Render Range
  0.1, // Near
  1000 // Far
);

// Setup Camera to Orbit Around Object
// const orbitControls = new THREE.OrbitControls(camera);

// Set Camera Position
camera.position.set(0, 0, 10);
// orbitControls.enabled = false;
// orbitControls.update(); // Orbit Controls

// Lights Setup
const ambLight = new THREE.AmbientLight(0xfffff, 0.5);
scene.add(ambLight);
const pointLight = new THREE.PointLight(0xfffff, 0.4);
pointLight.position.set(-5, 20, 10);
pointLight.castShadow = shadowBool;
// Increase Shadow Quality
pointLight.shadow.bias = 0.0001;
pointLight.shadow.mapSize.width = 512; // Increase this to 2048 to achieve okay shadow
pointLight.shadow.mapSize.height = 512; // Increase this to 2048 to achieve okay shadow

scene.add(pointLight);

// Create Box Object
const geometryBox = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  specular: 0xffffff,
  shininess: 5
});
const box = new THREE.Mesh(geometryBox, boxMaterial);
box.position.set(0, 0, 0);
box.castShadow = shadowBool;
scene.add(box);

//Replacing the box with video plane 
/*var video = document.getElementById('video');
var texture = new THREE.VideoTexture(video);
texture.needsUpdate;
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RGBFormat;

var imageObject = new THREE.Mesh(new THREE.PlaneGeometry(480, 204),new THREE.MeshBasicMaterial({ map: texture }));
imageObject.position.set(0,0,0);
scene.add( imageObject );
video.load();
//video.style.display = 'block';
video.play();*/ // Video loads and plays in background but it's not visible in the scene 

// Create Ground
const date = new Date();
const pn = new Perlin("rnd" + date.getTime());
let ground, ground2;
const addGround = () => {
  let groundMat = new THREE.MeshBasicMaterial({
    color: colorsPalette.sand
  });
  let plane = new THREE.PlaneGeometry(200, 5000, 100, 500);
  ground = new THREE.Mesh(plane, groundMat);
  for (let i = 0, l = plane.vertices.length; i < l; i++) {
    let vertex = plane.vertices[i];
    let value = pn.noise(vertex.x / 10, vertex.y / 20, 0);
    vertex.z = value * 10;
  }
  ground.receiveShadow = shadowBool;
  plane.computeFaceNormals();
  plane.computeVertexNormals();
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -20; //lower it
  ground2 = ground.clone();
  ground.position.z = -2400;
  ground2.position.z = -7300;
  ground.doubleSided = true;
  scene.add(ground);
  scene.add(ground2);
};
addGround();

// Create Start Points
const starsGeometry = new THREE.Geometry();
const startsCount = 1500;
for (let i = 0; i < startsCount; i++) {
  let star = new THREE.Vector3();
  star.x = THREE.Math.randFloatSpread(80); // Spread Stars On X Coordinate
  star.y = THREE.Math.randFloat(2, 10); // Spread Stars On Y Coordinate
  star.z = THREE.Math.randFloat(0, -80); // Spread Stars On Z Coordinate
  starsGeometry.vertices.push(star);
}
const starsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.8,
  map: new THREE.TextureLoader().load("imgs/star.png"),
  transparent: true
});
const starField = new THREE.Points(starsGeometry, starsMaterial);
starField.position.z = 0;
const starField2 = starField.clone();
starField2.position.z = -70;
scene.add(starField);
scene.add(starField2);

// Helper
// // AxesHelper: X aixs (red), Y aixs (green), Z axis (blue)
// const axesHelper = new THREE.AxesHelper(10);
// scene.add(axesHelper);
// // GridHelper
// const gridHelper = new THREE.GridHelper(10, 10);
// scene.add(gridHelper);
// // Pointlight Helper
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 1, 0xffffff);
// scene.add(pointLightHelper);
// const shadowHelper = new THREE.CameraHelper(pointLight.shadow.camera);
// scene.add(shadowHelper);

// dat GUI
const guiControl = new function() {
  this.Gain = 0.5;
  this.rotationX = 0.001;
  this.rotationY = 0.001;
  this.rotationZ = 0.001;
  this.songPos = 0;
  this.songPosControl = 0;
  this.moveControl = 0;
  this.starControl = 0;
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
const folder1 = datGUI.addFolder("Audio Controls");
folder1.add(guiControl, "Play");
folder1.add(guiControl, "Pause");
folder1.add(guiControl, "Stop");
folder1.add(guiControl, "Gain", 0, 1);

const folder2 = datGUI.addFolder("Rotation Control");
folder2.add(guiControl, "rotationX", 0, 0.02);
folder2.add(guiControl, "rotationY", 0, 0.02);
folder2.add(guiControl, "rotationZ", 0, 0.02);

const folder3 = datGUI.addFolder("Move Control");
folder3.add(guiControl, "moveControl", -2, 2);
folder3.add(guiControl, "starControl", -0.5, 0.5);

const folder4 = datGUI.addFolder("Camera Control");
folder4.add(guiControl, "cameraControl");

let songDuration;
let guiController; //Renamed to GUI controller to avoid conflict with leap constructor
warpaint.onloadedmetadata = () => {
  songDuration = warpaint.duration;
  guiController = folder1.add(guiControl, "songPosControl", 0, songDuration);
  folder1.add(guiControl, "songPos", 0, songDuration).listen();
  guiController.onFinishChange(value => {
    songPlay();
    songSetTime(value);
  });
};

////////////////////////////////////////////////////////////////////////////////////////////////
//                      Animations/Intereacction Section Start from here                      //
////////////////////////////////////////////////////////////////////////////////////////////////

// Aimation functions so that we can use later
// 1. Resize Box
const boxRescale = value => {
  const size = box.scale;
  const tween = new TWEEN.Tween(size)
    .to({ x: value, y: value, z: value }, 200)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
};

// 2. Control Move Speed (Starfiled + Ground)
const movement = (obj, obj2, value) => {
  obj.position.z += value;
  obj2.position.z += value;
};

// Intereacction functions
// 1. Mouse (Change the Box Position)
let mousePos = { x: 0, y: 0 };
const handleMouseMove = event => {
  let tx = -1 + (event.clientX / canvasWidth) * 2;
  let ty = 1 - (event.clientY / canvasHeight) * 2;
  mousePos = { x: tx, y: ty };
  box.position.x = mousePos.x * 4;
  box.position.y = mousePos.y * 2;
  camera.lookAt(box.position);
};
// 2. For Portable Devieces when Mouse is not Avaliable
const handleTouchmove = event => {
  let tx = -1 + (event.touches[0].pageX / canvasWidth) * 2;
  let ty = 1 - (event.touches[0].pageX / canvasHeight) * 2;
  mousePos = { x: tx, y: ty };
  box.position.x = mousePos.x * 4;
  box.position.y = mousePos.y * 2;
  camera.lookAt(box.position);
};
// TODO: Leap Motion Intereacction will be here

// our leap controller
var leapController;
// our leap camera controls
var controls;

var leapController = new Leap.Controller();
leapController.connect();
 
// The long awaited camera controls!
var controls = new THREE.LeapSpringControls( camera , leapController , scene );
console.log("Leap successfully setup");
console.log(controls);
Leap.loop(function(frame) {

  var hand = frame.hands[0];
  if (!hand) {
    //console.log("hand not found");
    warning.style.display = "block";
    return;
  } else {
    //console.log("hand found");
    warning.style.display = "none";
  }
  
  var position = hand.screenPosition();
  var rotation = hand.roll();

  //Some scaling of position is required so the movement is smooth from left to right 
  box.position.set(-3 + position[0]/100, position[1]/100, position[2]/100);//, position[1], position[2]);
  //console.log(box.position);
  box.rotation.x = rotation; 
  box.rotation.y = -rotation;
  
  //var scale = hand.sphereRadius.toFixed(1) / 30;
  //box.scale.set(scale, scale, scale);
  camera.lookAt(box.position);
  
}).use('screenPosition', {scale: 2.0});


// TODO: Facetracking to change the Rendering state
//I moved the render settings at the bottom
//leave some variables here
let songEnded = false;

  // Init Value: Reset everytime the scene is rendered
  // Reset Box Size
  if (box.scale.x === 1.25) {
    boxRescale(1);
  }
  // Reset Star and Ground position when song finish and replay start
  if ((songEnded = true)) {
    if (warpaint.currentTime <= 1) {
      ground.position.y = -10;
      ground2.position.y = -10;
      starField.position.y = 0;
      starField2.position.y = 0;
    }
  }

  // Get & Update Data
  guiControl.songPos = warpaint.currentTime;
  warpaintAnalyser.getFloatFrequencyData(warpaintDataArray); // Get Drum Track Data from Audio Analysers
  document.addEventListener("mousemove", handleMouseMove, false); // Handle Mouse Move
  document.addEventListener("touchmove", handleTouchmove, false); // Handle Touch Move

  const bassThreshold = 30;
  let bass = Math.floor(warpaintDataArray[2] + bassThreshold);
  if (bass >= 4 && bass <= 6) {
    boxRescale(1.25);
  }
  if (bass > 10) {
    // console.log(bass);
  }

  // Set Audio Volume
  gainNode.gain.value = guiControl.Gain;

  // Camera Position
  // orbitControls.enabled = guiControl.cameraControl;
  // orbitControls.update();

  //////////////////////////////////////////////////////////////////////////////////////
  //                 Animation functions will be called from here                     //
  //////////////////////////////////////////////////////////////////////////////////////

  // To Create the illusion of endless Starfield
  movement(starField, starField2, guiControl.starControl);
  if (starField.position.z > 90) {
    console.log("starField move back by -60");
    starField.position.z = -60;
  }
  if (starField2.position.z > 90) {
    console.log("starField2 move back by -60");
    starField2.position.z = -60;
  }

  // To Create the illusion of endless ground
  movement(ground, ground2, guiControl.moveControl);
  if (ground.position.z > 2500) {
    console.log("ground move back 7300");
    ground.position.z = -7300;
  }
  if (ground2.position.z > 2500) {
    console.log("ground2 move back 7300");
    ground2.position.z = -7300;
  }

  // Add movement or animations accoding to the time of music
  // TODO: Intro Part Need to be designed
  
  if (warpaint.currentTime > 45 && warpaint.currentTime < 75) {
    // 1st Section:  Star and ground move
    movement(starField, starField2, 0.1);
    movement(ground, ground2, 1.5);
  } else if (warpaint.currentTime > 75 && warpaint.currentTime < 119.5) {
    // 2nd Section: Camera Postion from front to back, star and ground move slower
    if (camera.position.z <= 10 && camera.position.z >= -10) {
      camera.position.z -= 0.1;
      camera.lookAt(box.position);
    }
    movement(starField, starField2, 0.01);
    movement(ground, ground2, 0.1);
  } else if (warpaint.currentTime > 119.5 && warpaint.currentTime < 164) {
    // 3rd Section: Camera Postion reset, star and ground move faster
    if (camera.position.z < 10) {
      camera.position.z += 0.1;
      camera.lookAt(box.position);
    }
    movement(starField, starField2, 0.1);
    movement(ground, ground2, 0.5);
  } else if (warpaint.currentTime > 164 && warpaint.currentTime < 171.5) {
    // 4th Section: star and ground move slower
    movement(starField, starField2, 0.01);
    movement(ground, ground2, 0.1);
  } else if (warpaint.currentTime > 171.5 && warpaint.currentTime < 209) {
    // 5th Section (Spicy: before ending) star and ground move exremely fast
    movement(starField, starField2, 0.3);
    movement(ground, ground2, 1.8);
  } else if (warpaint.currentTime >= 209) {
    // When thesong finished: star and ground move away from camera
    movement(starField, starField2, 0);
    movement(ground, ground2, 0);
    if (ground.position.y > -60) {
      starField.position.y += -0.1;
      starField2.position.y += -0.1;
      ground.position.y += -0.1;
      ground2.position.y += -0.1;
    }
  }

  TWEEN.update();
   //animateStars();

  // box.rotation.x += guiControl.rotationX;
  // box.rotation.y += guiControl.rotationY;
  // box.rotation.z += guiControl.rotationZ;

  // Render Scene & Camera
  // Render Section:
let isRenderding = true;

// Render
//const render = () => {
// TODO: If no face detected, stop rendering
//if (!isRenderding) return;
 function animate()
 {
  renderer.render(scene, camera);
  //controls.update();
  requestAnimationFrame(animate);
//};
 }
 animate();
//render();

////////////////////////////////////////////////////////////////////////////////////////////////
//                      Animations/Intereacction Section Finish                               //
////////////////////////////////////////////////////////////////////////////////////////////////

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
  songEnded = true;
});

// Face Tracking to start/pause render and play/pause music
/*GLANCETRACKERAPI.init({
  // MANDATORY :
  // callback launched when :
  //  * the user is watching (isWatching=true)
  //  * or when he stops watching (isWatching=false)
  // it can be used to play/pause a video
  callbackTrack: function(isWatching) {
    if (isWatching) {
      console.log("Hey, you are watching bro");
      isRenderding = true;
      render();
      warpaint.play();
    } else {
      let faceTrackingCanvas = document.querySelector("#glanceTrackerCanvas");
      faceTrackingCanvas.style.zIndex = "0";
      console.log("You are not watching anymore :(");
      isRenderding = false;
      warpaint.pause();
    }
  },

  // FACULTATIVE (default: none) :
  // callback launched when then Jeeliz Glance Tracker is ready
  // or if there was an error
  callbackReady: function(error) {
    if (error) {
      console.log("EN ERROR happens", error);
      return;
    }
    console.log("All is well :)");
  },

  //FACULTATIVE (default: true) :
  //true if we display the video of the user
  //with the face detection area on the <canvas> element
  isDisplayVideo: true,

  // MANDATORY :
  // id of the <canvas> HTML element
  canvasId: "glanceTrackerCanvas",

  // FACULTATIVE (default: internal)
  // sensibility to the head vertical axis rotation
  // float between 0 and 1 :
  // * if 0, very sensitive, the user is considered as not watching
  //   if he slightly turns his head,
  // * if 1, not very sensitive : the user has to turn the head a lot
  //   to loose the detection.
  sensibility: 0.5,

  // FACULTATIVE (default: current directory)
  // should be given without the NNC.json
  // and ending by /
  // for example ../../
  NNCpath: "libs/"
});*/
