import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

//3JS BOILER PLATE
const clock = new THREE.Clock();
let deltaTime;
const DEFAULT_TRANSLATE = 0.2;
const ROTATION_RADS = 0.0175;
const NINTY_ROTATION = 1.5708;
const canvas = document.querySelector("#glcanvas");
const scene = new THREE.Scene();

// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );

// camera.position.set(0, 0.5, 5);

const loader = new GLTFLoader();
// scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(
  window.innerWidth * (99 / 100),
  window.innerHeight * (97.5 / 100)
);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 1, 10);

controls.update();

let frogModel = null;
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);
let bonesArray = [];

//Animation related
let armsExtended = false;
let originalRotations;
let legsExtended = false;
let originalRotationsLegs;
let armsExtendedSwim = false;
let isSwimming= false;

//Loading Model
loader.load(
  // "frog.glb",
  "Frog(FragmentShader).glb",
  // "frog.gltf",
  // called when the resource is loaded
  async function (gltf) {
    scene.add(gltf.scene);

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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

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
const jumpDuration = 1;
const jumpHeight = 1.5;
function handleKeyPress(event) {
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
      frogModel.rotateY(-NINTY_ROTATION);
    } else if (event.key == "d") {
      frogModel.rotateY(+NINTY_ROTATION);

      // [EXTEND ARMS]
    } else if (event.key == "w") {
      // const axis = new THREE.Vector3().subVectors(bonesArray[31].position, bonesArray[40].position).normalize();
      // bonesArray[31].rotateOnWorldAxis(axis, -1.5);
      // bonesArray[40].rotateOnWorldAxis(axis, 1.5);
      // bonesArray[30].rotateOnAxis(axis, 1.5);
      // bonesArray[39].rotateOnAxis(axis, -1);
      if (armsExtended) {
        retractArms();
      } else {
        extendArms();
      }

      // [EXTEND FEET]
    } else if (event.key == "s") {
      // const axisThighs = new THREE.Vector3().subVectors(bonesArray[10].position, bonesArray[20].position).normalize();
      // bonesArray[10].rotateOnWorldAxis(axisThighs, 2);
      // bonesArray[20].rotateOnWorldAxis(axisThighs, -2);
      // bonesArray[11].rotateOnWorldAxis(axisThighs,-1);
      // bonesArray[21].rotateOnWorldAxis(axisThighs,1);
      if (legsExtended) {
        retractLegs();
      } else {
        extendLegs();
      }

      // [JUMP]
    } else if (event.key === "j") {
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(frogModel.quaternion);

      // Animate the jump by moving the frog along the jump path using the lerp function
      const startPosition = frogModel.position.clone();
      const endPosition = startPosition.clone().add(forward).add(forward);

      const initialLeftLegRotation = bonesArray[10].rotation.clone();
      const initialRightLegRotation = bonesArray[20].rotation.clone();
      const initialLeftArmRotation = bonesArray[30].rotation.clone();
      const initialRightArmRotation = bonesArray[39].rotation.clone();
      if (armsExtended) {
        retractArms();
      }
      if (legsExtended) {
        retractLegs();
      }
      extendArms();
      extendLegs();
      let time = 0;
      const animateJump = () => {
        time += 0.01;
        if (time > jumpDuration) time = jumpDuration;
        const position = new THREE.Vector3().lerpVectors(
          startPosition,
          endPosition,
          time / jumpDuration
        );
        const y = jumpHeight * Math.sin((Math.PI * time) / jumpDuration);
        position.setY(position.y + y);
        frogModel.position.copy(position);
        if (time < jumpDuration) {
          requestAnimationFrame(animateJump);
        } else {
          retractArms();
          retractLegs();
        }
      };
      animateJump();
    }else if(event.key == "k"){
      if(isSwimming){
        isSwimming = false;
        retractArms();
        retractLegs();
      }else{
        extendArmsToSwim();
        loopLegsForSwim();
        isSwimming = true;
      }
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

function rotateBone(bone, oppositeDirection, angle, startAngle, rotationAxis) {
  let rotationQuaternion = new THREE.Quaternion().setFromEuler(bone.rotation);
  const rotationOffset = new THREE.Quaternion().setFromAxisAngle(
    rotationAxis,
    angle
  );
  bone.rotation.copy(startAngle);
  bone.rotation.setFromQuaternion(rotationOffset);
}

function rotateBoneAtIndex(i) {
  console.log(i);
  bonesArray[i].rotateX(90);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  deltaTime = clock.getDelta();
}

animate();

function extendArms() {
  originalRotations = [
    bonesArray[31].quaternion.clone(),
    bonesArray[40].quaternion.clone(),
    bonesArray[30].quaternion.clone(),
    bonesArray[39].quaternion.clone(),
  ];

  let time = 0;
  const duration = 1; // Animation duration in seconds
  const axis = new THREE.Vector3()
    .subVectors(bonesArray[31].position, bonesArray[40].position)
    .normalize();
  const speed = 2.1; // Rotation speed in radians per second

  function updateBones() {
    time += deltaTime;

    const progress = Math.min(time / duration, 1); // Clamp progress to 1 after the duration is reached

    // Update bone rotations based on progress
    bonesArray[31].rotateOnWorldAxis(axis, -speed * deltaTime);
    bonesArray[40].rotateOnWorldAxis(axis, speed * deltaTime);
    bonesArray[30].rotateOnAxis(axis, speed * deltaTime);
    bonesArray[39].rotateOnAxis(axis, -speed * deltaTime);

    if (progress < 1) {
      // If the animation is not complete, request the next frame
      requestAnimationFrame(updateBones);
    }
  }
  // Start the animation
  requestAnimationFrame(updateBones);
  armsExtended = true;
}

function extendLegs() {
  originalRotationsLegs = [
    bonesArray[10].quaternion.clone(),
    bonesArray[20].quaternion.clone(),
    bonesArray[11].quaternion.clone(),
    bonesArray[21].quaternion.clone(),
  ];

  let time = 0;
  const duration = 1; // Animation duration in seconds
  const axis = new THREE.Vector3()
    .subVectors(bonesArray[10].position, bonesArray[20].position)
    .normalize();
  const speed = 1; // Rotation speed in radians per second

  function updateBones() {
    time += deltaTime;

    const progress = Math.min(time / duration, 1); // Clamp progress to 1 after the duration is reached

    // Update bone rotations based on progress
    bonesArray[10].rotateOnWorldAxis(axis, 2 * speed * deltaTime);
    bonesArray[20].rotateOnWorldAxis(axis, -2 * speed * deltaTime);
    bonesArray[11].rotateOnWorldAxis(axis, -speed * deltaTime);
    bonesArray[21].rotateOnWorldAxis(axis, speed * deltaTime);

    if (progress < 1) {
      // If the animation is not complete, request the next frame
      requestAnimationFrame(updateBones);
    }
  }
  // Start the animation
  requestAnimationFrame(updateBones);
  legsExtended = true;
}

function retractArms() {
  bonesArray[31].quaternion.copy(originalRotations[0]);
  bonesArray[40].quaternion.copy(originalRotations[1]);
  bonesArray[30].quaternion.copy(originalRotations[2]);
  bonesArray[39].quaternion.copy(originalRotations[3]);
  armsExtended = false;
}

function retractLegs() {
  bonesArray[10].quaternion.copy(originalRotationsLegs[0]);
  bonesArray[20].quaternion.copy(originalRotationsLegs[1]);
  bonesArray[11].quaternion.copy(originalRotationsLegs[2]);
  bonesArray[21].quaternion.copy(originalRotationsLegs[3]);
  legsExtended = false;
}


function extendArmsToSwim(){
  originalRotations = [
    bonesArray[31].quaternion.clone(),
    bonesArray[40].quaternion.clone(),
    bonesArray[30].quaternion.clone(),
    bonesArray[39].quaternion.clone()
  ];
  
  let time = 0;
  const duration = 1; // Animation duration in seconds
  const axis = new THREE.Vector3().subVectors(bonesArray[31].position, bonesArray[40].position).normalize();
  const speed = 2.10; // Rotation speed in radians per second

  function updateBones() {
    time += deltaTime;

    const progress = Math.min(time / duration, 1); // Clamp progress to 1 after the duration is reached

    // Update bone rotations based on progress
    bonesArray[30].rotateX(-speed*deltaTime);
    bonesArray[39].rotateX(speed*deltaTime);

    if (progress < 1) {
      // If the animation is not complete, request the next frame
      requestAnimationFrame(updateBones);
    }else{
      if(isSwimming){
        retractArms()
        extendArmsToSwim()
      }else{
        retractArms();
      }
    }
  }
  // Start the animation
  requestAnimationFrame(updateBones);
  armsExtended = true;
}

function loopLegsForSwim(){
  originalRotationsLegs = [
    bonesArray[10].quaternion.clone(),
    bonesArray[20].quaternion.clone(),
    bonesArray[11].quaternion.clone(),
    bonesArray[21].quaternion.clone()
  ];
  
  let time = 0;
  const duration = 1; // Animation duration in seconds
  const axis = new THREE.Vector3().subVectors(bonesArray[10].position, bonesArray[20].position).normalize();
  const speed = 1; // Rotation speed in radians per second

  function updateBones() {
    time += deltaTime;

    const progress = Math.min(time / duration, 1); // Clamp progress to 1 after the duration is reached

    // Update bone rotations based on progress
    bonesArray[10].rotateOnWorldAxis(axis,  2 * speed * deltaTime);
    bonesArray[20].rotateOnWorldAxis(axis, - 2 * speed * deltaTime);
    bonesArray[11].rotateOnWorldAxis(axis, -speed * deltaTime);
    bonesArray[21].rotateOnWorldAxis(axis, speed * deltaTime);

    if (progress < 1) {
      // If the animation is not complete, request the next frame
      requestAnimationFrame(updateBones);
    }else{
      if(isSwimming){
        retractLegs()
        loopLegsForSwim()
      }else{
        retractLegs();
      }
    }
  }
  requestAnimationFrame(updateBones);
  legsExtended = true;
}

// ***************
// Testing Shaders
// ***************

// Define the frog skin vertex shader
const frogSkinVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Define the frog skin fragment shader
const frogSkinFragmentShader = `
  uniform float time;
  uniform float speed;
  uniform float frequency;
  uniform float amplitude;

  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vec3 color = vec3(0.0);

    float displacement = amplitude * sin(frequency * vPosition.y + time * speed);
    float alpha = mix(0.8, 1.0, smoothstep(-0.2, 0.2, displacement));

    color.r = mix(0.6, 0.3, smoothstep(-0.3, 0.3, displacement));
    color.g = mix(0.9, 0.7, smoothstep(-0.2, 0.4, displacement));
    color.b = mix(0.5, 0.2, smoothstep(-0.1, 0.5, displacement));

    gl_FragColor = vec4(color, alpha);
  }
`;

// Create the frog skin material
// const frogSkinMaterial = new THREE.ShaderMaterial({
//   vertexShader: frogSkinVertexShader,
//   fragmentShader: frogSkinFragmentShader,
//   uniforms: {
//     time: { value: 0.0 },
//     speed: { value: 2.0 },
//     frequency: { value: 2.0 },
//     amplitude: { value: 0.2 },
//   },
// });

// Create the frog mesh
// const frogGeometry = new THREE.BoxGeometry(1, 1, 1);
// const frogMesh = new THREE.Mesh(frogGeometry, frogSkinMaterial);

// Add the frog mesh to the scene
// scene.add(frogMesh);

// Animate the frog skin shader
// function animate2() {
//   requestAnimationFrame(animate);
//   frogSkinMaterial.uniforms.time.value += 0.1;
// }
