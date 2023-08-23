const vsSource = `
  attribute vec4 vPosition;
  attribute vec2 vTexture;

  uniform mat4 mModelViewProj;

  varying highp vec2 vTextureCoord;

  void main() {
    gl_Position = mModelViewProj * vPosition;
    vTextureCoord = vTexture;
  }
`;
const fsSource = `
  varying highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;

function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Failed to create GL shader.');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error('Failed to load shader.');
  }
  return shader;
}

function compileShader(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
): WebGLProgram {
  const vs = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();
  if (!program) {
    throw new Error('Failed to create GL program.');
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Failed to link program.');
  }
  return program;
}

const identityMatrix = mat4.create();

export class Program {
  private readonly gl: WebGLRenderingContext;
  private readonly programIndex: WebGLProgram;
  private readonly attributes: { position: number; texture: number };
  private readonly uniform: {
    modelViewProj: WebGLUniformLocation;
    texture: WebGLUniformLocation;
  };
  private readonly viewMatrix = mat4.create();
  private readonly mvpMatrix = mat4.create();
  private readonly vpMatrix = mat4.create();
  private projectionMatrix = identityMatrix;
  private matrixStack: mat4[] = [];
  private parentMatrix = mat4.create();

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;

    this.programIndex = compileShader(gl, vsSource, fsSource);
    this.attributes = {
      position: this.gl.getAttribLocation(this.programIndex, 'vPosition'),
      texture: this.gl.getAttribLocation(this.programIndex, 'vTexture'),
    };
    this.uniform = {
      modelViewProj: this.getUniformLocation('mModelViewProj'),
      texture: this.getUniformLocation('uSampler'),
    };
  }

  private getUniformLocation(name: string): WebGLUniformLocation {
    const location = this.gl.getUniformLocation(this.programIndex, name);
    if (!location) {
      throw new Error(`Failed to get uniform property '${name}' location.`);
    }
    return location;
  }

  activate() {
    this.gl.useProgram(this.programIndex);
  }

  pushMatrix(matrix: mat4) {
    this.matrixStack.push(matrix);
    mat4.multiply(this.parentMatrix, this.parentMatrix, matrix);
  }

  popMatrix() {
    const top = this.matrixStack.pop() as mat4;
    mat4.invert(top, top);
    mat4.multiply(this.parentMatrix, this.parentMatrix, top);
  }

  setModelMatrix(matrix: mat4) {
    mat4.multiply(this.mvpMatrix, this.vpMatrix, this.parentMatrix);
    mat4.multiply(this.mvpMatrix, this.mvpMatrix, matrix);
    this.gl.uniformMatrix4fv(this.uniform.modelViewProj, false, this.mvpMatrix);
  }

  setViewMatrix(matrix: mat4) {
    mat4.invert(this.viewMatrix, matrix);
    this.updateViewProjection();
  }

  setProjection(projection: mat4) {
    this.projectionMatrix = projection;
    this.updateViewProjection();
  }

  updateViewProjection() {
    mat4.multiply(this.vpMatrix, this.projectionMatrix, this.viewMatrix);
  }

  setTexture0(texture: WebGLTexture) {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(this.uniform.texture, 0);
  }

  setVertices(buffer: WebGLBuffer) {
    const components = 4;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 4 * 4 + 2 * 4; // vec4 * sizeof(float) + vec2 * sizeof(float)
    const offset = 0;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(
      this.attributes.position,
      components,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(this.attributes.position);
  }

  setTextureCoords(buffer: WebGLBuffer) {
    const components = 2;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 4 * 4 + 2 * 4;
    const offset = 4 * 4;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(
      this.attributes.texture,
      components,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(this.attributes.texture);
  }

  drawArray(offset: number, count: number) {
    this.gl.drawArrays(this.gl.TRIANGLES, offset, count);
  }
}
