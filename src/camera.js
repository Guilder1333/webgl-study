export class Camera {
  /**
   * @type {mat4}
   */
  projection;

  /**
   * @param {WebGLRenderingContext} gl
   */
  constructor(gl) {
    const fov = (45 * Math.PI) / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 1000.0;
    const projection = mat4.create();

    mat4.perspective(projection, fov, aspect, zNear, zFar);
    console.log(projection);
    this.projection = projection;
  }
}
