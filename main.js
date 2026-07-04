const canvas = document.getElementById("scene");

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias:true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio,2)
);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x03040a,0.02);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth/window.innerHeight,
    0.1,
    500
);

camera.position.set(0,2,8);

const moon = new THREE.PointLight(
    0xbfd4ff,
    3,
    300
);

moon.position.set(0,40,-80);
scene.add(moon);

scene.add(
    new THREE.AmbientLight(
        0x405070,
        1.2
    )
);

//////////////////////////////////////
// water
//////////////////////////////////////

const water = new THREE.Mesh(
    new THREE.PlaneGeometry(500,500,200,200),
    new THREE.MeshPhongMaterial({
        color:0x09111d,
        shininess:100,
        transparent:true,
        opacity:0.95
    })
);

water.rotation.x = -Math.PI/2;
scene.add(water);

//////////////////////////////////////
// stars
//////////////////////////////////////

const starsGeo = new THREE.BufferGeometry();
const stars = [];

for(let i=0;i<4000;i++){

    stars.push(
        (Math.random()-0.5)*400,
        Math.random()*200,
        (Math.random()-0.5)*400
    );
}

starsGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(stars,3)
);

const starField = new THREE.Points(
    starsGeo,
    new THREE.PointsMaterial({
        color:0xffffff,
        size:0.6
    })
);

scene.add(starField);

//////////////////////////////////////
// lanterns
//////////////////////////////////////

const lanterns = [];

for(let i=0;i<1000;i++){

    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.15,8,8),
        new THREE.MeshBasicMaterial({
            color:0xffcc77
        })
    );

    mesh.position.set(
        (Math.random()-0.5)*150,
        Math.random()*8+3,
        -Math.random()*200
    );

    scene.add(mesh);
    lanterns.push(mesh);
}

//////////////////////////////////////
// boat
//////////////////////////////////////

const boat = new THREE.Group();

const body = new THREE.Mesh(
    new THREE.BoxGeometry(4,0.5,8),
    new THREE.MeshStandardMaterial({
        color:0x3c2415
    })
);

boat.add(body);
scene.add(boat);

//////////////////////////////////////
// legs
//////////////////////////////////////

const legMat = new THREE.MeshStandardMaterial({
    color:0x222222
});

const leg1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.7,0.2,2),
    legMat
);

leg1.position.set(-0.6,1.2,1);

const leg2 = leg1.clone();
leg2.position.x = 0.6;

camera.add(leg1);
camera.add(leg2);
scene.add(camera);

//////////////////////////////////////
// cake
//////////////////////////////////////

const cake = new THREE.Group();

const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1,1,0.5,32),
    new THREE.MeshStandardMaterial({
        color:0xffd7d7
    })
);

cake.add(base);

const flames = [];

for(let i=-1;i<=1;i++){

    const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.05,
            0.05,
            0.4,
            8
        ),
        new THREE.MeshStandardMaterial({
            color:0xffffff
        })
    );

    candle.position.set(i*0.3,0.4,0);

    const flame = new THREE.PointLight(
        0xffaa33,
        1.5,
        4
    );

    flame.position.y = 0.25;

    candle.add(flame);

    flames.push(flame);

    cake.add(candle);
}

cake.position.set(0,0.4,-2);
camera.add(cake);

//////////////////////////////////////
// breathing motion
//////////////////////////////////////

let t = 0;

function animate(){

    requestAnimationFrame(animate);

    t += 0.01;

    camera.position.y =
        2 +
        Math.sin(t)*0.03;

    camera.rotation.z =
        Math.sin(t*0.5)*0.005;

    boat.rotation.z =
        Math.sin(t)*0.01;

    water.material.opacity =
        0.92 +
        Math.sin(t)*0.02;

    renderer.render(
        scene,
        camera
    );
}

animate();

//////////////////////////////////////
// microphone
//////////////////////////////////////

let blown = false;

async function setupMic(){

    try{

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio:true
            });

        const audioContext =
            new AudioContext();

        const analyser =
            audioContext.createAnalyser();

        const mic =
            audioContext.createMediaStreamSource(
                stream
            );

        mic.connect(analyser);

        analyser.fftSize = 256;

        const data =
            new Uint8Array(
                analyser.frequencyBinCount
            );

        function detect(){

            if(blown) return;

            requestAnimationFrame(detect);

            analyser.getByteFrequencyData(
                data
            );

            let sum = 0;

            for(let i=0;i<data.length;i++){
                sum += data[i];
            }

            const volume =
                sum/data.length;

            if(volume > 65){
                blowCandles();
            }
        }

        detect();

    }catch(e){
        console.log("Mic denied");
    }
}

//////////////////////////////////////
// celebration
//////////////////////////////////////

function blowCandles(){

    blown = true;

    flames.forEach(f=>{
        f.intensity = 0;
    });

    cake.children[0].material.emissive =
        new THREE.Color(0xffc8ff);

    setTimeout(()=>{

        lanterns.forEach((l,i)=>{

            setTimeout(()=>{
                riseLantern(l);
            },i*5);

        });

    },1000);

    setTimeout(()=>{
        document
            .getElementById("message")
            .classList.add("show");
    },6000);
}

function riseLantern(l){

    const id = setInterval(()=>{

        l.position.y += 0.1;

        if(l.position.y > 120){
            clearInterval(id);
        }

    },16);
}

//////////////////////////////////////
// buttons
//////////////////////////////////////

document
.getElementById("startBtn")
.onclick = ()=>{

    document
    .getElementById("overlay")
    .classList.add("hidden");

    setupMic();
};

document
.getElementById("replayBtn")
.onclick = ()=>{
    location.reload();
};

window.addEventListener(
    "resize",
    ()=>{
        camera.aspect =
            window.innerWidth/
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);
