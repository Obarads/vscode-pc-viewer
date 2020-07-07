
class Viewer {
    gui = new dat.GUI();
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    camera = new THREE.PerspectiveCamera(
        70, window.innerWidth / window.innerHeight, 0.1, 4000);
    monochrome = false;
    controls;
    points;
    axis;
    lastTime;

    constructor(loadPath, params, paramsGridHelper) {
        this.params = params
        this.paramsGridHelper = paramsGridHelper

        // GUI
        addOtherGui(this.gui, this.params)

        // define a scene
        this.scene.background = new THREE.Color(this.params.backgroundColor);

        // define a renderer
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // add an axis
        this.axis = addAxis(this.scene)

        // add grid helper
        if (this.paramsGridHelper.display) {
            this.gridHelper = addGridHelper(this.scene, this.paramsGridHelper.size,
                this.paramsGridHelper.divitions)
        }
        this.gridHelperFolder = addGuiFolder(this.gui, "GridHelper",
            this.paramsGridHelper)

        // check extension
        var ext = loadPath.split('.').pop().toLowerCase()
        if (ext == "ply") {
            addPly(this, loadPath)
        } else if (ext == "pcd") {
            addPcd(this, loadPath)
        } else if (ext == "bin") {
            addBin(this, loadPath)
        } else {
            console.log("Error: unknown extension.")
        }

        document.getElementById("view").appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        var time = Date.now();
        if (this.lastTime != time) {
            this.lastTime = time;
            this.updateGui()
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    initCamera() {
        this.modifyCoordinate()
        this.points.geometry.computeBoundingBox();
        if (this.params.viewPoint) {
            var middle = getCenterPoint(this.points.geometry);
            var camera_pos = getCameraPos(this.points.geometry, middle);
            // var camera_pos = new THREE.Vector3(1,0,1)
            this.camera.position.copy(camera_pos);
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target = middle;
        } else {
            var camera_pos = new THREE.Vector3(1.5,1.5,1.5);
            this.camera.position.copy(camera_pos);
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target = new THREE.Vector3(0,0,0);
        }
    }

    modifyCoordinate() {
        rotateGeometry(this.points.geometry, this.params.rotateCoordinate);
        reverseGeometry(this.points.geometry, this.params.reverseCoordinate);

        rotateGeometry(this.axis.geometry, this.params.rotateCoordinate);
        reverseGeometry(this.axis.geometry, this.params.reverseCoordinate);
    }

    updateGui() {
        this.points.material.size = this.params.pointSize;
        if (this.monochrome) {
            this.points.material.color = new THREE.Color(this.params.pointColor);
        }
        this.scene.background = new THREE.Color(this.params.backgroundColor);

        if (this.paramsGridHelper.display) {
            if (this.paramsGridHelper.size != this.gridHelper.size ||
                this.paramsGridHelper.divitions != this.gridHelper.divitions) {
                this.scene.remove(this.gridHelper);
                this.gridHelper = addGridHelper(
                    this.scene,
                    this.paramsGridHelper.size,
                    this.paramsGridHelper.divitions
                )
            }
        } else {
            this.scene.remove(this.gridHelper);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

}


var params = {
    pointSize: pointDefaultSize,
    pointMaxSize: pointMaxSize,
    backgroundColor: backgroundColor,
    pointColor: pointDefaultColor,
    reverseCoordinate: reverseCoordinate,
    rotateCoordinate: rotateCoordinate,
    viewPoint: viewPoint
}

var paramsGridHelper = {
    size: 1000,
    divitions: 2000,
    display: displayGridHelper
}

viewer = new Viewer(loadPath, params, paramsGridHelper)


