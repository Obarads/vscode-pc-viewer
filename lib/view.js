var camera, scene, renderer, controls, gui;
var mesh, points, axis, gridHelper;
var lasttime;
var params = {
    point_size: point_default_size,
    BG_color: bg_color,
}
console.log(bg_color)
var params_gridhelper = {
    size: 1000,
    divitions: 2000,
    display: true
}

init(load_path);
animate();

function init(load_path) {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(params.BG_color);

    axis = new THREE.AxisHelper(0.5);
    scene.add(axis);

    if (use_gridhelper) {
        gridHelper = new THREE.GridHelper(params_gridhelper.size, params_gridhelper.divitions);
        gridHelper.name = "gridHelper"
        scene.add(gridHelper)
    }

    var ext = load_path.split('.').pop().toLowerCase()
    if (ext == "ply") {
        var loader = new THREE.PLYLoader();
        loader.load(load_path, function (geometry) {
            var pointsMaterial = new THREE.PointsMaterial({ size: params.point_size });
            try { if (geometry.getAttribute("color").length > 0) { pointsMaterial.vertexColors = true; } }
            catch (e) { console.error(e); }
            points = new THREE.Points(geometry, pointsMaterial);
            points.name = file_name(load_path);
            scene.add(points);

            // try{if (geometry.getIndex().length > 0) {
            //     geometry.computeVertexNormals();
            //     var material = new THREE.MeshStandardMaterial( { color: 0x0055ff, flatShading: true } );
            //     var mesh = new THREE.Mesh( geometry, material );
            //     mesh.castShadow = true;
            //     mesh.receiveShadow = true;
            //     scene.add( mesh );
            // }}catch(e){console.error(e);}

            cameraControls()
        });
    } else if (ext == "pcd") {
        var loader = new THREE.PCDLoader();
        loader.load(load_path, function (_points) {
            points = _points
            scene.add(points);
            cameraControls()
        });
    } else { console.log("Error: unknown extension.") }

    scene.add(new THREE.HemisphereLight(0x443333, 0x111122));

    addShadowedLight(1, 1, 1, 0xffffff, 1.35);
    addShadowedLight(0.5, 1, - 1, 0xffaa00, 1);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById("view").appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    gui = new dat.GUI();

    gui.add(params, 'point_size').min(0).max(20).max(point_max_size); // For displaying gui slider, I have no idea why but I must first assign non-typescript value to max value.
    gui.addColor(params, "BG_color");

    if (use_gridhelper) {
        var gridHelperFolder = gui.addFolder('gridHelper');
        gridHelperFolder.add(params_gridhelper, "size");
        gridHelperFolder.add(params_gridhelper, "divitions");
        gridHelperFolder.add(params_gridhelper, "display");
    }
}

function getCenterPoint(geometry) {
    var middle = new THREE.Vector3();

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    return middle
}

function getCameraPos(geometry, middle) {
    var camera_pos = new THREE.Vector3();

    camera_pos.x = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
    camera_pos.y = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;
    camera_pos.z = (geometry.boundingBox.max.z - geometry.boundingBox.min.z) / 2;

    camera_pos.add(middle);
    camera_pos.multiplyScalar(2);

    return camera_pos

    // x = middle.x
    // y = middle.y
    // z = middle.z

    // var trans = new THREE.Matrix4();
    // trans.set(
    //     1,0,0,0,
    //     0,1,0,0,
    //     0,0,1,0,
    //     x,y,z,1
    // )
    // var rot = new THREE.Matrix4();
    // var cy = Math.cos((Math.PI/2)*(z/x));
    // var sy = Math.sin((Math.PI/2)*(z/x));
    // rot.set(
    //     cy,0,-sy,0,
    //     0,1,0,0,
    //     sy,0,cy,0,
    //     0,0,0,1
    // );
    // trans.multiply(rot);

    // var new_camera_pos = new THREE.Vector3(0,0,0);
    // console.log(trans)
    // new_camera_pos.transformDirection(trans);
    // console.log(new_camera_pos)

    // return new_camera_pos
}

function cameraControls() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 4000);
    points.geometry.computeBoundingBox();
    middle = getCenterPoint(points.geometry)
    camera_pos = getCameraPos(points.geometry, middle)
    camera.position.copy(camera_pos)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = middle;
    controls.update();
}

function forGui(time) {
    if (!lasttime) {
        lasttime = time;
        return;
    }
    points.material.size = params.point_size;
    scene.background = new THREE.Color(params.BG_color);

    if (use_gridhelper) {
        if (params_gridhelper.display) {
            if (params_gridhelper.size != gridHelper.size || params_gridhelper.divitions != gridHelper.divitions) {
                scene.remove(gridHelper);
                gridHelper = new THREE.GridHelper(params_gridhelper.size, params_gridhelper.divitions);
                gridHelper.name = "gridHelper";
                scene.add(gridHelper)
            }
        } else {
            scene.remove(gridHelper);
        }
    }


}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    var time = Date.now();
    forGui(time);
    controls.update();
    renderer.render(scene, camera);

}

function create_cube(load_path) {
    var texture = new THREE.TextureLoader().load(load_path);
    var geometry = new THREE.BoxBufferGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var mesh = new THREE.Mesh(geometry, material);
    return mesh
}

function file_name(url) {
    var name = url.split('').reverse().join('');
    name = /([^\/]*)/.exec(name);
    name = name[1].split('').reverse().join('');
    return name;
}

function addShadowedLight(x, y, z, color, intensity) {

    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);

    directionalLight.castShadow = true;

    var d = 1;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    directionalLight.shadow.bias = - 0.001;

}