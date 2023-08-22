const vsSource = `
  attribute vec4 vertexPos;
  attribute vec2 texCoords;

  uniform mat4 modelView;
  uniform mat4 projection;

  varying highp vec2 vTextureCoord;

  void main() {
    gl_Position = projection * modelView * vertexPos;
    vTextureCoord = texCoords;
  }
`;
const fsSource = `
  varying highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} source
 */
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error('Failed to load shader.');
  }
  return shader;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} vsSource
 * @param {string} fsSource
 */
function compileShader(gl, vsSource, fsSource) {
  const vs = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Failed to link program.');
  }
  return program;
}

export class Program {
  /**
   * @type {WebGLRenderingContext}
   */
  gl;
  programIndex;
  attributes;
  uniform;
  /**
   *
   * @param {WebGLRenderingContext} gl
   */
  constructor(gl) {
    this.gl = gl;

    this.programIndex = compileShader(gl, vsSource, fsSource);
    this.attributes = {
      vertexPos: this.gl.getAttribLocation(this.programIndex, 'vertexPos'),
      texCoords: this.gl.getAttribLocation(this.programIndex, 'texCoords'),
    };
    this.uniform = {
      modelView: this.gl.getUniformLocation(this.programIndex, 'modelView'),
      projection: this.gl.getUniformLocation(this.programIndex, 'projection'),
      texture: this.gl.getUniformLocation(this.programIndex, 'uSampler'),
    };
  }

  activate() {
    this.gl.useProgram(this.programIndex);
  }

  setModelView(modelView) {
    this.gl.uniformMatrix4fv(this.uniform.modelView, false, modelView);
  }

  setProjection(projection) {
    this.gl.uniformMatrix4fv(this.uniform.projection, false, projection);
  }

  /**
   * @param {WebGLTexture} texture
   */
  setTexture0(texture) {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(this.uniform.texture, 0);
  }

  /**
   * @param {WebGLBuffer} buffer
   */
  setVertices(buffer) {
    const components = 4;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 4 * 4 + 2 * 4; // vec4 * sizeof(float) + vec2 * sizeof(float)
    const offset = 0;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(
      this.attributes.vertices,
      components,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(this.attributes.vertices);
  }

  /**
   * @param {WebGLBuffer} buffer
   */
  setTextureCoords(buffer) {
    const components = 2;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 4 * 4 + 2 * 4;
    const offset = 4 * 4;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(
      this.attributes.texCoords,
      components,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(this.attributes.texCoords);
  }

  drawArray(offset, count) {
    this.gl.drawArrays(this.gl.TRIANGLES, offset, count);
  }
}
