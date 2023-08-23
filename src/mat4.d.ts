declare class mat4 extends Float32Array {
  static create(): mat4;
  static clone(a: mat4): mat4;
  static translate(out: mat4, a: mat4, v: ReadonlyArray<number>): void;
  static rotateX(out: mat4, a: mat4, v: number): void;
  static rotateY(out: mat4, a: mat4, v: number): void;
  static rotateZ(out: mat4, a: mat4, v: number): void;
  static invert(out: mat4, a: mat4): void;
  static multiply(out: mat4, a: mat4, b: mat4): void;
  static perspective(
    out: mat4,
    fov: number,
    aspect: number,
    zNear: number,
    zFar: number
  ): void;
}
