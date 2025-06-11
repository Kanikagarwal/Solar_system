const SCALE = 7;
const scene = new THREE.Scene();

let colorToggle = "black";
let actualColor = 0xffffff;
let colorName = "white";
let bgColor = 0x000000;
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 50 * SCALE, 100 * SCALE);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000);

const ambientLight = new THREE.AmbientLight(0x888888);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 112, 500);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const sunGeometry = new THREE.SphereGeometry(9 * SCALE, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const planetData = [
  {
    name: "Mercury",
    color: 0x808080,
    size: 0.75 * SCALE,
    distance: 12 * SCALE,
    speed: 0.03,
  },
  {
    name: "Venus",
    color: 0xffcc99,
    size: 1.35 * SCALE,
    distance: 16 * SCALE,
    speed: 0.015,
  },
  {
    name: "Earth",
    color: 0x1e90ff,
    size: 1.5 * SCALE,
    distance: 19 * SCALE,
    speed: 0.01,
  },
  {
    name: "Mars",
    color: 0xff0000,
    size: 1.2 * SCALE,
    distance: 23 * SCALE,
    speed: 0.008,
  },
  {
    name: "Jupiter",
    color: 0xffa500,
    size: 3.75 * SCALE,
    distance: 28 * SCALE,
    speed: 0.002,
  },
  {
    name: "Saturn",
    color: 0xffff99,
    size: 3.3 * SCALE,
    distance: 36 * SCALE,
    speed: 0.0016,
  },
  {
    name: "Uranus",
    color: 0x00ffff,
    size: 2.7 * SCALE,
    distance: 42 * SCALE,
    speed: 0.001,
  },
  {
    name: "Neptune",
    color: 0x1e90fa,
    size: 2.55 * SCALE,
    distance: 48 * SCALE,
    speed: 0.0008,
  },
];

const planets = [];

planetData.forEach(({ name, color, size, distance }) => {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { angle: Math.random() * Math.PI * 2, distance };
  planets.push(mesh);
  scene.add(mesh);

  const ringGeometry = new THREE.RingGeometry(
    distance - 0.05,
    distance + 0.05,
    128
  );
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: actualColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.01;
  scene.add(ring);

  const label = makeLabel(name);
  label.visible = false;
  mesh.add(label);
  label.position.set(0, size + 2, 0);
  mesh.userData.label = label;
});

const saturn = planets[5];
const ringInnerRadius = planetData[5].size + 2;
const ringOuterRadius = ringInnerRadius + 6;
const saturnRingGeometry = new THREE.RingGeometry(
  ringInnerRadius,
  ringOuterRadius,
  128
);
const saturnRingMesh = new THREE.MeshBasicMaterial({
  color: actualColor,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});

const ringS = new THREE.Mesh(saturnRingGeometry, saturnRingMesh);
ringS.rotation.x = Math.PI / 2;

saturn.add(ringS);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  planets.forEach((planet, i) => {
    const speed = planetData[i].speed;
    planet.userData.angle += speed * delta * 60;
    const x = planet.userData.distance * Math.cos(planet.userData.angle);
    const z = planet.userData.distance * Math.sin(planet.userData.angle);
    planet.position.set(x, 0, z);
  });

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function makeLabel(message, parameters = {}) {
  const font = parameters.font || "Arial";
  const fontSize = parameters.fontSize || 148;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = 512;
  canvas.height = 128;

  context.font = `${fontSize}px ${font}`;
  context.fillStyle = colorName;
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillText(message, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.userData = { name: message };
  sprite.scale.set(30, 11, 5);

  return sprite;
}

let panel = document.getElementById("control-panel");

planetData.forEach((planet, index) => {
  const container = document.createElement("div");
  container.style.marginBottom = "10px";

  const label = document.createElement("label");
  label.textContent = `${planet.name}: `;
  label.style.marginRight = "4px";

  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = (planet.speed * 10).toFixed(3);
  input.step = "0.001";
  input.value = planet.speed;

  const valueSpan = document.createElement("span");
  valueSpan.textContent = planet.speed.toFixed(3);

  input.addEventListener("input", () => {
    const newSpeed = parseFloat(input.value);
    planetData[index].speed = newSpeed;
    valueSpan.textContent = newSpeed.toFixed(3);
  });

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(valueSpan);
  panel.appendChild(container);
});


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  planets.forEach((p) => {
    if (p.userData.label) {
      p.userData.label.visible = false;
    }
  });

  if (intersects.length > 0) {
    const hovered = intersects[0].object;
    if (hovered.userData.label) {
      hovered.userData.label.visible = true;
    }
  }
});

window.addEventListener("click", function (e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersect = raycaster.intersectObjects([sun]);

  if (intersect.length > 0) {
    toggleColorMode();
  }
});

function toggleColorMode() {
  if (colorToggle === "black") {
    colorToggle = "white";
    actualColor = 0x000000;
    colorName = "black";
    bgColor = 0xffffff;
  } else {
    colorToggle = "black";
    actualColor = 0xffffff;
    colorName = "white";
    bgColor = 0x000000;
  }

  renderer.setClearColor(bgColor);

  scene.traverse((obj) => {
    if (obj.isMesh && obj.geometry.type === "RingGeometry") {
      obj.material.color.setHex(actualColor);
    }
  });

  saturn.children.forEach((child) => {
    if (child.geometry.type === "RingGeometry") {
      child.material.color.setHex(actualColor);
    }
  });

  planets.forEach((p) => {
    if (p.userData.label) {
      const name =
        p.userData.label.userData?.name ||
        p.userData.label.material.map.image?.text ||
        "Planet";
      const newLabel = makeLabel(name);
      newLabel.position.copy(p.userData.label.position);
      p.remove(p.userData.label);
      p.add(newLabel);
      p.userData.label = newLabel;
    }
  });
if(colorToggle=="black"){
  panel.style.background="black"
panel.style.color="white"
}
else{
  panel.style.background="white"
panel.style.color="black"
}
}

