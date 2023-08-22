function vecLen(vec) {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
}

function vecLenSub(vec, index) {
  return Math.sqrt(
    vec[index] * vec[index] +
      vec[++index] * vec[index] +
      vec[++index] * vec[index]
  );
}

export function normalize(vec) {
  const len = vecLen(vec);
  vec[0] /= len;
  vec[1] /= len;
  vec[2] /= len;
}

export function normalizeSub(vec, index) {
  const len = vecLenSub(vec, index);
  vec[index] /= len;
  vec[index + 1] /= len;
  vec[index + 2] /= len;
}

export class Vector3 extends Array {
  constructor() {
    super();
    this.length = 3;
    this[0] = this[1] = this[2] = 0;
  }

  let() {
    return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
  }

  get x() {
    return this[0];
  }

  set x(v) {
    this[0] = v;
    return v;
  }

  get y() {
    return this[1];
  }

  set y(v) {
    this[1] = v;
    return v;
  }

  get z() {
    return this[2];
  }

  set z(v) {
    this[2] = v;
    return v;
  }

  normalize() {
    const len = this.len();
    this[0] /= len;
    this[1] /= len;
    this[2] /= len;
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  translate(x, y, z) {
    this[0] += x;
    this[1] += y;
    this[2] += z;
  }

  toString() {
    return `vec3(${this[0]}, ${this[1]}, ${this[2]})`;
  }

  toArray() {
    return this;
  }
}
