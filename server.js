const express = require("express");
const app = express();
app.use(express.static("static"));
app.listen("3000");


// // Load your frog model and set it up for animation
// const loader = new THREE.GLTFLoader();
// let frog;

// loader.load('path/to/frog/model.gltf', function (gltf) {
//   frog = gltf.scene;
//   scene.add(frog);

//   // Set up the frog's animation mixer
//   const mixer = new THREE.AnimationMixer(frog);
//   const jumpAction = mixer.clipAction(gltf.animations[0]);

//   // Define the jump animation's duration and jump height
//   const jumpDuration = 0.5; // in seconds
//   const jumpHeight = 5; // in units

//   // Set up additional animation tracks for the hands and legs
//   const rightArmTrack = jumpAction.getClip().tracks.find(track => track.name.includes("RightArm"));
//   const leftArmTrack = jumpAction.getClip().tracks.find(track => track.name.includes("LeftArm"));
//   const rightLegTrack = jumpAction.getClip().tracks.find(track => track.name.includes("RightLeg"));
//   const leftLegTrack = jumpAction.getClip().tracks.find(track => track.name.includes("LeftLeg"));

//   // Set up the animation loop
//   let clock = new THREE.Clock();
//   let jumping = false;

//   function animate() {
//     requestAnimationFrame(animate);

//     // Update the animation mixer and the frog's position
//     const delta = clock.getDelta();
//     mixer.update(delta);

//     if (jumping) {
//       // If the frog is jumping, move it upward along the Y axis
//       frog.position.y += jumpHeight * delta / jumpDuration;

//       // If the frog has reached the peak of its jump, start falling
//       if (frog.position.y >= jumpHeight) {
//         jumping = false;
//         jumpAction.stop();
//         jumpAction.reset();
//         frog.position.y = 0;
//       }
//     }
//   }

//   animate();

//   // Set up a key press listener to trigger the jump animation
//   document.addEventListener('keydown', function (event) {
//     if (event.code === 'Space') {
//       jumping = true;
//       jumpAction.play();
      
//       // Set the start and end values for the animation tracks of the hands and legs
//       const startTime = jumpAction.time;
//       const endTime = startTime + jumpDuration;
//       const startArmAngle = 0;
//       const endArmAngle = Math.PI / 2;
//       const startLegAngle = 0;
//       const endLegAngle = -Math.PI / 4;

//       // Create the animation keyframes for the hands and legs
//       const rightArmKF = new THREE.VectorKeyframeTrack(
//         rightArmTrack.name,
//         [startTime, endTime],
//         [startArmAngle, endArmAngle]
//       );
//       const leftArmKF = new THREE.VectorKeyframeTrack(
//         leftArmTrack.name,
//         [startTime, endTime],
//         [endArmAngle, startArmAngle]
//       );
//       const rightLegKF = new THREE.VectorKeyframeTrack(
//         rightLegTrack.name,
//         [startTime, endTime],
//         [startLegAngle, endLegAngle]
//       );
//       const leftLegKF = new THREE.VectorKeyframeTrack(
//         leftLegTrack.name,
//         [startTime, endTime],
//         [endLegAngle, startLegAngle]
//       );

//       // Create the animation clip for the hands and legs
//       const armLegClip = new THREE.AnimationClip("ArmLegClip", jumpDuration, [
//         rightArmKF,
//         leftArmKF,
//         rightLegKF,
//         leftLegKF
//         ]);
        
//           // Add the animation clip to the mixer
//           mixer.clipAction(armLegClip).play();
//         }
//     });
// });
