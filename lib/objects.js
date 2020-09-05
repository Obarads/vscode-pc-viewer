
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

        console.log(geometry)

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

function addBin(self, loadPath) {
    var loader = new THREE.FileLoader();
    loader.setResponseType( 'arraybuffer' );
    loader.load(loadPath, function (points){
        var vertices = []
        var color = []
        points = new Float32Array(points)
        var numPoints = points.length / 4
        for(i=0; i < numPoints; i++){
            x = points[(i)*4]
            y = points[(i)*4+1]
            z = points[(i)*4+2]
            vertices.push(x,y,z)
        }
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        var material = new THREE.PointsMaterial();
        points = new THREE.Points( geometry, material );
        self.points = points
        self.scene.add(points)
        self.initCamera();
        self.animate();
    }.bind(self));
}

function addObj(self, loadPath) {
    var loader = new THREE.OBJLoader();
    loader.load(loadPath, function (object) {
        // var pointsMaterial = new THREE.PointsMaterial({ size: point_size });
        var pointsMaterial = new THREE.PointsMaterial();

        console.log(object)
        console.log(object.geometry)

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

function addNpy(self, loadPath, fileNumChannels) {
    var loader = new THREE.FileLoader();
    loader.setResponseType( 'arraybuffer' );
    loader.load(loadPath, function (points){
        var vertices = []
        var color = []
        points = new Float64Array(points)
        console.log(fileNumChannels)
        var numPoints = points.length / fileNumChannels
        for(i=0; i < numPoints; i++){
            x = points[(i)*fileNumChannels]
            y = points[(i)*fileNumChannels+1]
            z = points[(i)*fileNumChannels+2]
            vertices.push(x,y,z)
        }
        console.log(vertices)
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        var material = new THREE.PointsMaterial();
        points = new THREE.Points( geometry, material );
        self.points = points
        self.scene.add(points)
        self.initCamera();
        self.animate();
    }.bind(self));
}











