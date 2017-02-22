(() => {

// Set the scene size.
const WIDTH = 800;
const HEIGHT = 800;

// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

const sphereMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0xCC0000
    });

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

scene.add(createSphere(sphereMaterial));
scene.add(createLight());

function update () {
  // Draw!
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

// Schedule the first frame.
requestAnimationFrame(update);

})();

function createLight(){
    const pointLight =
    new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    return pointLight;
}

function createSphere(sphereMaterial){
    // Set up the sphere vars
    const RADIUS = 50;
    const SEGMENTS = 16;
    const RINGS = 16;

    const sphere = new THREE.Mesh(

    new THREE.SphereGeometry(
        RADIUS,
        SEGMENTS,
        RINGS),

    sphereMaterial);

    // Move the Sphere back in Z so we can see it.
    sphere.position.z = -300;

    return sphere;
}

function attachRenderer(renderer){
    var domContainer = document.querySelector('#container');

    domContainer.appendChild(renderer.domElement);
}