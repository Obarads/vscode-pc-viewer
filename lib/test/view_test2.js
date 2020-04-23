var camera, scene, renderer, controls;
var mesh;

init(load_path, tex_path, tex2_path);
animate();

function init(load_path, tex_path, tex2_path) {
    const dp = document.getElementById('info');
    dp.textContent = "1"

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 4000 );
    camera.position.z = 20;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x72645b );
    var axis = new THREE.AxisHelper(0.5);
    scene.add(axis);
    //scene.add(create_cube(tex_path));
    var loader = new THREE.PLYLoader();
    loader.load(load_path, function (geometry) {

        geometry.computeVertexNormals();

        var vertices = geometry.getAttribute("position");
        var _loader = new THREE.TextureLoader();
        var texture = _loader.load( tex2_path );
        var pointsMaterial = new THREE.PointsMaterial( {
            color: 0x0080ff,
            map: texture,
            size: 0.02,
            alphaTest: 0.5
        });
        var points = new THREE.Points( vertices, pointsMaterial );
        //scene.add( points );
    });

    group = new THREE.Group();
    scene.add( group );
    var loader = new THREE.TextureLoader();
    var texture = loader.load( tex2_path );
    var vertices = new THREE.DodecahedronGeometry( 10 ).vertices;
    var pointsMaterial = new THREE.PointsMaterial( {
        color: 0x0080ff,
        map: texture,
        size: 1,
        alphaTest: 0.5
    } );
    var pointsGeometry = new THREE.BufferGeometry().setFromPoints( vertices );
    var points = new THREE.Points( pointsGeometry, pointsMaterial );
    group.add( points );

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
    var _texture = new THREE.TextureLoader().load( load_path );
    //var texture = new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010})
    var _geometry = new THREE.BoxBufferGeometry( 10, 10, 10 );
    var _material = new THREE.MeshBasicMaterial( { map: _texture } );
    var _mesh = new THREE.Mesh( _geometry, _material );
    return _mesh
}
