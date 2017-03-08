(() => {

// Set the scene size.
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Control variables

const paramaters = {    
    numberOfParticles: 8200,
};

const particleSystemParmaters = {
    particleSystemZ: -800,
    rotationY : 0.01,
    colourChange : 0.01
}

// Create a WebGL renderer, camera
// and a scene
const renderer = new THREE.WebGLRenderer();
const camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

const scene = new THREE.Scene();

// Add the camera to the scene.
scene.add(camera);
// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

attachRenderer(renderer);

var particleSystem = createParticles(paramaters.numberOfParticles);

scene.add(createLight());
scene.add(particleSystem);

particleSystem.position.z = particleSystemParmaters.particleSystemZ;

function update () {

  updateParticleSystem();
  updateParticles();

  // Draw!
  renderer.render(scene, camera);
  
  var currentParticles = particleSystem.geometry.vertices.length;

  if (currentParticles >=2000 && Math.random() >= 0.5)
    changeNumberOfParticle(particleSystem.geometry.vertices.length -800);

  requestAnimationFrame(update);
}

function updateParticleSystem(){
    particleSystem.rotation.y += particleSystemParmaters.rotationY;

    particleSystem.material.color.r += getRandom();
    particleSystem.material.color.g += getRandom();
    particleSystem.material.color.b += getRandom();
}

function updateParticles(){

    for(var i =0; i < particleSystem.geometry.vertices.length; i++){
        var particle = particleSystem.geometry.vertices[i];

        if(particle.y < -200){
            particle.y = 200;
            particle.velocity.y = 0;
        }

        particle.velocity.y -= Math.random() * 0.05;

        particle.addVectors(particle, particle.velocity);
    }

    particleSystem.geometry.verticesNeedUpdate = true;
}

function changeNumberOfParticle(amount){
    var change = amount - particleSystem.geometry.vertices.length;
    if (change >0){
        for (var i=0; i < change; i++)
            particleSystem.geometry.vertices.push(createParticle());
    }
    else if (change < 0){
        particleSystem.geometry.vertices.splice(0, Math.abs(change));
    }
}

// Schedule the first frame.
requestAnimationFrame(update);

var gui = new dat.GUI();

gui.add(paramaters, 'numberOfParticles').min(0).max(20000).step(100).listen().onChange((value) => {
    changeNumberOfParticle(value);
});

gui.add(particleSystemParmaters, 'rotationY').min(-0.1).max(0.1).step(0.005).listen();

gui.add(particleSystemParmaters, 'colourChange').min(0.001).max(0.1).step(0.005).listen();

function createLight(){
    const pointLight =
    new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    return pointLight;
}

function createParticles(numberOfParticles){
    THREE.ImageUtils.crossOrigin = '';
    //var texture = THREE.ImageUtils.loadTexture("https://aerotwist.com/static/tutorials/creating-particles-with-three-js/images/particle.png")
    var texture = THREE.ImageUtils.loadTexture("https://threejs.org/examples/textures/particle2.png")

    var particles = new THREE.Geometry();

    var pMaterial = new THREE.PointsMaterial({
            color: 0xAA3939,
            size: 10,
            map: texture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            alphaTest: 0.5
    });

    for (var p = 0; p < numberOfParticles; p++) {
        particles.vertices.push(createParticle());
    }

    // create the particle system
    var particleSystem = new THREE.Points(
        particles,
        pMaterial);

    particleSystem.sortParticles = true;

    return particleSystem;
}

function createParticle(){

    // create a particle with random
    // position values, -250 -> 250
    var pX = Math.random() * 1000 - 500,
        pY = Math.random() * 1000 - 500,
        pZ = (Math.random() * 1000 - 500),
        particle = new THREE.Vector3(pX, pY, pZ);


        // create a velocity vector
        particle.velocity = new THREE.Vector3(
        0,              // x
        -Math.random(), // y: random vel
        0);             // z

        return particle;
}


function attachRenderer(renderer){
    var domContainer = document.querySelector('#container');

    domContainer.appendChild(renderer.domElement);
}

function getRandom(){
    return Math.random() * ( particleSystemParmaters.colourChange * ( Math.random() > 0.5 ? 1 : -1));
}

})();