let renderer = null,
  scene = null,
  camera = null,
  root = null,
  robot = null,
  orbitControls = null;

let blocker, instructions;
let robot_actions = {};
let deadAnimator;

let enemies = [];
let base_enemy = null;

let animator = null,
  durationAnim = 2, // sec
  loopAnimation = false;

let duration = 20000; // ms
let currentTime = Date.now();

let animation = "idle";

function changeAnimation(animation_text) {
  var prev = robot_actions;
  console.log(robot);
  animation = animation_text;

  console.log(prev);

  if (animation == "dead") {
    robot_actions[prev].stop();
    createDeadAnimation();
  } else {
    robot.scale.set(0.09, 0.09, 0.09);
    robot.rotation.x = -1.57;
    robot_actions[animation].reset();
  }
}

function createDeadAnimation(enemy) {
  animator = new KF.KeyFrameAnimator();

  animator.init({
    interps: [
      {
        keys: [0.0, 0.5, 1.0],
        values: [
          //*3
          { x: 0.09, y: 0.09, z: 0.09 },
          { x: 0.045, y: 0.045, z: 0.045 },
          { x: 0.00000001, y: 0.000001, z: 0.000001 }
        ],
        target: enemy.scale
      },
      {
        keys: [0.0, 0.5, 1.0],
        values: [
          //*3
          { x: -1.57 },
          { x: -0.75 },
          { x: 0 }
        ],
        target: enemy.rotation
      }
    ],
    loop: loopAnimation,
    duration: durationAnim * 1000
  });
  animator.start();
  console.log(robot_actions);
}

function initPointerLock() {
  blocker = document.getElementById("blocker");
  instructions = document.getElementById("instructions");
  container = document.getElementById("container");
  restart=document.getElementById("restart")

  controls = new THREE.PointerLockControls(camera, document.body);

  controls.addEventListener("lock", function() {
    instructions.style.display = "none";
    blocker.style.display = "none";
    run()
  });

  controls.addEventListener("unlock", function() {
    blocker.style.display = "hidden";
    instructions.style.display = "";
    container.style.display = "hidden";
  });

  instructions.addEventListener(
    "click",
    function() {
      controls.lock();
    },
    false
  );

  

  scene.add(controls.getObject());
}



function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

async function loadGLTF() {
  let gltfLoader = new THREE.GLTFLoader();
  let loader = promisifyLoader(gltfLoader);

  try {
    // Run_L, Threaten, back, idle
    let result = await loader.load("../models/gltf/raptoid/scene.gltf");

    robot = result.scene.children[0];
    robot.scale.set(0.09, 0.09, 0.09);
    robot.position.x = Math.random() * 25;
    robot.position.y -= 3.8;
    robot.position.z = -200;
    robot.rotation.z = 5;
    robot.mixer = new THREE.AnimationMixer(scene);
    robot.mixer
      .clipAction(result.animations[0], robot)
      .setDuration(2.0)
      .play();
    console.log(robot.rotation.x);
    robot.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    robot.state = "running";

    scene.add(robot);
    enemies.push(robot);

    result.animations.forEach(element => {
      robot_actions[element.name] = new THREE.AnimationMixer(scene).clipAction(
        element,
        robot
      );
      robot_actions[element.name].play();
    });
  } catch (err) {
    console.error(err);
  }
}

async function sleep(target, time) {
  setTimeout(() => {
    target.state = "dead";
  }, time);
}

async function animate() {
  if (controls.isLocked == true) {

    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    document.getElementById("timer").value=deltat
    for (let morph of enemies) {
      if (morph.state === "running") morph.position.z += 0.03 * deltat;

      if (morph.state === "running" && morph.position.z >=-40) {
        //morph.mixer.stopAllAction();
        morph.state = "dying";
        await sleep(morph, 500);
      }

      if (morph.state === "dead") {
        morph.position.z=-200
        morph.state="running"
        
      }

      if (morph.mixer) morph.mixer.update(deltat * 0.001);
    }
  }
}

function run() {
  requestAnimationFrame(function() {
    run();
  });

  // Render the scene
  renderer.render(scene, camera);

  // Spin the cube for next frame
  animate();

  // Update the camera controller
  orbitControls.update();
}

let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let mapUrl = "../images/checker_large.gif";

let SHADOW_MAP_WIDTH = 2048,
  SHADOW_MAP_HEIGHT = 2048;

async function getEnemies(){
  while(enemies.length<8)
  {
    await loadGLTF()
  }
}

async function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  // Set the viewport size
  renderer.setPixelRatio(window.devicePixelRatio);

  window.addEventListener("resize", onWindowResize, false);
  // Turn on shadows
  renderer.shadowMap.enabled = true;
  // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create a new Three.js scene
  scene = new THREE.Scene();

  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    1,
    4000
  );
  camera.position.set(0, 0, 0);
  scene.add(camera);

  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

  // Create a group to hold all the objects
  root = new THREE.Object3D();

  spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-20, 100, -75);
  spotLight.target.position.set(0, 0, -75);
  root.add(spotLight);

  spotLight.castShadow = true;

  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 200;
  spotLight.shadow.camera.fov = 45;

  spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
  spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

  ambientLight = new THREE.AmbientLight(0xbbbbbb);
  root.add(ambientLight);

  // Create the objects
    loadGLTF()

  // Create a group to hold the objects
  group = new THREE.Object3D();
  root.add(group);

  // Create a texture map
  let map = new THREE.TextureLoader().load(mapUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  let color = 0xffffff;

  // Put in a ground plane to show off the lighting
  geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
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

  // Add the mesh to our group
  group.add(mesh);
  mesh.castShadow = false;
  mesh.receiveShadow = true;

  // Now add the group to our scene
  scene.add(root);
  initPointerLock();
}
