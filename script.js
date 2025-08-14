import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

// --- Basic Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas3d'),
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth / 2, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// --- 3D Model ---
let model;
const loader = new GLTFLoader();

const createFallback = () => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshStandardMaterial({
        color: 0x6a5af9,
        metalness: 0.6,
        roughness: 0.4
    });
    model = new THREE.Mesh(geometry, material);
    scene.add(model);
};

loader.load('scene.gltf', (gltf) => {
    if (gltf && gltf.scene) {
        model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        scene.add(model);
    } else {
        console.error('GLTF model loaded, but scene is missing.');
        createFallback();
    }
}, undefined, (error) => {
    console.error(error);
    createFallback();
});

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    if (model) {
        model.rotation.y = elapsedTime * 0.2;
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// --- Handle Window Resize ---
window.addEventListener('resize', () => {
    camera.aspect = (window.innerWidth / 2) / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 2, window.innerHeight);
});

// --- Mouse Move Animation ---
document.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (model) {
        model.rotation.y = x * 0.5;
        model.rotation.x = y * 0.5;
    }
});

// --- Blob Animation ---
const blob = document.getElementById("blob");

window.onpointermove = event => { 
  const { clientX, clientY } = event;
  
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, { duration: 3000, fill: "forwards" });
}

