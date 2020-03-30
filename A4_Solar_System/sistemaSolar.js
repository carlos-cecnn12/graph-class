var pointLight,
  sun,
  moon,
  earth,
  earthOrbit,
  ring,
  controls,
  scene,
  camera,
  renderer,
  scene;

var mercuryData = setData(
  10,
  0.05,
  15,
  0.7,
  "img/mercurymap.jpg",
  "img/mercurybump.jpg"
);

var venusData = setData(
  20,
  0.04,
  20,
  1,
  "img/venusmap.jpg",
  "img/venusbump.jpg"
);

var earthData = setData(
  30,
  0.015,
  25,
  1,
  "img/earthmap.jpg",
  "img/earth_normal.jpg",
  "img/earth_specular.jpg"
);
var moonData = setData(2.5, 0.01, 2.8, "img/moon.jpg", "img/moon_bump.jpg");

var marsData = setData(40, 0.01, 30, 1, "img/marsmap.jpg", "img/marsbump.jpg");

var meteorData = setData(45, 0.01, 35, 0.6, "img/meteormap.jpg");

var jupiterData = setData(50, 0.05, 40, 2, "img/jupitermap.jpg");

var saturnData = setData(55, 0.01, 45, 1.5, "img/saturnmap.jpg");

var uranusData = setData(60, 0.01, 50, 1, "img/uranusmap.jpg");

var neptuneData = setData(65, 0.01, 55, 1, "img/neptunemap.jpg");

var plutoData = setData(
  70,
  0.01,
  60,
  0.8,
  "img/plutomap.jpg",
  "img/plutobump.jpg"
);

var clock = new THREE.Clock();

function setData(
  myOrbitRate,
  myRotationRate,
  myDistanceFromAxis,
  mySize,
  map,
  bumpMap,
  specularMap
) {
  return {
    orbitRate: myOrbitRate,
    rotationRate: myRotationRate,
    distanceFromAxis: myDistanceFromAxis,
    size: mySize,
    map: map,
    bump_map: bumpMap,
    specular_map: specularMap
  };
}

function createOrbit(size, innerDiameter) {
  var orbitGeometry = new THREE.RingGeometry(size, innerDiameter, 320);
  var orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  var orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbit.position.set(0, 0, 0);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);
  return orbit;
}

function createPlanetRing(map, distanceFromAxis) {
  var planetRingGeometry = new THREE.TorusGeometry(1.8, 0.1, 100, 100);
  var tmpMap = new THREE.TextureLoader().load(map);
  var planetRingMaterial = new THREE.MeshPhongMaterial({ map: tmpMap });
  planetRing = new THREE.Mesh(planetRingGeometry, planetRingMaterial);
  planetRing.position.set(distanceFromAxis, 0, 0);
  planetRing.rotation.x = Math.PI / 2;
  scene.add(planetRing);
  return planetRing;
}

function createOrbits() {
  var orbitWidth = 0.05;
  mercuryOrbit = createOrbit(
    mercuryData.distanceFromAxis + orbitWidth,
    mercuryData.distanceFromAxis - orbitWidth
  );
  venusOrbit = createOrbit(
    venusData.distanceFromAxis + orbitWidth,
    venusData.distanceFromAxis - orbitWidth
  );

  earthOrbit = createOrbit(
    earthData.distanceFromAxis + orbitWidth,
    earthData.distanceFromAxis - orbitWidth
  );

  marsOrbit = createOrbit(
    marsData.distanceFromAxis + orbitWidth,
    marsData.distanceFromAxis - orbitWidth
  );

  jupiterOrbit = createOrbit(
    jupiterData.distanceFromAxis + orbitWidth,
    jupiterData.distanceFromAxis - orbitWidth
  );

  saturnOrbit = createOrbit(
    saturnData.distanceFromAxis + orbitWidth,
    saturnData.distanceFromAxis - orbitWidth
  );

  uranusOrbit = createOrbit(
    uranusData.distanceFromAxis + orbitWidth,
    uranusData.distanceFromAxis - orbitWidth
  );

  neptuneOrbit = createOrbit(
    neptuneData.distanceFromAxis + orbitWidth,
    neptuneData.distanceFromAxis - orbitWidth
  );

  plutoOrbit = createOrbit(
    plutoData.distanceFromAxis + orbitWidth,
    plutoData.distanceFromAxis - orbitWidth
  );
}

function createPlanet(planetData, x, y, z) {
  var planetMaterial, tmpMap, tmpBumpMap, tmpSpecularMap;

  if (
    planetData.map &&
    planetData.map !== "" &&
    (planetData.bumpMap && planetData.bumpMap !== "")
  ) {
    tmpMap = new THREE.TextureLoader().load(planetData.map);
    tmpBumpMap = new THREE.TextureLoader().load(planetData.bumpMap);
    planetMaterial = new THREE.MeshPhongMaterial({
      map: tmpMap,
      bumpMap: tmpBumpMap,
      bumpScale: 0.06
    });
  } else if (
    planetData.map &&
    planetData.map !== "" &&
    (planetData.bumpMap && planetData.bumpMap !== "") &&
    (planetData.specularMap && planetData.specularMap !== "")
  ) {
    tmpMap = new THREE.TextureLoader().load(planetData.map);
    tmpBumpMap = new THREE.TextureLoader().load(planetData.bumpMap);
    tmpSpecularMap = new THREE.TextureLoader().load(planetData.specularMap);
    planetMaterial = new THREE.MeshPhongMaterial({
      map: tmpMap,
      bumpMap: tmpBumpMap,
      specularMap: tmpSpecularMap
    });
  } else {
    tmpMap = new THREE.TextureLoader().load(planetData.map);
    planetMaterial = new THREE.MeshPhongMaterial({ map: tmpMap });
  }

  var geometry = new THREE.SphereGeometry(planetData.size, 48, 48);
  var planet = new THREE.Mesh(geometry, planetMaterial);
  scene.add(planet);
  planet.position.set(x, y, z);

  return planet;
}

function createMoon(planetData, x, y, z, size) {
  var myMaterial, tmpMap;
  tmpMap = new THREE.TextureLoader().load(planetData.map);
  myMaterial = new THREE.MeshPhongMaterial({ map: tmpMap });
  var geometry = new THREE.SphereGeometry(size, 48, 48);
  var moon = new THREE.Mesh(geometry, myMaterial);
  scene.add(moon);
  moon.position.set(x, y, z);

  return moon;
}

function movePlanet(planet, planetData, delta) {
  planet.rotation.y += planetData.rotationRate;

  planet.position.x =
    Math.cos(delta * (1.0 / (planetData.orbitRate * 200)) + 10.0) *
    planetData.distanceFromAxis;
  planet.position.z =
    Math.sin(delta * (1.0 / (planetData.orbitRate * 200)) + 10.0) *
    planetData.distanceFromAxis;
}

function moveRing(ring, ringData, delta) {
  ring.position.x =
    Math.cos(delta * (1.0 / (ringData.orbitRate * 200)) + 10.0) *
    ringData.distanceFromAxis;
  ring.position.z =
    Math.sin(delta * (1.0 / (ringData.orbitRate * 200)) + 10.0) *
    ringData.distanceFromAxis;
}

function moveMoon(moon, planet, planetData, delta) {
  movePlanet(moon, planetData, delta);

  moon.position.x = moon.position.x + planet.position.x;
  moon.position.z = moon.position.z + planet.position.z;
}

function update(renderer, scene, camera, controls) {
  light.position.copy(mesh.position);
  controls.update();

  var time = Date.now();
  var delta = 5 * clock.getDelta();

  uniforms["time"].value += 0.2 * delta;

  movePlanet(mercury, mercuryData, time);
  movePlanet(venus, venusData, time);
  movePlanet(earth, earthData, time);
  moveMoon(moonEarth, earth, moonData, time);
  movePlanet(mars, marsData, time);
  movePlanet(jupiter, jupiterData, time);
  movePlanet(saturn, saturnData, time);
  moveRing(saturnRing, saturnData, time);
  movePlanet(uranus, uranusData, time);
  moveRing(uranusRing, uranusData, time);
  movePlanet(neptune, neptuneData, time);
  movePlanet(pluto,plutoData,time)
  moveMoon(moonMars1, mars, moonData, time);
  moveMoon(moonMars2, mars, moonData, time);
  moveMoon(moonJupiter1, jupiter, moonData, time);
  moveMoon(moonJupiter2, jupiter, moonData, time);
  moveMoon(moonJupiter3, jupiter, moonData, time);
  moveMoon(moonJupiter4, jupiter, moonData, time);
  moveMoon(moonJupiter5, jupiter, moonData, time);
  moveMoon(moonJupiter6, jupiter, moonData, time);
  moveMoon(moonJupiter7, jupiter, moonData, time);
  moveMoon(moonJupiter8, jupiter, moonData, time);
  moveMoon(moonJupiter9, jupiter, moonData, time);
  moveMoon(moonJupiter10, jupiter, moonData, time);
  moveMoon(moonSaturn1, saturn, moonData, time);
  moveMoon(moonSaturn2, saturn, moonData, time);
  moveMoon(moonSaturn3, saturn, moonData, time);
  moveMoon(moonSaturn4, saturn, moonData, time);
  moveMoon(moonSaturn5, saturn, moonData, time);
  moveMoon(moonSaturn6, saturn, moonData, time);
  moveMoon(moonSaturn7, saturn, moonData, time);
  moveMoon(moonSaturn8, saturn, moonData, time);
  moveMoon(moonSaturn9, saturn, moonData, time);
  moveMoon(moonSaturn10, saturn, moonData, time);
  moveMoon(moonUranus1, uranus, moonData, time);
  moveMoon(moonUranus2, uranus, moonData, time);
  moveMoon(moonUranus3, uranus, moonData, time);
  moveMoon(moonUranus4, uranus, moonData, time);
  moveMoon(moonUranus5, uranus, moonData, time);
  moveMoon(moonUranus6, uranus, moonData, time);
  moveMoon(moonUranus7, uranus, moonData, time);
  moveMoon(moonUranus8, uranus, moonData, time);
  moveMoon(moonUranus9, uranus, moonData, time);
  moveMoon(moonUranus10, uranus, moonData, time);
  moveMoon(moonNeptune1, neptune, moonData, time);
  moveMoon(moonNeptune2, neptune, moonData, time);
  moveMoon(moonNeptune3, neptune, moonData, time);
  moveMoon(moonNeptune4, neptune, moonData, time);
  moveMoon(moonNeptune5, neptune, moonData, time);
  moveMoon(moonNeptune6, neptune, moonData, time);
  moveMoon(moonNeptune7, neptune, moonData, time);
  moveMoon(moonNeptune8, neptune, moonData, time);
  moveMoon(moonNeptune9, neptune, moonData, time);
  moveMoon(moonNeptune10, neptune, moonData, time);
  moveMoon(moonPluto1, pluto, moonData, time);
  moveMoon(moonPluto2, pluto, moonData, time);
  moveMoon(moonPluto3, pluto, moonData, time);
  moveMoon(moonPluto4, pluto, moonData, time);
  moveMoon(moonPluto5, pluto, moonData, time);
  

  renderer.render(scene, camera);
  requestAnimationFrame(function() {
    update(renderer, scene, camera, controls);
  });
}

function init() {
  // Create the camera that allows us to view into the scene.
  camera = new THREE.PerspectiveCamera(
    45, // field of view
    window.innerWidth / window.innerHeight, // aspect ratio
    1, // near clipping plane
    1000 // far clipping plane
  );
  camera.position.z = 30;
  camera.position.x = -30;
  camera.position.y = 30;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Create the scene that holds all of the visible objects.
  scene = new THREE.Scene();

  // Create the renderer that controls animation.
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Attach the renderer to the div element.
  document.getElementById("webgl").appendChild(renderer.domElement);

  // Create controls that allows a user to move the scene with a mouse.
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Load the images used in the background.
  var path = "cubemap/";
  var format = ".jpg";
  var urls = [
    path + "px" + format,
    path + "nx" + format,
    path + "py" + format,
    path + "ny" + format,
    path + "pz" + format,
    path + "nz" + format
  ];
  var reflectionCube = new THREE.CubeTextureLoader().load(urls);
  reflectionCube.format = THREE.RGBFormat;

  // Attach the background cube to the scene.
  scene.background = reflectionCube;

  var ambientLight = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambientLight);

  // Create light from the sun.
  light = new THREE.PointLight("rgb(255, 211, 100)", 5);
  light.castShadow = true;

  light.shadow.bias = 0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;

  scene.add(light);

  // Create the sun.
  var textureLoader = new THREE.TextureLoader();

  uniforms = {
    time: { value: 1.0 },
    uvScale: { value: new THREE.Vector2(2.0, 1) },
    texture1: { value: textureLoader.load("../images/cloud.png") },
    texture2: { value: textureLoader.load("../images/lavatile.jpg") }
  };

  uniforms["texture1"].value.wrapS = uniforms["texture1"].value.wrapT =
    THREE.RepeatWrapping;
  uniforms["texture2"].value.wrapS = uniforms["texture2"].value.wrapT =
    THREE.RepeatWrapping;

  var size = 10;

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent
  });

  mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 30, 30), material);
  mesh.rotation.x = 0.3;
  scene.add(mesh);

  // Create the Earth, the Moon, and a ring around the earth.
  mercury = createPlanet(mercuryData, mercuryData.distanceFromAxis, 0, 0);
  venus = createPlanet(venusData, venusData.distanceFromAxis, 0, 0);
  earth = createPlanet(earthData, earthData.distanceFromAxis, 0, 0);
  moonEarth = createMoon(moonData, moonData.distanceFromAxis, 0, 0, 0.2);
  mars = createPlanet(marsData, marsData.distanceFromAxis, 0, 0);
  moonMars1 = createMoon(moonData, moonData.distanceFromAxis, 0.4, 0, 0.1);
  moonMars2 = createMoon(moonData, moonData.distanceFromAxis, -0.4, 0, 0.1);
  jupiter = createPlanet(jupiterData, jupiterData.distanceFromAxis, 0, 0);
  moonJupiter1 = createMoon(moonData, moonData.distanceFromAxis, 2, 0, 0.1);
  moonJupiter2 = createMoon(moonData, moonData.distanceFromAxis, -2, 0, 0.1);
  moonJupiter3 = createMoon(moonData, moonData.distanceFromAxis, 1.5, 0, 0.1);
  moonJupiter4 = createMoon(moonData, moonData.distanceFromAxis, -1.5, 0, 0.1);
  moonJupiter5 = createMoon(moonData, moonData.distanceFromAxis, 1.0, 0, 0.1);
  moonJupiter6 = createMoon(moonData, moonData.distanceFromAxis, -1.0, 0, 0.1);
  moonJupiter7 = createMoon(moonData, moonData.distanceFromAxis, 0.5, 0, 0.1);
  moonJupiter8 = createMoon(moonData, moonData.distanceFromAxis, -0.5, 0, 0.1);
  moonJupiter9 = createMoon(moonData, moonData.distanceFromAxis, 0.0, 0, 0.1);
  moonJupiter10 = createMoon(moonData, moonData.distanceFromAxis, -2.5, 0, 0.1);
  saturn = createPlanet(saturnData, saturnData.distanceFromAxis, 0, 0);
  saturnRing = createPlanetRing(
    "img/saturnringcolor.jpg",
    saturnData.distanceFromAxis
  );
  moonSaturn1 = createMoon(moonData, moonData.distanceFromAxis, 2, 0, 0.1);
  moonSaturn2 = createMoon(moonData, moonData.distanceFromAxis, -2, 0, 0.1);
  moonSaturn3 = createMoon(moonData, moonData.distanceFromAxis, 1.5, 0, 0.1);
  moonSaturn4 = createMoon(moonData, moonData.distanceFromAxis, -1.5, 0, 0.1);
  moonSaturn5 = createMoon(moonData, moonData.distanceFromAxis, 1.0, 0, 0.1);
  moonSaturn6 = createMoon(moonData, moonData.distanceFromAxis, -1.0, 0, 0.1);
  moonSaturn7 = createMoon(moonData, moonData.distanceFromAxis, 0.5, 0, 0.1);
  moonSaturn8 = createMoon(moonData, moonData.distanceFromAxis, -0.5, 0, 0.1);
  moonSaturn9 = createMoon(moonData, moonData.distanceFromAxis, 0.0, 0, 0.1);
  moonSaturn10 = createMoon(moonData, moonData.distanceFromAxis, -2.5, 0, 0.1);
  uranus = createPlanet(uranusData, uranusData.distanceFromAxis, 0, 0);
  uranusRing = createPlanetRing(
    "img/uranusringcolor.jpg",
    uranusData.distanceFromAxis
  );
  moonUranus1 = createMoon(moonData, moonData.distanceFromAxis, 2, 0, 0.1);
  moonUranus2 = createMoon(moonData, moonData.distanceFromAxis, -2, 0, 0.1);
  moonUranus3 = createMoon(moonData, moonData.distanceFromAxis, 1.5, 0, 0.1);
  moonUranus4 = createMoon(moonData, moonData.distanceFromAxis, -1.5, 0, 0.1);
  moonUranus5 = createMoon(moonData, moonData.distanceFromAxis, 1.0, 0, 0.1);
  moonUranus6 = createMoon(moonData, moonData.distanceFromAxis, -1.0, 0, 0.1);
  moonUranus7 = createMoon(moonData, moonData.distanceFromAxis, 0.5, 0, 0.1);
  moonUranus8 = createMoon(moonData, moonData.distanceFromAxis, -0.5, 0, 0.1);
  moonUranus9 = createMoon(moonData, moonData.distanceFromAxis, 0.0, 0, 0.1);
  moonUranus10 = createMoon(moonData, moonData.distanceFromAxis, -2.5, 0, 0.1);
  neptune = createPlanet(neptuneData, neptuneData.distanceFromAxis, 0, 0);
  moonNeptune1 = createMoon(moonData, moonData.distanceFromAxis, 2, 0, 0.1);
  moonNeptune2 = createMoon(moonData, moonData.distanceFromAxis, -2, 0, 0.1);
  moonNeptune3 = createMoon(moonData, moonData.distanceFromAxis, 1.5, 0, 0.1);
  moonNeptune4 = createMoon(moonData, moonData.distanceFromAxis, -1.5, 0, 0.1);
  moonNeptune5 = createMoon(moonData, moonData.distanceFromAxis, 1.0, 0, 0.1);
  moonNeptune6 = createMoon(moonData, moonData.distanceFromAxis, -1.0, 0, 0.1);
  moonNeptune7 = createMoon(moonData, moonData.distanceFromAxis, 0.5, 0, 0.1);
  moonNeptune8 = createMoon(moonData, moonData.distanceFromAxis, -0.5, 0, 0.1);
  moonNeptune9 = createMoon(moonData, moonData.distanceFromAxis, 0.0, 0, 0.1);
  moonNeptune10 = createMoon(moonData, moonData.distanceFromAxis, -2.5, 0, 0.1);
  pluto = createPlanet(plutoData, plutoData.distanceFromAxis, 0, 0);
  moonPluto1 = createMoon(moonData, moonData.distanceFromAxis, 0, 0, 0.1);
  moonPluto2 = createMoon(moonData, moonData.distanceFromAxis, .5, 0, 0.1);
  moonPluto3 = createMoon(moonData, moonData.distanceFromAxis, -.5, 0, 0.1);
  moonPluto4 = createMoon(moonData, moonData.distanceFromAxis, -1, 0, 0.1);
  moonPluto5 = createMoon(moonData, moonData.distanceFromAxis, 1.0, 0, 0.1);
  meteor1 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(10),0,meteorData.distanceFromAxis * Math.cos(10));
meteor2 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(20),0,meteorData.distanceFromAxis * Math.cos(20));
meteor3 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(30),0,meteorData.distanceFromAxis * Math.cos(30));
meteor4 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(40),0,meteorData.distanceFromAxis * Math.cos(40));
meteor5 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(50),0,meteorData.distanceFromAxis * Math.cos(50));
meteor6 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(60),0,meteorData.distanceFromAxis * Math.cos(60));
meteor7 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(70),0,meteorData.distanceFromAxis * Math.cos(70));
meteor8 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(80),0,meteorData.distanceFromAxis * Math.cos(80));
meteor9 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(90),0,meteorData.distanceFromAxis * Math.cos(90));
meteor10 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(100),0,meteorData.distanceFromAxis * Math.cos(100));
meteor11 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(110),0,meteorData.distanceFromAxis * Math.cos(110));
meteor12 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(120),0,meteorData.distanceFromAxis * Math.cos(120));
meteor13 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(130),0,meteorData.distanceFromAxis * Math.cos(130));
meteor14 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(140),0,meteorData.distanceFromAxis * Math.cos(140));
meteor15 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(150),0,meteorData.distanceFromAxis * Math.cos(150));
meteor16 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(160),0,meteorData.distanceFromAxis * Math.cos(160));
meteor17 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(170),0,meteorData.distanceFromAxis * Math.cos(170));
meteor18 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(180),0,meteorData.distanceFromAxis * Math.cos(180));
meteor19 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(190),0,meteorData.distanceFromAxis * Math.cos(190));
meteor20 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(200),0,meteorData.distanceFromAxis * Math.cos(200));
meteor21 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(210),0,meteorData.distanceFromAxis * Math.cos(210));
meteor22 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(220),0,meteorData.distanceFromAxis * Math.cos(220));
meteor23 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(230),0,meteorData.distanceFromAxis * Math.cos(230));
meteor24 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(240),0,meteorData.distanceFromAxis * Math.cos(240));
meteor25 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(250),0,meteorData.distanceFromAxis * Math.cos(250));
meteor26 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(260),0,meteorData.distanceFromAxis * Math.cos(260));
meteor27 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(270),0,meteorData.distanceFromAxis * Math.cos(270));
meteor28 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(280),0,meteorData.distanceFromAxis * Math.cos(280));
meteor29 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(290),0,meteorData.distanceFromAxis * Math.cos(290));
meteor30 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(300),0,meteorData.distanceFromAxis * Math.cos(300));
meteor31 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(310),0,meteorData.distanceFromAxis * Math.cos(310));
meteor32 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(320),0,meteorData.distanceFromAxis * Math.cos(320));
meteor33 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(330),0,meteorData.distanceFromAxis * Math.cos(330));
meteor34 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(340),0,meteorData.distanceFromAxis * Math.cos(340));
meteor35 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(350),0,meteorData.distanceFromAxis * Math.cos(350));
meteor36 = createPlanet(meteorData,meteorData.distanceFromAxis * Math.sin(360),0,meteorData.distanceFromAxis * Math.cos(360));

  // Create the visible orbit that the Earth uses.
  createOrbits();

  // Start the animation.
  update(renderer, scene, camera, controls);
}

// Start everything.
init();
