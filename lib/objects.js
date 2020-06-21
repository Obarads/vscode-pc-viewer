
function fileName(url) {
    var name = url.split('').reverse().join('');
    name = /([^\/]*)/.exec(name);
    name = name[1].split('').reverse().join('');
    return name;
}

function addGridHelper(scene, size, divitions) {
    var gridHelper = new THREE.GridHelper(size, divitions);
    gridHelper.name = "gridHelper"
    // gridHelper.rotateX(Math.PI  * 270 / 180);
    scene.add(gridHelper)
    return gridHelper
}

function addAxis(scene) {
    var axis = new THREE.AxesHelper(1.0);
    axis.material.linewidth = 3;
    scene.add(axis);
    return axis
}

// function addPly(scene, load_path, point_size) {
function addPly(self, loadPath){
    var loader = new THREE.PLYLoader();
    loader.load(loadPath, function (geometry) {
        // var pointsMaterial = new THREE.PointsMaterial({ size: point_size });
        var pointsMaterial = new THREE.PointsMaterial();

        try {
            if (geometry.getAttribute("color").length > 0) {
                pointsMaterial.vertexColors = true;
            }
        } catch (e) {
            console.error(e);
            self.monochrome = true;
        }

        self.points = new THREE.Points(geometry, pointsMaterial);
        self.points.name = fileName(loadPath);

        self.scene.add(self.points);

        // try{if (geometry.getIndex().length > 0) {
        //     geometry.computeVertexNormals();
        //     var material = new THREE.MeshStandardMaterial( { color: 0x0055ff, flatShading: true } );
        //     var mesh = new THREE.Mesh( geometry, material );
        //     mesh.castShadow = true;
        //     mesh.receiveShadow = true;
        //     scene.add( mesh );
        // }}catch(e){console.error(e);}
        self.initCamera();
        self.animate();
    }.bind(self));
}

function addPcd(self, loadPath) {
    var loader = new THREE.PCDLoader();
    loader.load(loadPath, function (points){
        if (points.material.vertexColors == false){
            self.monochrome = true
        }
        self.points = points;
        self.scene.add(points);
        self.initCamera();
        self.animate();
    }.bind(self));
}















