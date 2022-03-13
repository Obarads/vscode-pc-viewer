class PCGridHelper extends THREE.LineSegments {
    constructor(
        size = 10,
        divisions = 10,
        color1 = 0x444444,
        color2 = 0x888888
    ) {
        color1 = new THREE.Color(color1);
        color2 = new THREE.Color(color2);

        const center = divisions / 2;
        const step = size / divisions;
        const halfSize = size / 2;

        const vertices = [],
            colors = [];

        for (let i = 0, j = 0, k = -halfSize; i <= divisions; i++, k += step) {
            vertices.push(-halfSize, 0, k, halfSize, 0, k);
            vertices.push(k, 0, -halfSize, k, 0, halfSize);

            const color = i === center ? color1 : color2;

            color.toArray(colors, j);
            j += 3;
            color.toArray(colors, j);
            j += 3;
            color.toArray(colors, j);
            j += 3;
            color.toArray(colors, j);
            j += 3;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(colors, 3)
        );

        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            toneMapped: false,
        });

        super(geometry, material);

        this.type = "GridHelper";
    }
}

class TDGridHelper extends THREE.LineSegments {
    vertices = [];
    axis_flags = [];
    max_xy = [];

    constructor(
        x_size,
        x_divisions,
        y_size,
        y_divisions,
        color1 = 0xff4040,
        color2 = 0x888888
    ) {
        color1 = new THREE.Color(color1);
        color2 = new THREE.Color(color2);

        const x_center = x_divisions / 2;
        const x_step = x_size / x_divisions;
        const x_halfSize = x_size / 2;

        const y_center = y_divisions / 2;
        const y_step = y_size / y_divisions;
        const y_halfSize = y_size / 2;

        const vertices = [],
            colors = [],
            axis_flags = [];
        for (
            let i = 0, j = 0, xk = -x_halfSize, yk = -y_halfSize;
            i <= x_divisions || i <= y_divisions;
            i++
        ) {
            if (i <= x_divisions) {
                vertices.push(-y_halfSize, 0, xk, y_halfSize, 0, xk);
                axis_flags.push("x");
                xk += x_step;
                const color = i === x_center ? color1 : color2;
                color.toArray(colors, j);
                j += 3;
                color.toArray(colors, j);
                j += 3;
            }

            if (i <= y_divisions) {
                vertices.push(yk, 0, -x_halfSize, yk, 0, x_halfSize);
                axis_flags.push("y");
                yk += y_step;
                const color = i === y_center ? color1 : color2;
                color.toArray(colors, j);
                j += 3;
                color.toArray(colors, j);
                j += 3;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(colors, 3)
        );
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            toneMapped: false,
        });

        super(geometry, material);

        this.type = "GridHelper";
        this.vertices = vertices;
        this.axis_flags = axis_flags;
        this.max_xy = [x_halfSize, y_halfSize];
    }
}

function createTDGridHelperWithText(
    x_size,
    x_divisions,
    y_size,
    y_divisions,
    grid_helper_number = false,
    color1 = 0xff4040,
    color2 = 0x888888
) {
    /** create GridHelper with text
     */

    const group = new THREE.Group();

    const gridhelper = new TDGridHelper(
        x_size,
        x_divisions,
        y_size,
        y_divisions,
        color1,
        color2
    );
    group.add(gridhelper);

    if (grid_helper_number) {
        const loader = new THREE.FontLoader();
        loader.load(fontjson_path, function (font) {
            const color = 0xffffff;
            const matLite = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1,
                side: THREE.DoubleSide,
            });

            const vertices = gridhelper.vertices;
            const axis_flags = gridhelper.axis_flags;
            const max_xy = gridhelper.max_xy;
            const num_edge = vertices.length / 6;
            console.log(vertices);
            for (let i = 0; i < num_edge; i++) {
                const x = vertices[i * 6 + 5];
                const y = vertices[i * 6 + 3];

                var message = "";
                if (axis_flags[i] == "x") {
                    if (Math.abs(x) !== max_xy[0]) {
                        message = x.toString();
                    }
                } else {
                    if (Math.abs(y) !== max_xy[1]) {
                        message = y.toString();
                    }
                }

                const shapes = font.generateShapes(message, 2);
                const geometry = new THREE.ShapeGeometry(shapes);
                geometry.computeBoundingBox();
                const xMid =
                    -0.5 *
                    (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                geometry.translate(xMid, 0, 0);

                const text = new THREE.Mesh(geometry, matLite);
                text.position.x = y;
                text.position.z = x;
                text.axis_flag = axis_flags[i];

                group.add(text);
            }
        }); //end load function
    }

    return group;
}
