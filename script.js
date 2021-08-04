(() => {

// Set the scene size.
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Set some camera attributes.
const VIEW_ANGLE = 90;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Control variables

const paramaters = {    
    numberOfParticles: 15200,
    shapeChange: 60,
};

class Shape {
    isWithinBounds(x,y,z){}
    getStartingCoords(){}
}

class Square extends Shape {
    constructor(height, width, depth){
        super();
        this.height = height;
        this.width = width;
        this.depth = depth;
    }

    isWithinBounds(x,y,z) {
        return (Math.abs(x) <= this.width / 2)  && (Math.abs(y) <= this.height / 2) && (Math.abs(z) <= this.depth / 2); 
    }

    getStartingCoords(){
        return [Math.random() * this.height - (this.height / 2), Math.random() * this.width - (this.width / 2), Math.random() * this.depth - (this.depth / 2)];
    }
}

class Circle extends Shape {
    constructor(radius){
        super();
        this.radius = radius;
    }

    isWithinBounds(x,y,z){
        return getOriginDistance(x,y,z) <= this.radius;
    }

    getStartingCoords(){
        var coords;

        do{
            coords = this.getRandomCoords();
        } while(!this.isWithinBounds(coords[0], coords[1], coords[2]))

        return coords;
    }

    getRandomCoords(){
        return [Math.random() * (this.radius * 2) - this.radius,Math.random() * (this.radius * 2) - this.radius, Math.random() * (this.radius * 2) - this.radius];
    }
}

class Diamond extends Shape {
    constructor(height, width){
        super();
        this.height = height;
        this.width = width;
        this.topAngle = Math.atan(this.height/2 / this.width/2);
    }

    getStartingCoords(){
        var y =  Math.random() * this.height - (this.height / 2);
        var width = this.getWidth(this.height - y);

        var x =  Math.random() * width - (width / 2);
        var z =  Math.random() * width - (width / 2);

        return [x,y,z];
    }

    isWithinBounds(x,y,z) {
        var trueY = Math.abs(y);
        var width = this.getWidth((this.height/2) - trueY);

        return (trueY <= this.height / 2) && (Math.abs(x) <= width / 2)  && (Math.abs(z) <= width / 2); 
    }

    getWidth(height){
        return height * Math.tan(this.topAngle) * 2;
    }
}

class InvertedDiamond extends Shape {
    constructor(height, width){
        super();
        this.height = height;
        this.width = width;
        this.topAngle = Math.atan(this.height/2 / this.width/2);
    }

    getStartingCoords(){
        var y =  Math.random() * this.height - (this.height / 2);
        var width = this.getWidth(y);

        var x =  Math.random() * width - (width / 2);
        var z =  Math.random() * width - (width / 2);

        return [x,y,z];
    }

    isWithinBounds(x,y,z) {
        var trueY = Math.abs(y);
        var width = this.getWidth(trueY);

        return (trueY <= this.height / 2) && (Math.abs(x) <= width / 2)  && (Math.abs(z) <= width / 2); 
    }

    getWidth(height){
        return height / Math.tan(this.topAngle) * 4;
    }
}

const square = new Square(1000,1000,1000);
const circle = new Circle(800);
const invertedDiamond = new InvertedDiamond(1000,1000);
const diamond = new Diamond(1000,1000);

const shapes = [square, circle, diamond, invertedDiamond];

const particleSystemParmaters = {
    particleSystemZ: -1040,
    rotationY : 0.002,
    colourChange : 0.01,
    shape: circle,
    previousShape: circle,
    shapeChange: paramaters.shapeChange
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

  if (currentParticles >= 8000 && Math.random() >= 0.5)
    changeNumberOfParticle(particleSystem.geometry.vertices.length -800);

  requestAnimationFrame(update);
}

function updateParticleSystem(){
    particleSystem.rotation.y += particleSystemParmaters.rotationY;

    particleSystem.material.color.r += getRandom();
    particleSystem.material.color.g += getRandom();
    particleSystem.material.color.b += getRandom();

    if (particleSystemParmaters.shapeChange > 0)
        particleSystemParmaters.shapeChange --;
}

function updateParticles(){
    var shapeChangeProgress = particleSystemParmaters.shapeChange / paramaters.shapeChange;

    for(var i =0; i < particleSystem.geometry.vertices.length; i++){
        var particle = particleSystem.geometry.vertices[i];
        var applicableShape = Math.random() >= shapeChangeProgress ? particleSystemParmaters.shape : particleSystemParmaters.previousShape;

        if (!applicableShape.isWithinBounds(particle.x, particle.y, particle.z)){
            var coords = applicableShape.getStartingCoords();

            particle.velocity.y = 0;
            particle.x = coords[0];
            particle.y = coords[1];
            particle.z = coords[2];
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

gui.add(particleSystemParmaters, 'rotationY').min(-0.1).max(0.1).step(0.001).listen();

gui.add(particleSystemParmaters, 'colourChange').min(0.001).max(0.1).step(0.0001).listen();

gui.add(particleSystemParmaters, 'particleSystemZ').min(-2000).max(0).step(20).onChange((value) => {
    particleSystem.position.z = value;
})

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
    var texture = THREE.ImageUtils.loadTexture("https://aerotwist.com/static/tutorials/creating-particles-with-three-js/images/particle.png")
    //var texture = THREE.ImageUtils.loadTexture("https://threejs.org/examples/textures/particle2.png")

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
    var coords = particleSystemParmaters.shape.getStartingCoords();
    var particle = new THREE.Vector3(coords[0], coords[1], coords[2]);

    // create a velocity vector
    particle.velocity = new THREE.Vector3(
    0,              // x
    -Math.random(), // y: random vel
    0);             // z

    return particle;
}

function toggleShape(){
    var currentShape = particleSystemParmaters.shape;
    var nextIndex = shapes.indexOf(currentShape) + 1 < shapes.length ?  shapes.indexOf(currentShape) + 1 : 0;
    
    particleSystemParmaters.previousShape = shapes[nextIndex];
    particleSystemParmaters.shape = shapes[nextIndex];
    particleSystemParmaters.shapeChange = paramaters.shapeChange;

    changeNumberOfParticle(paramaters.numberOfParticles);
}

function attachRenderer(renderer){
    var domContainer = document.querySelector('#container');

    domContainer.appendChild(renderer.domElement);
}

function getRandom(){
    return Math.random() * ( particleSystemParmaters.colourChange * ( Math.random() > 0.5 ? 1 : -1));
}

function getOriginDistance(x, y, z){
    return Math.sqrt((Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2)));
}

document.onkeydown = (e) => {
    if (e.keyCode == 32){
        var overlays = document.getElementsByClassName('overlay');

        for(var i=0; i< overlays.length;i++){
            overlays[i].remove();
        }

        toggleShape();
    }
}

})();