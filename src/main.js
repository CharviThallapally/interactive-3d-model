// Import Three.js, OrbitControls, and GLTFLoader
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let dog; // Define dog variable at the top
let isJumping = false;
let jumpStartTime = 0;

// 1. Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcceeff); // Soft sky blue

// 2. Create a camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2, 2, 5);

// 3. Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 4. Add Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// 5. Add Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x9DC183 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

// 6. Load Dog Model
const loader = new GLTFLoader();
loader.load(
  '/dog.glb', // make sure you have the model in "public" folder
  (gltf) => {
    dog = gltf.scene;  // Use the globally declared dog variable
    dog.scale.set(0.5, 0.5, 0.5); // Scale the dog
    dog.position.set(0, 0, 0); // Center it on ground
    dog.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(dog);
  },
  undefined,
  (error) => {
    console.error('An error happened while loading the dog model:', error);
  }
);

// 7. OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;

// 8. Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 9. Listen for spacebar to make dog jump
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !isJumping) {
    isJumping = true;
    jumpStartTime = Date.now(); // Store jump start time
  }
});

// 10. Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (dog) {
    if (isJumping) {
      const jumpProgress = (Date.now() - jumpStartTime) / 500; // 0.5s jump duration
      if (jumpProgress < 1) {
        dog.position.y = Math.sin(jumpProgress * Math.PI) * 1.5 + 0.5;
        dog.rotation.y = jumpProgress * Math.PI * 2; // Full spin (360°) during jump
      } else {
        isJumping = false;
        dog.position.y = 0.5;
        dog.rotation.y = 0; // Reset rotation after landing
      }
    }
  }

  renderer.render(scene, camera);
}

animate();
