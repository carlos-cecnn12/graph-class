let renderer = null,
  scene = null,
  camera = null,
  box = null,
  moon = null,
  cone = null,
  sphereGroup = null,
  icosahedron = null,
  tetrahedron = null,
  figureObjects = null;

let indexFigure = 0;
let figuresOnCanvas = 0;

let random = [0, 0, 0];
let positions;

let duration = 5000; // ms
let currentTime = Date.now();

function animate() {
  let now = Date.now();
  let deltat = now - currentTime;
  currentTime = now;
  let fract = deltat / duration;
  let angle = Math.PI * 2 * fract;

  for (let i = 0; i < figureObjects.children.length; i++) {
    figureObjects.children[i].rotation.y += angle;
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
}

function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  // Set the viewport size
  renderer.setSize(canvas.width, canvas.height);

  // Create a new Three.js scene
  scene = new THREE.Scene();

  // Set the background color
  scene.background = new THREE.Color(0.2, 0.2, 0.2);
  // scene.background = new THREE.Color( "rgb(100, 100, 100)" );

  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    1,
    4000
  );
  camera.position.z = 10;
  scene.add(camera);

  // Add a directional light to show off the objects
  let light = new THREE.DirectionalLight(0xffffff, 1.0);
  // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

  // Position the light out from the scene, pointing at the origin
  light.position.set(-0.5, 0.2, 1);
  light.target.position.set(0, -2, 0);
  scene.add(light);

  // This light globally illuminates all objects in the scene equally.
  // Cannot cast shadows
  let ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
  scene.add(ambientLight);

  figureObjects = new THREE.Object3D();

  // add mouse handling so we can rotate the scene
  addMouseHandler(canvas, figureObjects);
}

function addFigure() {
  let textureUrl = "../images/wooden_crate_1.jpg";
  let texture = new THREE.TextureLoader().load(textureUrl);
  let material = new THREE.MeshPhongMaterial({ map: texture });

  random[0] = Math.floor(Math.random() * 65);
  random[1] = Math.floor(Math.random() * 65);
  random[2] = -100;

  switch (figuresOnCanvas) {
    case 0:
      let icosahedronFigure = new THREE.IcosahedronGeometry(10, 0);
      icosahedron = new THREE.Mesh(icosahedronFigure, material);

      icosahedron.rotation.x = Math.PI / 5;
      icosahedron.rotation.y = Math.PI / 5;

      icosahedron.position.set(random[0], random[1], random[2]);
      figureObjects.add(icosahedron);

      figuresOnCanvas++;
      break;
    case 1:
      let tetrahedronFigure = new THREE.TetrahedronGeometry(10, 0);
      tetrahedron = new THREE.Mesh(tetrahedronFigure, material);

      tetrahedron.rotation.x = Math.PI / 5;
      tetrahedron.rotation.y = Math.PI / 5;

      tetrahedron.position.set(random[0], random[1], random[2]);
      figureObjects.add(tetrahedron);

      figuresOnCanvas++;
      break;

    case 2:
      let boxFigure = new THREE.BoxGeometry(10, 10, 10);
      box = new THREE.Mesh(boxFigure, material);

      box.rotation.x = Math.PI / 5;
      box.rotation.y = Math.PI / 5;

      box.position.set(random[0], random[1], random[2]);
      figureObjects.add(box);

      figuresOnCanvas++;
      break;

    case 3:
      let cylinderFigure = new THREE.ConeGeometry(5, 5, 32);
      cylinder = new THREE.Mesh(cylinderFigure, material);

      cylinder.rotation.x = Math.PI / 5;
      cylinder.rotation.y = Math.PI / 5;

      cylinder.position.set(random[0], random[1], random[2]);
      figureObjects.add(cylinder);

      figuresOnCanvas = 0;
      break;
  }
  scene.add(figureObjects);
}

function addSatelite() {
  let textureSateliteUrl = "../images/moon_1024.jpg";
  let textureSatelite = new THREE.TextureLoader().load(textureSateliteUrl);
  let materialSatelite = new THREE.MeshPhongMaterial({ map: textureSatelite });

  if (figureObjects.children.length > 0) {
    if (indexFigure == 0) {
      indexFigure = figureObjects.children.length;
    }

    let moonFigure = new THREE.SphereGeometry(5, 20, 20);
    moon = new THREE.Mesh(moonFigure, materialSatelite);

    moon.rotation.x = Math.PI / 5;
    moon.rotation.y = Math.PI / 5;

    let obj = figureObjects.children[indexFigure - 1];

    moon.position.set(random[0], random[1], 20);
    obj.add(moon);

    if (indexFigure == 0) {
      indexFigure = figureObjects.children.length;
    } else {
      indexFigure--;
    }
  }
}

function restart() {
  for (let i = figureObjects.children.length; 0 <= i; i--) {
    figureObjects.remove(figureObjects.children[i]);
  }
}
