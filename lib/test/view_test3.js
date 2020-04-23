var camera, scene, renderer, controls;
var mesh;

init(load_path);
animate();

function init(load_path) {
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 4000 );
    camera.position.z = 20;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x72645b );

    var axis = new THREE.AxisHelper(0.5);
    scene.add(axis);

    var gridHelper = new THREE.GridHelper( 1000, 2000 );
    scene.add(gridHelper)

    var loader = new THREE.PLYLoader();
    loader.load(load_path, function (geometry) {
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();
        var pointsMaterial = new THREE.PointsMaterial( { size: 0.02 });
        if ( geometry.getAttribute("color").length > 0 ) {
            pointsMaterial.vertexColors = true;
        }
        var points = new THREE.Points( geometry, pointsMaterial );
        points.name = file_name(load_path)
        scene.add( points );
    });

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

function create_cube(load_path) {
    var texture = new THREE.TextureLoader().load( load_path );
    var geometry = new THREE.BoxBufferGeometry( 10, 10, 10 );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );
    return mesh
}

function file_name(url){
    var name = url.split( '' ).reverse().join( '' );
    name = /([^\/]*)/.exec( name );
    name = name[ 1 ].split( '' ).reverse().join( '' );
    return name;
}