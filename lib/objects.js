class AxesViewer
{
    viewerWidth = 150;
    viewerHeight = 150;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    camera = new THREE.PerspectiveCamera(
        50,
        this.viewerWidth / this.viewerHeight,
        1,
        1000
    );
    scene = new THREE.Scene();
    axesHelper = new THREE.AxesHelper(100); // axes object
    container = document.getElementById("axes");

    constructor(camera_up)
    {
        /**
         * camera_up: THREE.PerspectiveCamera(...).up
         */

        // Renderer setup
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(this.viewerWidth, this.viewerHeight);
        this.container.appendChild(this.renderer.domElement);

        // Camera setup
        this.camera.up = camera_up;

        // Axes setup
        this.scene.add(this.axesHelper);
    }

    animate(camera_position, control_target)
    {
        /**
         * camera_position: THREE.PerspectiveCamera(...).position
         * control_target: THREE.OrbitControls(...).target
         */

        // camera update
        this.camera.position.copy(camera_position);
        this.camera.position.sub(control_target);
        this.camera.position.setLength(300);
        this.camera.lookAt(this.scene.position);

        // renderer update
        this.renderer.render(this.scene, this.camera);
    }
}

function GridHelperParams(grid_size, auto_grid_size, display)
{
    /**
     * Grid Helper parameters in MainViewer (this.ghParams)
     *
     * Args:
     *  grid_size (Array): gird size on axis xyz
     *  auto_grid_size (Bool): auto grid size
     *  display (Bool): wheater or not to display grid helper
     */

    // from Args params
    this.grid_size_x = grid_size[0];
    this.grid_size_y = grid_size[1];
    this.grid_size_z = grid_size[2];
    this.auto_grid_size = auto_grid_size;
    this.display = display;

    // other params
    this.sign = { x: 1, y: 1, z: 1 };
    this.display_previous_flag = display;
    this.grid_helper_number = false;
    this.previous_grid_size_x = this.grid_size_x;
    this.previous_grid_size_y = this.grid_size_y;
    this.previous_grid_size_z = this.grid_size_z;
    return this;
}

function OtherParams(
    reverseCoordinate,
    rotateCoordinate,
    backgroundColor,
    viewPoint
)
{
    /**
     * Interface
     * Args:
     *  reverseCoordinate (array): Whether or not to reverse the coordinate system. (pc viewer.reverse Coordinate)
     *  rotateCoordinate (array): How much to rotate the coordinate system. (pcviewer.rotateCoordinate) (degree)
     *  backgroundColor (str): background color. (pcviewer.backgroundColor)
     *  viewPoint (bool): Auto viewpoint feature.
     */
    this.reverseCoordinate = reverseCoordinate;
    this.rotateCoordinate = rotateCoordinate;
    this.backgroundColor = backgroundColor;
    this.viewPoint = viewPoint;
    return this;
}

function PointCloudParams(pointSize, pointMaxSize, pointColor)
{
    /**
     * Interface
     * Args:
     *  pointSize (Number): (pcviewer.pointDefaultSize)
     *  pointMaxSize (Number): for GUI bar (pcviewer.pointMaxSize)
     *  pointColor (str): (pcviewer.pointDefaultColor)
     */
    this.pointSize = pointSize;
    this.pointMaxSize = pointMaxSize;
    this.pointColor = pointColor;
    this.display_mesh = false;
    return this;
}

var dataToPointCloud = {
    ply: [new THREE.PLYLoader(), ply],
    pcd: [new THREE.PCDLoader(), pcd],
    bin: [createBinLoader(), bin],
    obj: [new THREE.OBJLoader(), obj],
    xyz: [new THREE.XYZLoader(), xyz],
};

class MainViewer
{
    gui = new dat.GUI();
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        4000
    );
    monochrome = false;
    lastTime = 0;
    points; // point cloud object
    axesHelper;

    constructor(loadPath, pcParams, ghParams, oParams)
    {
        /**
         * pcParams: PointCloudParams(...)
         * ghParams: GridHelperParams(...)
         * oParams: OtherParams(...)
         */
        this.pcParams = pcParams;
        this.ghParams = ghParams; // update ghParams on this.setupGridHelper()
        this.oParams = oParams;

        this.setupRenderer();
        this.setupAxesHelper(this.camera.up);
        this.setupPointCloud(loadPath);
        document.getElementById("view").appendChild(this.renderer.domElement);
        window.addEventListener(
            "resize",
            this.onWindowResize.bind(this),
            false
        );
    }

    setupRenderer()
    {
        /**
         * Renderer setup: resize window size
         */
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupScene(backgroundColor)
    {
        /**
         * Scene setup: set backgournd color
         */
        this.scene.background = new THREE.Color(backgroundColor);
    }

    setupPointCloud(loadPath)
    {
        /**
         * PointCloud setup: check extension, load data and get max and min coords.
         */
        const dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(-0, 40, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = -25;
        dirLight.shadow.camera.left = -25;
        dirLight.shadow.camera.right = 25;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 200;
        dirLight.shadow.mapSize.set(1024, 1024);
        this.scene.add(dirLight);

        var self = this;
        var ext = loadPath.split(".").pop().toLowerCase();
        if (dataToPointCloud[ext])
        {
            var dtpc = dataToPointCloud[ext];
            var loader = dtpc[0];
            var converter = dtpc[1];
            loader.load(loadPath, function (data)
            {
                // get data
                const results = converter(data);
                const point_cloud = results[0];
                const withColor = results[1];
                const mesh = results[2];

                // add points into scene
                point_cloud.name = fileName(loadPath);
                self.points = point_cloud;
                self.points.geometry.computeBoundingBox();
                self.monochrome = !withColor;
                self.scene.add(self.points);

                // define a mesh object
                self.mesh = mesh;

                // post-processing
                self.postProcessPointCloud();
            });
        } else
        {
            console.log("Error: unknown extension.");
        }
    }

    postProcessPointCloud()
    {
        // setup viwer with point cloud data
        this.modifyCoordinate();
        this.setupGridHelper();
        this.setupGUI();

        // setup viewer
        this.initCamera();
        this.animate();
    }

    setupGridHelper()
    {
        /**
         * GridHelper setup: create grid helper
         */

        // get max and min coord in the point cloud.
        var boundingBox = this.points.geometry.boundingBox;

        // compute grid size and get new divitions and size.
        if (this.ghParams.auto_grid_size)
        {
            var x_setting = computeGridSettings(
                boundingBox.min.x,
                boundingBox.max.x
            );
            var x_size = x_setting[0];
            var x_divitions = x_setting[1];
            var x_grid_size = x_setting[2];

            var y_setting = computeGridSettings(
                boundingBox.min.y,
                boundingBox.max.y
            );
            var y_size = y_setting[0];
            var y_divitions = y_setting[1];
            var y_grid_size = y_setting[2];

            var z_setting = computeGridSettings(
                boundingBox.min.z,
                boundingBox.max.z
            );
            var z_size = z_setting[0];
            var z_divitions = z_setting[1];
            var z_grid_size = z_setting[2];

            this.ghParams.auto_grid_size = false;
            this.ghParams.grid_size_x = x_grid_size;
            this.ghParams.grid_size_y = y_grid_size;
            this.ghParams.grid_size_z = z_grid_size;
        } else
        {
            var minmax_x_size = boundingBox.max.x - boundingBox.min.x;
            var x_grid_size = this.ghParams.grid_size_x;
            var x_divitions = Math.ceil(minmax_x_size / x_grid_size);
            var x_size = x_grid_size * x_divitions;

            var minmax_y_size = boundingBox.max.y - boundingBox.min.y;
            var y_grid_size = this.ghParams.grid_size_y;
            var y_divitions = Math.ceil(minmax_y_size / y_grid_size);
            var y_size = y_grid_size * y_divitions;

            var minmax_z_size = boundingBox.max.z - boundingBox.min.z;
            var z_grid_size = this.ghParams.grid_size_z;
            var z_divitions = Math.ceil(minmax_z_size / z_grid_size);
            var z_size = z_grid_size * z_divitions;
        }

        // translate the point cloud for new gridhelper
        var td_grid_size = new THREE.Vector3(
            x_grid_size,
            y_grid_size,
            z_grid_size
        );
        var center = getCenterPoint(this.points.geometry);
        var new_center = center
            .divide(td_grid_size)
            .round()
            .multiply(td_grid_size);
        this.points.geometry.translate(
            -new_center.x,
            -new_center.y,
            -new_center.z
        );

        // add new gridHelpers
        // var XYGridHelper = new TDGridHelper(y_size, y_divitions, x_size, x_divitions);
        var XYGridHelper = createTDGridHelperWithText(
            y_size,
            y_divitions,
            x_size,
            x_divitions,
            (grid_helper_number = this.ghParams.grid_helper_number)
        );
        XYGridHelper.name = "XY grid helper";
        XYGridHelper.rotation.x = Math.PI / 2;
        XYGridHelper.position.z = z_size / 2;
        this.XYGridHelper = XYGridHelper;
        this.scene.add(this.XYGridHelper);

        var YZGridHelper = new createTDGridHelperWithText(
            z_size,
            z_divitions,
            y_size,
            y_divitions,
            (grid_helper_number = this.ghParams.grid_helper_number)
        );
        YZGridHelper.name = "YZ grid helper";
        YZGridHelper.rotation.z = Math.PI / 2;
        YZGridHelper.position.x = x_size / 2;
        this.YZGridHelper = YZGridHelper;
        this.scene.add(this.YZGridHelper);

        var ZXGridHelper = new createTDGridHelperWithText(
            z_size,
            z_divitions,
            x_size,
            x_divitions,
            (grid_helper_number = this.ghParams.grid_helper_number)
        );
        ZXGridHelper.name = "ZX grid helper";
        ZXGridHelper.position.y = -y_size / 2;
        this.ZXGridHelper = ZXGridHelper;
        this.scene.add(this.ZXGridHelper);

        // update ghParams
        // TODO: modify ghParams and GridHelperParams function
        // sign: for grid helper position
        this.ghParams.sign.x = Math.sign(this.YZGridHelper.position.x);
        this.ghParams.sign.y = Math.sign(this.ZXGridHelper.position.y);
        this.ghParams.sign.z = Math.sign(this.XYGridHelper.position.z);
        this.ghParams.x_relative_dist = Math.abs(this.YZGridHelper.position.x);
        this.ghParams.y_relative_dist = Math.abs(this.ZXGridHelper.position.y);
        this.ghParams.z_relative_dist = Math.abs(this.XYGridHelper.position.z);
        this.ghParams.previous_grid_size_x = this.ghParams.grid_size_x;
        this.ghParams.previous_grid_size_y = this.ghParams.grid_size_y;
        this.ghParams.previous_grid_size_z = this.ghParams.grid_size_z;
    }

    setupGUI()
    {
        /**
         * GUI setup: add params.
         */
        // Point cloud GUI
        this.gui
            .add(this.pcParams, "pointSize")
            .min(0)
            .max(20)
            .max(this.pcParams.pointMaxSize);
        this.gui.addColor(this.pcParams, "backgroundColor");
        this.gui.addColor(this.pcParams, "pointColor");
        this.gui.add(this.pcParams, "display_mesh");

        // GridHelper GUI
        const gridHelperGUI = this.gui.addFolder("GridHelper");
        gridHelperGUI.add(this.ghParams, "display");
        gridHelperGUI.add(this.ghParams, "grid_size_x", 0.01);
        gridHelperGUI.add(this.ghParams, "grid_size_y", 0.01);
        gridHelperGUI.add(this.ghParams, "grid_size_z", 0.01);
        gridHelperGUI.add(this.ghParams, "x_relative_dist").min(0);
        gridHelperGUI.add(this.ghParams, "y_relative_dist").min(0);
        gridHelperGUI.add(this.ghParams, "z_relative_dist").min(0);
    }

    setupAxesHelper(camera_up)
    {
        this.axesHelper = new AxesViewer(camera_up);
    }

    animate()
    {
        // camera update
        requestAnimationFrame(this.animate.bind(this));

        // GUI update
        var time = Date.now();
        if (this.lastTime != time)
        {
            this.lastTime = time;
            this.updateGui();
        }

        // controls update
        this.controls.update();

        // renderer update
        this.renderer.render(this.scene, this.camera);

        // Axes window update
        this.axesHelper.animate(this.camera.position, this.controls.target);

        // update GridHelper
        var x_normal = this.ghParams.sign.x;
        var y_normal = this.ghParams.sign.y;
        var z_normal = this.ghParams.sign.z;
        var camera_direction = new THREE.Vector3(0, 0, 0);
        this.camera.getWorldDirection(camera_direction);
        if (camera_direction.dot(new THREE.Vector3(0, 0, z_normal)) < 0)
        {
            this.ghParams.sign.z = z_normal * -1;
        }
        if (camera_direction.dot(new THREE.Vector3(x_normal, 0, 0)) < 0)
        {
            this.ghParams.sign.x = x_normal * -1;
        }
        if (camera_direction.dot(new THREE.Vector3(0, y_normal, 0)) < 0)
        {
            this.ghParams.sign.y = y_normal * -1;
        }
        this.XYGridHelper.position.z =
            this.ghParams.z_relative_dist * this.ghParams.sign.z;
        this.YZGridHelper.position.x =
            this.ghParams.x_relative_dist * this.ghParams.sign.x;
        this.ZXGridHelper.position.y =
            this.ghParams.y_relative_dist * this.ghParams.sign.y;
    }

    initCamera()
    {
        this.points.geometry.computeBoundingBox();
        if (this.oParams.viewPoint)
        {
            var middle = getCenterPoint(this.points.geometry);
            var camera_pos = getCameraPos(this.points.geometry, middle);
            // var camera_pos = new THREE.Vector3(1,0,1)
            this.camera.position.copy(camera_pos);
            this.controls = new THREE.OrbitControls(
                this.camera,
                this.renderer.domElement
            );
            this.controls.target = middle;
        } else
        {
            var camera_pos = new THREE.Vector3(1.5, 1.5, 1.5);
            this.camera.position.copy(camera_pos);
            this.controls = new THREE.OrbitControls(
                this.camera,
                this.renderer.domElement
            );
            this.controls.target = new THREE.Vector3(0, 0, 0);
        }
    }

    modifyCoordinate()
    {
        // point cloud rotation
        this.points.geometry.rotateX(
            (Math.PI * this.oParams.rotateCoordinate[0]) / 180
        );
        this.points.geometry.rotateY(
            (Math.PI * this.oParams.rotateCoordinate[1]) / 180
        );
        this.points.geometry.rotateZ(
            (Math.PI * this.oParams.rotateCoordinate[2]) / 180
        );

        // rotateGeometry(this.points.geometry, this.oParams.rotateCoordinate);
        // reverseGeometry(this.points.geometry, this.oParams.reverseCoordinate);
    }

    onWindowResize()
    {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateGui()
    {
        // pcParams
        this.points.material.size = this.pcParams.pointSize;
        if (this.monochrome)
        {
            this.points.material.color = new THREE.Color(
                this.pcParams.pointColor
            );
        }
        if (this.mesh !== null)
        {
            const mesh_obj = this.scene.getObjectByName("mesh");
            if (this.pcParams.display_mesh)
            {
                if (mesh_obj === undefined)
                {
                    this.scene.add(this.mesh);
                }
            } else
            {
                if (mesh_obj !== undefined)
                {
                    this.scene.remove(this.mesh);
                }
            }
        }

        // other params
        this.scene.background = new THREE.Color(this.oParams.backgroundColor);

        // gridHelper params
        if (this.ghParams.display)
        {
            if (this.ghParams.display !== this.ghParams.display_previous_flag)
            {
                this.scene.add(this.XYGridHelper);
                this.scene.add(this.YZGridHelper);
                this.scene.add(this.ZXGridHelper);
            }
            if (
                this.ghParams.grid_size_x !=
                this.ghParams.previous_grid_size_x ||
                this.ghParams.grid_size_y !=
                this.ghParams.previous_grid_size_y ||
                this.ghParams.grid_size_z != this.ghParams.previous_grid_size_z
            )
            {
                this.scene.remove(this.XYGridHelper);
                this.scene.remove(this.YZGridHelper);
                this.scene.remove(this.ZXGridHelper);
                this.setupGridHelper();
            }
        } else
        {
            this.scene.remove(this.XYGridHelper);
            this.scene.remove(this.YZGridHelper);
            this.scene.remove(this.ZXGridHelper);
        }
        if (this.ghParams.grid_helper_number)
        {
            for (let i = 1; i < this.XYGridHelper.children.length; i++)
            {
                this.XYGridHelper.children[i].lookAt(this.camera.position);
            }
            for (let i = 1; i < this.YZGridHelper.children.length; i++)
            {
                this.YZGridHelper.children[i].lookAt(this.camera.position);
            }
            for (let i = 1; i < this.ZXGridHelper.children.length; i++)
            {
                this.ZXGridHelper.children[i].lookAt(this.camera.position);
            }
        }
        this.ghParams.display_previous_flag = this.ghParams.display;
    }
}

function fileName(url)
{
    var name = url.split("").reverse().join("");
    name = /([^\/]*)/.exec(name);
    name = name[1].split("").reverse().join("");
    return name;
}

function ply(geometry)
{
    // define a point cloud object
    var pointsMaterial = new THREE.PointsMaterial();
    var withColor = false;
    if (geometry.hasAttribute("color"))
    {
        pointsMaterial.vertexColors = true;
        withColor = true;
    }
    const points = new THREE.Points(geometry, pointsMaterial);

    // define a mesh object
    // const meshMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const meshMaterial = new THREE.MeshNormalMaterial({ flatShading: true });
    var mesh = new THREE.Mesh(geometry, meshMaterial);
    mesh.name = "mesh";

    return [points, withColor, mesh];
}

function pcd(points)
{
    // define a point cloud object
    var withColor = true;
    if (points.material.vertexColors == false)
    {
        withColor = false;
    }
    return [points, withColor, null];
}

function createBinLoader()
{
    const loader = new THREE.FileLoader()
    loader.setResponseType( 'arraybuffer' );
    return loader
}

function bin(points)
{
    // get points
    var vertices = [];
    points = new Float32Array(points);
    console.log(points)
    var numPoints = points.length / 4;
    for (i = 0; i < numPoints; i++)
    {
        x = points[i * 4];
        y = points[i * 4 + 1];
        z = points[i * 4 + 2];
        vertices.push(x, y, z);
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
    );

    // define a point cloud object
    var material = new THREE.PointsMaterial();
    var points = new THREE.Points(geometry, material);
    var withColor = false;

    console.log(vertices)

    return [points, withColor, null];
}

function obj(group)
{
    const data = group.children[0]
    var withColor = false;
    var points = null;
    var mesh = null;

    if (data.type === "Points")
    {
        // define a point cloud object
        points = data;
    } else if (data.type === "Mesh")
    {
        // define a point cloud object
        var pointsMaterial = new THREE.PointsMaterial();
        if (data.geometry.hasAttribute("color"))
        {
            pointsMaterial.vertexColors = true;
            withColor = true;
        }
        points = new THREE.Points(data.geometry, pointsMaterial);

        // define a mesh object
        mesh = data;
        mesh.name = "mesh";
    } else {
        console.log("Error: unknown obj format.");
    }

    return [points, withColor, mesh];
}

function xyz(geometry)
{
    // define a point cloud object
    var pointsMaterial = new THREE.PointsMaterial();
    var withColor = false;
    if (geometry.hasAttribute("color"))
    {
        pointsMaterial.vertexColors = true;
        withColor = true;
    }
    const points = new THREE.Points(geometry, pointsMaterial);

    return [points, withColor, null];
}


function getCenterPoint(geometry)
{
    var middle = new THREE.Vector3();

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    return middle;
}

function getCameraPos(geometry, middle)
{
    var camera_pos = new THREE.Vector3();

    camera_pos.x =
        (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
    camera_pos.y =
        (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;
    camera_pos.z =
        (geometry.boundingBox.max.z - geometry.boundingBox.min.z) / 2;

    camera_pos.add(middle);
    camera_pos.multiplyScalar(1);

    return camera_pos;
}

function computeGridSettings(min_coord, max_coord)
{
    var divitions = 10;
    var size = max_coord - min_coord;
    var exponential_notation = (size / divitions).toExponential();
    var digits = exponential_notation.split("e")[1];
    var number_in_digits = exponential_notation[0];
    var grid_size;
    if (digits[0] == "+")
    {
        if (digits[1] == "0")
        {
            grid_size = Number(number_in_digits);
        } else
        {
            grid_size = Number(
                number_in_digits + "0".repeat(Number(digits.slice(1)))
            );
        }
    } else
    {
        grid_size = Number(
            "0." + "0".repeat(Number(digits.slice(1)) - 1) + number_in_digits
        );
    }

    var new_divitions = Math.ceil(size / grid_size);
    if (new_divitions % 2 == 0)
    {
        // add Redundant space
        new_size = new_divitions * grid_size;
    } else
    {
        new_size = (new_divitions + 1) * grid_size;
        new_divitions += 1;
    }

    return [new_size, new_divitions, grid_size];
}

viewer = new MainViewer(
    loadPath,
    PointCloudParams(pointDefaultSize, pointMaxSize, pointDefaultColor),
    GridHelperParams(gridSize, autoGridSize, displayGridHelper),
    OtherParams(reverseCoordinate, rotateCoordinate, backgroundColor, viewPoint)
);
