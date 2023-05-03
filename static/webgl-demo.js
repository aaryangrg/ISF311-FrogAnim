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
camera.position.set(0, 0.5, 5);
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

//Animation related

//Loading Model
loader.load(
  "frog.glb",
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
const jumpDuration = 0.5
const jumpHeight = 1
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
      animateExtendArms();
    } else if (event.key === 'j') {
      // Calculate the forward direction of the frog based on its rotation
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(frogModel.quaternion);

      // Animate the jump by moving the frog along the jump path using the lerp function
      const startPosition = frogModel.position.clone();
      const endPosition = startPosition.clone().add(forward);

      const initialLeftLegRotation = bonesArray[10].rotation.clone()
      const initialRightLegRotation = bonesArray[20].rotation.clone()
      const initialLeftArmRotation = bonesArray[30].rotation.clone()
      const initialRightArmRotation = bonesArray[39].rotation.clone()

      let time = 0;
      const animateJump = () => {
          time += 0.01;
          if (time > jumpDuration) time = jumpDuration;
          const position = new THREE.Vector3().lerpVectors(startPosition, endPosition, time / jumpDuration);
          const y = jumpHeight * Math.sin(Math.PI * time / jumpDuration);
          position.setY(position.y + y);
          frogModel.position.copy(position);
          const oppositeDirection = forward.clone().multiplyScalar(-1);
          // const armRotationAmount = Math.PI / 2 * Math.sin(Math.PI * time / jumpDuration);
          const legAngle = Math.PI / 4 * Math.sin(Math.PI * time / jumpDuration);
          // let LeftLegrotationQuaternion = new THREE.Quaternion().setFromEuler(bonesArray[10].rotation);
          // LeftLegrotationQuaternion.setFromAxisAngle(rotationAxis, legAngle);
          // let RightLegrotationQuaternion = new THREE.Quaternion().setFromEuler(bonesArray[20].rotation);
          // RightLegrotationQuaternion.setFromAxisAngle(rotationAxis, legAngle);
          // let LeftArmrotationQuaternion = new THREE.Quaternion().setFromEuler(bonesArray[31].rotation);
          // LeftArmrotationQuaternion.setFromAxisAngle(rotationAxis, legAngle);
          // let RightArmrotationQuaternion = new THREE.Quaternion().setFromEuler(bonesArray[40].rotation);
          // RightArmrotationQuaternion.setFromAxisAngle(rotationAxis, legAngle);
          // bonesArray[10].rotation.setFromQuaternion(LeftLegrotationQuaternion);
          // bonesArray[20].rotation.setFromQuaternion(RightLegrotationQuaternion);
          // bonesArray[31].rotation.setFromQuaternion(LeftArmrotationQuaternion);
          // bonesArray[40].rotation.setFromQuaternion(RightArmrotationQuaternion);
          
          const rotationAxisLeftArm = new THREE.Vector3().crossVectors(oppositeDirection, new THREE.Vector3(1,0,0)).normalize();
          const rotationAxisRightArm = new THREE.Vector3().crossVectors(oppositeDirection, new THREE.Vector3(1,0,1)).normalize();
          const rotationAxisLeftLeg = new THREE.Vector3().crossVectors(oppositeDirection, new THREE.Vector3(1,0,1)).normalize();
          const rotationAxisRightLeg = new THREE.Vector3().crossVectors(oppositeDirection, new THREE.Vector3(1,0,1)).normalize();
          rotateBone(bonesArray[10], oppositeDirection, 2*legAngle, initialLeftLegRotation, rotationAxisLeftLeg)
          rotateBone(bonesArray[20], oppositeDirection, 2*legAngle, initialRightLegRotation, rotationAxisRightLeg)
          rotateBone(bonesArray[30], oppositeDirection, legAngle, initialLeftArmRotation, rotationAxisLeftArm)
          rotateBone(bonesArray[39], oppositeDirection, legAngle, initialRightArmRotation, rotationAxisRightArm)
          if (time < jumpDuration) {
            requestAnimationFrame(animateJump);
          }else{
            bonesArray[10].rotation.copy(initialLeftLegRotation);
            bonesArray[20].rotation.copy(initialRightLegRotation);
            bonesArray[30].rotation.copy(initialLeftArmRotation);
            bonesArray[39].rotation.copy(initialRightArmRotation);
          }
      };
       animateJump();
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

function rotateBone(bone, oppositeDirection, angle, startAngle, rotationAxis){
  let rotationQuaternion = new THREE.Quaternion().setFromEuler(bone.rotation);
  const rotationOffset = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
  bone.rotation.copy(startAngle);
  bone.rotation.setFromQuaternion(rotationOffset);
}

function rotateBoneAtIndex(i) {
  console.log(i);
  bonesArray[i].rotateX(90);
}


function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();


function animateExtendArms() {
  // Calculate the forward direction of the frog based on its rotation
  const forward = new THREE.Vector3(0, 0, 1);
  forward.applyQuaternion(frogModel.quaternion);

  // Extend the arms by rotating the arm bones around the axis perpendicular to the forward direction and the up direction of the arm
  const extendDuration = 0.2;
  const extendAngle = Math.PI / 6;
  const arms = [bonesArray[30], bonesArray[39]];
  const armAxes = [new THREE.Vector3(), new THREE.Vector3()];
  for (let i = 0; i < 2; i++) {
    const arm = arms[i];
    const up = new THREE.Vector3(0, 1, 0);
    up.applyQuaternion(arm.quaternion);
    const axis = new THREE.Vector3().crossVectors(forward, up).normalize();
    armAxes[i].copy(axis);
    const startQuaternion = arm.quaternion.clone();
    const endQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, extendAngle).multiply(startQuaternion);
    let time = 0;
    const extendArm = () => {
      time += 0.01;
      if (time > extendDuration) time = extendDuration;
      const t = time / extendDuration;
      arm.quaternion.copy(startQuaternion).slerp(endQuaternion, t);
      if (time < extendDuration) {
        requestAnimationFrame(extendArm);
      } else {
        retractArm(arm, armAxes[i], startQuaternion);
      }
    };
    extendArm();
  }
}

function retractArm(arm, axis, startQuaternion) {
  const retractDuration = 0.2;
  const endQuaternion = startQuaternion.clone();
  let time = 0;
  const retractArm = () => {
    time += 0.01;
    if (time > retractDuration) time = retractDuration;
    const t = time / retractDuration;
    arm.quaternion.copy(startQuaternion).slerp(endQuaternion, t);
    if (time < retractDuration) {
      requestAnimationFrame(retractArm);
    }
  };
  retractArm();
}

// ***************
// Testing Shaders
// ***************

// Define the frog skin vertex shader
// const frogSkinVertexShader = `
//   varying vec2 vUv;
//   varying vec3 vPosition;

//   void main() {
//     vUv = uv;
//     vPosition = position;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//   }
// `;

// Define the frog skin fragment shader
// const frogSkinFragmentShader = `
//   uniform float time;
//   uniform float speed;
//   uniform float frequency;
//   uniform float amplitude;

//   varying vec2 vUv;
//   varying vec3 vPosition;

//   void main() {
//     vec3 color = vec3(0.0);

//     float displacement = amplitude * sin(frequency * vPosition.y + time * speed);
//     float alpha = mix(0.8, 1.0, smoothstep(-0.2, 0.2, displacement));

//     color.r = mix(0.6, 0.3, smoothstep(-0.3, 0.3, displacement));
//     color.g = mix(0.9, 0.7, smoothstep(-0.2, 0.4, displacement));
//     color.b = mix(0.5, 0.2, smoothstep(-0.1, 0.5, displacement));

//     gl_FragColor = vec4(color, alpha);
//   }
// `;

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

