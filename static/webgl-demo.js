import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

//3JS BOILER PLATE
const DEFAULT_TRANSLATE = 0.2;
const ROTATION_RADS = 0.0175;
const NINTY_ROTATION = 1.5708;
const canvas = document.querySelector("#glcanvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const loader = new GLTFLoader();
camera.position.set(0, 0.5, 4);
scene.add(camera);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(
  window.innerWidth * (99 / 100),
  window.innerHeight * (97.5 / 100)
);
let frogModel = null;
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
let bonesArray = [];
//Loading Model
loader.load(
  // resource URL
  // "frog.glb",
  "RiggedFrog.glb",
  // called when the resource is loaded
  async function (gltf) {
    scene.add(gltf.scene);

    gltf.animations; // Array<THREE.AnimationClip>
    gltf.scene; // THREE.Group
    gltf.scenes; // Array<THREE.Group>
    gltf.cameras; // Array<THREE.Camera>
    gltf.asset; // Object
    frogModel = gltf.scene;
    listBones(gltf.scene);
  },

  //0 - 4 useless --> 5,6,7,8 are back bones?
  //5 -- nose
  //6 -- middle of face
  //7 - back bone between arms
  //8 - second last back bone
  //8
  //9 --> similar to 19 but right
  //10 - right leg thigh
  //11 - right leg knee
  //12 - right leg second fold (second knee)
  //13-14,15-16, 17-18  - Fingers of right foot
  //19  ?? --> similar to 9 but left
  //20 - left thigh
  //21 - left knee
  //22 - left knee 2
  //23 - left ankle
  //24-25, 25-26, 27-28 - fingers on left foot
  //29 -- back between both hands
  //30 -- right hand back
  //31 -- right hand mid
  //32 -- right hand wrist
  //33 -- 34 , 35-36, 37-38 all finger combos on right hand
  //39 -- left hand back
  //40 -- left hand mid
  //41 -- left hand wrist
  //42 -43, 44-45, 45-46 are all finger combos on left hand

  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called when loading has errors
  function (error) {
    console.log("An error happened");
  }
);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Key Press Handling  :
// Arrow keys : translation
// Arrow keys + shift : rotation
// J : Jump Forward
// Q : Swim
// W : front legs extend Forward
// A : look left
// D : look right
// S : back legs extend backwards

let keysPressed = {};
document.onkeydown = handleKeyPress;

function handleKeyPress(event) {
  console.log(event);
  event = event || window.event;
  keysPressed[event.key] = true;
  if (frogModel) {
    if (event.key === "ArrowUp") {
      if (keysPressed["Shift"]) {
        frogModel.rotateX(-2 * ROTATION_RADS);
      } else {
        frogModel.translateZ(DEFAULT_TRANSLATE);
      }
    } else if (event.key == "ArrowDown") {
      if (keysPressed["Shift"]) {
        frogModel.rotateX(2 * ROTATION_RADS);
      } else {
        frogModel.translateZ(-DEFAULT_TRANSLATE);
      }
    } else if (event.key == "ArrowLeft") {
      if (keysPressed["Shift"]) {
        frogModel.rotateZ(2 * ROTATION_RADS);
      } else {
        frogModel.translateX(-DEFAULT_TRANSLATE);
      }
    } else if (event.key == "ArrowRight") {
      if (keysPressed["Shift"]) {
        frogModel.rotateZ(-2 * ROTATION_RADS);
      } else {
        frogModel.translateX(DEFAULT_TRANSLATE);
      }
    } else if (event.key == "a") {
      console.log("A pressed, rotating model");
      frogModel.rotateY(-NINTY_ROTATION);
    } else if (event.key == "d") {
      frogModel.rotateY(+NINTY_ROTATION);
    } else if (event.key == "w") {
      animateHandsForward();
    }
  }
}

document.onkeyup = handleKeyRelease;

function handleKeyRelease(event) {
  delete keysPressed[event.key];
}

function listBones(child) {
  bonesArray.push(child);
  for (let i = 0; i < child.children.length; i++) {
    listBones(child.children[i]);
  }
}

function rotateBoneAtIndex(i) {
  console.log(i);
  bonesArray[i].rotateX(90);
}

function animateHandsForward() {
  if (frogModel) {
    // bonesArray[32].rotateZ(-1.45);
    // bonesArray[41].rotateZ(-1.45);
    // bonesArray[31].translateX(0.05);
    // bonesArray[40].translateX(-0.05);
    bonesArray[30].rotateZ(-1.45);
    bonesArray[39].rotateZ(-1.45);
  }
  console.log(bonesArray[30].quaternion);
  console.log(bonesArray[39].quaternion);
}
animate();

// Set up jump animation parameters
const jumpHeight = 2;
const jumpDuration = 1;
let jumpStartTime = null;

// Define jump animation function
function animateJump() {
  const time = (Date.now() - jumpStartTime) / jumpDuration;
  const position = new THREE.Vector3(0, 0, 0);

  // Use sin-cos functions to calculate position of frog skeleton
  position.x = Math.sin(time * Math.PI) * 2;
  position.y = Math.cos(time * Math.PI) * jumpHeight;

  // Use .lerp Vector3 command to smoothly transition to new position
  frogMesh.position.lerp(position, 0.1);

  // Control the legs and hands
  const legAngle = time * Math.PI;
  const footAngle = time * Math.PI * 2;

  bonesArray[12].rotation.x = (Math.sin(legAngle) * Math.PI) / 4;
  bonesArray[30].rotation.x = (Math.sin(footAngle) * Math.PI) / 4;
  bonesArray[22].rotation.x = (Math.sin(legAngle + Math.PI) * Math.PI) / 4;
  bonesArray[39].rotation.x = (Math.sin(footAngle + Math.PI) * Math.PI) / 4;

  if (time < 1) {
    requestAnimationFrame(animateJump);
  }
}

// Define function to start jump animation
function startJump() {
  jumpStartTime = Date.now();
  requestAnimationFrame(animateJump);
}

// Call startJump function to begin animation
startJump();
