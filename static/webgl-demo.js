import * as THREE from 'three';
import {GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//3JS BOILER PLATE
const DEFAULT_TRANSLATE = 0.2;
const ROTATION_RADS = 0.0175;
const canvas = document.querySelector("#glcanvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const loader = new GLTFLoader();
camera.position.set(0,1,2);
scene.add(camera)
const renderer = new THREE.WebGLRenderer({canvas : canvas});
renderer.setSize( window.innerWidth * (90/100), window.innerHeight  * (90/100));
let frogModel = null;
//Loading Model
loader.load(
	// resource URL
	'frog.glb',
	// called when the resource is loaded
	function ( gltf ) {

		scene.add( gltf.scene );

		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object
    frogModel = gltf.scene;
    console.log(gltf.scene);
	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(2,2,5);
scene.add(light);

function animate(){
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
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
document.onkeydown = handleKeyPress

function handleKeyPress(event) {
    console.log(event);
    event = event || window.event;
    keysPressed[event.key] = true;
    if(frogModel){
      if (event.key === 'ArrowUp') {
        if(keysPressed["Shift"]){
          frogModel.rotateX(-2*ROTATION_RADS);
        }else{
          frogModel.translateZ(DEFAULT_TRANSLATE);
        }
    }
    else if (event.key == 'ArrowDown') {
        if(keysPressed["Shift"]){
          frogModel.rotateX(2*ROTATION_RADS);
        }else{
          frogModel.translateZ(-DEFAULT_TRANSLATE);
        }
    }
    else if (event.key == 'ArrowLeft') {
       if(keysPressed["Shift"]){
          frogModel.rotateZ(2*ROTATION_RADS);
       }else{
        frogModel.translateX(-DEFAULT_TRANSLATE);
       }
    }
    else if (event.key == 'ArrowRight') {
       if(keysPressed["Shift"]){
        frogModel.rotateZ(-2*ROTATION_RADS);
       }else{
        frogModel.translateX(DEFAULT_TRANSLATE);
       }
    }
    }
    
}

document.onkeyup = handleKeyRelease

function handleKeyRelease(event){
  delete keysPressed[event.key];
}

animate()