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
