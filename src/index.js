import { compileShader } from './shader.js';
import { mat4 } from './gl-matrix-min.js';
import { loadObject } from './resource-loader.js';
import { loadTexture } from './texture.js';

/**
 * @typedef {CompiledProgram}
 * @property {number} program
 * @property {{}} attributes
 * @property {{}} uniform
 */

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Array<number>} vertices
 * @returns {WebGLBuffer}
 */
function makeBuffer(gl, vertices) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return buffer;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {CompiledProgram} program
 * @param {number} buffer
 */
function setAttributeVert(gl, program, buffer) {
  const components = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 4 * 4 + 2 * 4;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    program.attributes.vertices,
    components,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(program.attributes.vertices);
}

function setAttributeTexCoord(gl, program, buffer) {
  const components = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 4 * 4 + 2 * 4;
  const offset = 4 * 4;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    program.attributes.textCoords,
    components,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(program.attributes.textCoords);
}

class Main {
  /** @type {WebGLRenderingContext} */
  gl;
  angle = 0;
  constructor() {}

  async init() {
    const object = await loadObject('./3d/Cottage_FREE.obj');

    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('canvas');
    this.gl = canvas.getContext('webgl');

    if (!this.gl) {
      throw new Error('WebGL initialization failed.');
    }

    const vsSource = `
      attribute vec4 vertexPos;
      attribute vec2 textCoords;
      uniform mat4 modelView;
      uniform mat4 projection;

      varying highp vec2 vTextureCoord;

      void main() {
        gl_Position = projection * modelView * vertexPos;
        vTextureCoord = textCoords;
      }
    `;
    const fsSource = `
      varying highp vec2 vTextureCoord;

      uniform sampler2D uSampler;

      void main() {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
      }
    `;

    const programId = compileShader(this.gl, vsSource, fsSource);
    const program = {
      program: programId,
      attributes: {
        vertexPos: this.gl.getAttribLocation(programId, 'vertexPos'),
        textCoords: this.gl.getAttribLocation(programId, 'textCoords'),
      },
      uniform: {
        modelView: this.gl.getUniformLocation(programId, 'modelView'),
        projection: this.gl.getUniformLocation(programId, 'projection'),
        texture: this.gl.getUniformLocation(programId, 'uSampler'),
      },
    };

    const texture = await loadTexture(this.gl, './3d/Cottage_Dirt_Base_Color.png');
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    for (const obj of object) {
      obj.bufferIndex = makeBuffer(this.gl, obj.buffer);
    }

    const frame = () => {
      this.angle++;
      this.clear();

      for (const obj of object) {
        this.draw(program, obj.bufferIndex, obj.buffer.length / 6, texture);
      }
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }

  clear() {
    this.gl.clearColor(0.2, 0.3, 0.5, 1);
    this.gl.clearDepth(1.0);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  /**
   *
   * @param {CompiledProgram} program
   * @param {number} buffer
   */
  draw(program, buffer, vertexCount, texture) {
    const fov = (45 * Math.PI) / 180;
    const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 1000.0;
    const projection = mat4.create();

    mat4.perspective(projection, fov, aspect, zNear, zFar);

    const modelView = mat4.create();
    mat4.translate(modelView, modelView, [0, -0, -20]);
    mat4.rotateX(modelView, modelView, (20 / 180) * Math.PI);
    mat4.rotateY(modelView, modelView, (this.angle / 180) * Math.PI);

    setAttributeVert(this.gl, program, buffer);
    setAttributeTexCoord(this.gl, program, buffer);
    this.gl.useProgram(program.program);

    this.gl.uniformMatrix4fv(program.uniform.projection, false, projection);
    this.gl.uniformMatrix4fv(program.uniform.modelView, false, modelView);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(program.uniform.texture, 0);

    const offset = 0;
    this.gl.drawArrays(this.gl.TRIANGLES, offset, vertexCount);
  }
}

const main = new Main();
main.init();
