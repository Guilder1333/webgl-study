const factor = Math.PI / 180;

/**
 * Represents rotation in degrees.
 */
export class Rotator {
  /**
   * @type {number}
   */
  x = 0;
  /**
   * @type {number}
   */
  y = 0;
  /**
   * @type {number}
   */
  z = 0;

  rotate(x: number, y: number, z: number) {
    this.x += x;
    this.y += y;
    this.z += z;
  }

  rotateX(x: number) {
    this.x += x;
  }

  rotateY(y: number) {
    this.y += y;
  }

  rotateZ(z: number) {
    this.z += z;
  }

  radX() {
    return this.x * factor;
  }

  radY() {
    return this.y * factor;
  }

  radZ() {
    return this.z * factor;
  }

  toString() {
    return `rot(${this.x}, ${this.y}, ${this.z})`;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  toRadArray() {
    return [this.x * factor, this.y * factor, this.z * factor];
  }
}
