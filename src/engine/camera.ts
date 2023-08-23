import { Entity } from './entity';

export class Camera extends Entity {
  public readonly projection: mat4;

  constructor(gl: WebGLRenderingContext) {
    super();
    const fov = (45 * Math.PI) / 180;
    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 0.1;
    const zFar = 1000.0;
    const projection = mat4.create();

    mat4.perspective(projection, fov, aspect, zNear, zFar);
    this.projection = projection;
  }
}
