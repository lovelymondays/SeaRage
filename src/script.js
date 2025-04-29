import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import waterVertexShader from "./shaders/water/vertex.glsl";
import waterFragmentShader from "./shaders/water/fragment.glsl";
import { GLTFLoader, RGBELoader } from "three/examples/jsm/Addons.js";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const rgbeLoader = new RGBELoader();
const gltfLoader = new GLTFLoader();
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

//Env Map
rgbeLoader.load(
  "./map/industrial_sunset_02_puresky_1k.hdr",
  (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = environmentMap;
    // scene.environment = environmentMap;
  }
);

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.BoxGeometry(1, 1, 1, 128, 128, 1);

// //Ship Model
gltfLoader.load(
  "./models/dutch_ship_large_02_1k.gltf/dutch_ship_large_02_1k.gltf",
  (gltf) => {
    const ship = gltf.scene;
    ship.scale.set(0.01, 0.01, 0.01);
    ship.position.set(0, 0, 0);
    ship.name = "Ship";
    scene.add(ship);
  }
);

//Color
debugObject.depthColor = "#114178";
debugObject.surfaceColor = "#2c76af";

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  //   wireframe: true,
  uniforms: {
    uTime: {
      value: 0,
    },
    uBigWavesElevation: {
      value: 0.25,
    },
    uBigWavesFrequency: {
      value: new THREE.Vector2(4, 1.5),
    },
    uBigWavesSpeed: {
      value: 0.75,
    },

    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },

    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5 },

    uSmallWavesElevation: {
      value: 0.15,
    },
    uSmallWavesFrequency: {
      value: 3.0,
    },
    uSmallWavesSpeed: {
      value: 0.2,
    },
    uSmallWavesIterations: {
      value: 4.0,
    },
  },
});

//Debug

const bigWavesTweaks = gui.addFolder("BigWaves");
const smallWavesTweaks = gui.addFolder("SmallWaves");
const colorTweaks = gui.addFolder("Color");

bigWavesTweaks
  .add(waterMaterial.uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uBigWavesElevation");

bigWavesTweaks
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyX");

bigWavesTweaks
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyY");

bigWavesTweaks
  .add(waterMaterial.uniforms.uBigWavesSpeed, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesSpeed");

colorTweaks
  .addColor(debugObject, "depthColor")
  .name("depthColor")
  .onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
  });

colorTweaks
  .addColor(debugObject, "surfaceColor")
  .name("surfaceColor")
  .onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
  });

colorTweaks
  .add(waterMaterial.uniforms.uColorOffset, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uColorOffset");

colorTweaks
  .add(waterMaterial.uniforms.uColorMultiplier, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uColorMultiplier");

smallWavesTweaks
  .add(waterMaterial.uniforms.uSmallWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uSmallWavesElevation");

smallWavesTweaks
  .add(waterMaterial.uniforms.uSmallWavesIterations, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uSmallWavesIterations");

smallWavesTweaks
  .add(waterMaterial.uniforms.uSmallWavesFrequency, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uSmallWavesFrequency");

smallWavesTweaks
  .add(waterMaterial.uniforms.uSmallWavesSpeed, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uSmallWavesSpeed");

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Fog
scene.fog = new THREE.Fog(0xcccccc, 10, 15);

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 1, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//water height
function getWaterData(x, z, time) {
  const freq = waterMaterial.uniforms.uBigWavesFrequency.value;
  const elev = waterMaterial.uniforms.uBigWavesElevation.value;
  const speed = waterMaterial.uniforms.uBigWavesSpeed.value;

  const wave = (x, z) =>
    Math.sin(x * freq.x + time * speed) + Math.sin(z * freq.y + time * speed);

  const height = wave(x, z) * elev;

  const delta = 0.01;
  const heightX =
    ((wave(x + delta, z) - wave(x - delta, z)) * elev) / (2 * delta);
  const heightZ =
    ((wave(x, z + delta) - wave(x, z - delta)) * elev) / (2 * delta);

  return { height, heightX, heightZ };
}

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  const ship = scene.getObjectByName("Ship"); // Replace with your actual reference

  if (ship) {
    const shipX = ship.position.x;
    const shipZ = ship.position.z;
    const { height, heightX, heightZ } = getWaterData(
      shipX,
      shipZ,
      elapsedTime
    );

    ship.position.y = 0.5;

    // Approximate pitch and roll
    const maxTilt = 0.4; // radians (~23°)
    ship.rotation.x = THREE.MathUtils.clamp(-heightZ, -maxTilt, maxTilt); // pitch
    ship.rotation.z = THREE.MathUtils.clamp(heightX, -maxTilt, maxTilt); // roll
  }

  //Water
  waterMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
