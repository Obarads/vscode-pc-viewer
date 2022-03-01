class PCGridHelper extends THREE.LineSegments {

    constructor(size = 10, divisions = 10, color1 = 0x444444, color2 = 0x888888) {

        color1 = new THREE.Color(color1);
        color2 = new THREE.Color(color2);

        const center = divisions / 2;
        const step = size / divisions;
        const halfSize = size / 2;

        const vertices = [], colors = [];

        for (let i = 0, j = 0, k = - halfSize; i <= divisions; i++, k += step) {

            vertices.push(- halfSize, 0, k, halfSize, 0, k);
            vertices.push(k, 0, - halfSize, k, 0, halfSize);

            const color = i === center ? color1 : color2;

            color.toArray(colors, j); j += 3;
            color.toArray(colors, j); j += 3;
            color.toArray(colors, j); j += 3;
            color.toArray(colors, j); j += 3;

        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false });

        super(geometry, material);

        this.type = 'GridHelper';

    }

}

class TDGridHelper extends THREE.LineSegments {

    constructor(x_size, x_divisions, y_size, y_divisions, color1 = 0x444444, color2 = 0x888888) {

        color1 = new THREE.Color(color1);
        color2 = new THREE.Color(color2);

        const x_center = x_divisions / 2;
        const x_step = x_size / x_divisions;
        const x_halfSize = x_size / 2;

        const y_center = y_divisions / 2;
        const y_step = y_size / y_divisions;
        const y_halfSize = y_size / 2;

        const vertices = [], colors = [];
        for (let i = 0, j = 0, xk = - x_halfSize, yk = -y_halfSize; i <= x_divisions || i <= y_divisions; i++) {
            if (i <= x_divisions) {
                vertices.push(-y_halfSize, 0, xk, y_halfSize, 0, xk);
                xk += x_step;
                const color = i === x_center ? color1 : color2;
                color.toArray(colors, j); j += 3;
                color.toArray(colors, j); j += 3;
            }

            if (i <= y_divisions) {
                vertices.push(yk, 0, -x_halfSize, yk, 0, x_halfSize);
                yk += y_step;
                const color = i === y_center ? color1 : color2;
                color.toArray(colors, j); j += 3;
                color.toArray(colors, j); j += 3;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false });

        super(geometry, material);

        this.type = 'GridHelper';
    }

}