// 1. Enable shadow mapping in the renderer.
// 2. Enable shadows and set shadow parameters for the lights that cast shadows.
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows.
// 3. Indicate which geometry objects cast and receive shadows.

let renderer = null,
  scene = null,
  camera = null,
  root = null,
  group = null,
  group2 = null,
  objectList = [],
  orbitControls = null;

let objLoader = null,
  jsonLoader = null;

let animator = null,
  duration = 10, // sec
  loopAnimation = true;

let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let pointLight = null;
let mapUrl = "../images/checker_large.gif";

let SHADOW_MAP_WIDTH = 2048,
  SHADOW_MAP_HEIGHT = 2048;
let objModelUrl = {
  obj: "./Penguin_obj/penguin.obj",
  map: "./Penguin_obj/peng_texture.jpg"
};

function promisifyLoader(loader, onProgress) {
  function promiseLoader(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, onProgress, reject);
    });
  }

  return {
    originalLoader: loader,
    load: promiseLoader
  };
}

const onError = err => {
  console.error(err);
};

async function loadObj(objModelUrl, objectList) {
  const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

  try {
    const object = await objPromiseLoader.load(objModelUrl.obj);

    let texture = objModelUrl.hasOwnProperty("map")
      ? new THREE.TextureLoader().load(objModelUrl.map)
      : null;

    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.map = texture;
      }
    });

    object.scale.set(0.2, 0.2, 0.2);
    object.position.z = -6;
    object.position.x = 0;
    object.position.y = -3.5;
    object.rotation.y = 0;
    object.name = "objObject";
    objectList.push(object);
    group2.add(object);
  } catch (err) {
    return onError(err);
  }
}

function run() {
  requestAnimationFrame(function() {
    run();
  });

  // Render the scene
  renderer.render(scene, camera);

  // Spin the cube for next frame
  //animate();
  KF.update();

  // Update the camera controller
  orbitControls.update();
}

function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  // Set the viewport size
  renderer.setSize(canvas.width, canvas.height);

  // Turn on shadows
  renderer.shadowMap.enabled = true;
  // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
  renderer.shadowMap.type = THREE.BasicShadowMap;

  // Create a new Three.js scene
  scene = new THREE.Scene();

  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    1,
    4000
  );
  camera.position.set(-2, 6, 12);
  scene.add(camera);

  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

  // Create a group to hold all the objects
  root = new THREE.Object3D();

  // Create and add all the lights
  spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 8, 30);
  spotLight.target.position.set(0, 0, 0);
  root.add(spotLight);

  spotLight.castShadow = true;

  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 200;
  spotLight.shadow.camera.fov = 45;

  spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
  spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

  ambientLight = new THREE.AmbientLight(0x00000, 0.8);
  root.add(ambientLight);

  // Create the objects
  loadObj(objModelUrl, objectList);

  // Create a group to hold the objects
  group = new THREE.Object3D();
  root.add(group);
  group2 = new THREE.Object3D();
  root.add(group2);

  // Create a texture map
  let map = new THREE.TextureLoader().load(mapUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  let color = 0xffffff;

  // let asteroid = new THREE.Object3D();
  // Put in a ground plane to show off the lighting
  let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
  let mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      color: color,
      map: map,
      side: THREE.DoubleSide
    })
  );

  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -4.02;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Create the sphere

  scene.add(root);
}

function initAnimations() {
  animator = new KF.KeyFrameAnimator();
  animator.init({
    interps: [
      {
        keys: [0.0, 0.16666666666666666, 0.3333333333333333, 0.5, 0.6666666666666666, 0.8333333333333334, 1.0],
        values: [
          //*3
          { z: -5, x: 5 },
          { z: 0, x: 10 },
          { z: 5, x: 5 },
          { z: -5, x: -5},
          { z: 0, x: -10 },
          { z: 5, x: -5 },
          {z: -5, x: 5 }
        ],
        target: group2.position
      },
      {
        keys: [0.0, 0.16666666666666666, 0.3333333333333333, 0.5, 0.6666666666666666, 0.8333333333333334, 1.0],
        values: [
          //*3
          {y:1},
          {y:-1},
          {y:-2},
          {y:-1},
          {y:1},
          {y:2},
          {y:1}

        ],
        target: group2.rotation
      },
      
      { 
          keys:[0,.05,.1,.15,.2,.25,.3,.35,.4,.45,.5,.55,.6,.66,.7,.75,.8,.85,.9,.95, 1], 
          values:[
                  {  z:0},
                  { z:.25},
                  {  z:0},
                  {  z:-.25},
                  {  z:0},
                  {  z:.25},
                  {  z:0},
                  {  z:-.25},
                  {  z:0},
                  {  z:.25},
                  {  z:0},
                  {z:-.25},
                  {  z:0},
                  {  z:.25},
                  {  z:0},
                  {  z:-.25},
                  {  z:0},
                  {  z:.25},
                  {  z:0},
                  {  z:-.25},
                  {  z:0},
                  ],
          target:group2.rotation
      }
    ],
    loop: loopAnimation,
    duration: duration * 1000
  });
}

function playAnimations() {
  animator.start();
}
