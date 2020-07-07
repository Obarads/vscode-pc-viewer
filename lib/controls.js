
function rotateGeometry(geometry, params) {
    geometry.rotateX(Math.PI * params[0] / 180);
    geometry.rotateY(Math.PI * params[1] / 180);
    geometry.rotateZ(Math.PI * params[2] / 180);
}

function reverseGeometry(geometry, params) {
    var sx = 1;
    var sy = 1;
    var sz = 1;
    if(params[0]){sx = -1};
    if(params[1]){sy = -1};
    if(params[2]){sz = -1};
    geometry.scale(sx, sy, sz);
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
    camera_pos.multiplyScalar(1);

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
