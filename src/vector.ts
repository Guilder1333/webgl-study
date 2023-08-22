function vecLen(vec: number[]) {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
}

function vecLenSub(vec: number[], index: number) {
  return Math.sqrt(
    vec[index] * vec[index] +
      vec[++index] * vec[index] +
      vec[++index] * vec[index]
  );
}

export function normalize(vec: number[]) {
  const len = vecLen(vec);
  vec[0] /= len;
  vec[1] /= len;
  vec[2] /= len;
}

export function normalizeSub(vec: number[], index: number) {
  const len = vecLenSub(vec, index);
  vec[index] /= len;
  vec[index + 1] /= len;
  vec[index + 2] /= len;
}

export class Vector3 extends Array<number> {
  constructor() {
    super();
    this.length = 3;
    this[0] = this[1] = this[2] = 0;
  }

  len(): number {
    return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
  }

  get x(): number {
    return this[0];
  }

  set x(v: number) {
    this[0] = v;
  }

  get y(): number {
    return this[1];
  }

  set y(v: number) {
    this[1] = v;
  }

  get z(): number {
    return this[2];
  }

  set z(v: number) {
    this[2] = v;
  }

  normalize() {
    const len = this.len();
    this[0] /= len;
    this[1] /= len;
    this[2] /= len;
  }

  translate(x: number, y: number, z: number) {
    this[0] += x;
    this[1] += y;
    this[2] += z;
  }

  toString(): string {
    return `vec3(${this[0]}, ${this[1]}, ${this[2]})`;
  }

  toArray(): number[] {
    return this;
  }
}
