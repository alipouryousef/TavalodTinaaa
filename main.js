import * as THREE from "three";

window.onerror = function (msg, url, line) {
  alert(msg + "\nLine: " + line);
};

let scene;
let camera;
let renderer;

let candleLight;
let blown = false;

init();
animate();

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000814);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  document.body.appendChild(
    renderer.domElement
  );

  const ambient = new THREE.AmbientLight(
    0xffffff,
    0.5
  );

  scene.add(ambient);

  candleLight = new THREE.PointLight(
    0xffaa33,
    3,
    20
  );

  candleLight.position.set(
    0,
    1,
    0
  );

  scene.add(candleLight);

  // کیک

  const cake = new THREE.Mesh(
    new THREE.CylinderGeometry(
      1,
      1,
      0.7,
      32
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffd4d4
    })
  );

  scene.add(cake);

  // ستاره‌ها

  const stars = new THREE.BufferGeometry();
  const points = [];

  for (let i = 0; i < 2000; i++) {
    points.push(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      -Math.random() * 100
    );
  }

  stars.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      points,
      3
    )
  );

  const starMesh =
    new THREE.Points(
      stars,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2
      })
    );

  scene.add(starMesh);
}

function animate() {
  requestAnimationFrame(animate);

  if (!blown) {
    candleLight.intensity =
      2.8 +
      Math.sin(Date.now() * 0.02) *
        0.4;
  }

  renderer.render(
    scene,
    camera
  );
}

document
  .getElementById("startBtn")
  .addEventListener(
    "click",
    async () => {

      document.getElementById(
        "overlay"
      ).style.display = "none";

      try {
        await startMic();
      } catch (e) {
        alert(
          "Microphone Error:\n" +
            e.message
        );
      }
    }
  );

async function startMic() {

  const stream =
    await navigator.mediaDevices.getUserMedia(
      {
        audio: true
      }
    );

  const ctx =
    new (window.AudioContext ||
      window.webkitAudioContext)();

  const analyser =
    ctx.createAnalyser();

  const source =
    ctx.createMediaStreamSource(
      stream
    );

  source.connect(analyser);

  analyser.fftSize = 256;

  const data =
    new Uint8Array(
      analyser.frequencyBinCount
    );

  function detect() {

    if (blown) return;

    requestAnimationFrame(
      detect
    );

    analyser.getByteFrequencyData(
      data
    );

    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }

    const volume =
      sum / data.length;

    if (volume > 55) {
      blowCandles();
    }
  }

  detect();
}

function blowCandles() {

  blown = true;

  candleLight.intensity = 0;

  setTimeout(() => {
    document.getElementById(
      "message"
    ).style.display = "flex";
  }, 1500);
}

document
  .getElementById(
    "replayBtn"
  )
  .addEventListener(
    "click",
    () => {
      location.reload();
    }
  );

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);
