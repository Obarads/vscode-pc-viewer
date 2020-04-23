var camera, scene, renderer, controls;
var mesh;

init(load_path);
animate();

function init(load_path) {
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 400;

    scene = new THREE.Scene();
    var axis = new THREE.AxisHelper(0.5);
    scene.add(axis);
    scene.add( create_cube() );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.update();

    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );

}

function create_cube() {
    var texture = new THREE.TextureLoader().load( load_path );
    //var texture = new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010})
    var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var _mesh = new THREE.Mesh( geometry, material );
    return _mesh
}
