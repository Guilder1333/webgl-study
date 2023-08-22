import { loadObject } from './resource-loader.js';
import { Camera } from './camera.js';
import { Program } from './program.js';
import { Model } from './model.js';

/**
 * @typedef {CompiledProgram}
 * @property {number} program
 * @property {{}} attributes
 * @property {{}} uniform
 */

class Main {
  /** @type {WebGLRenderingContext} */
  gl;
  angle = 0;
  /**
   * @type {Program}
   */
  program;
  /**
   * @type {Camera}
   */
  camera;
  constructor() {}

  async init() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('canvas');
    this.gl = canvas.getContext('webgl');

    if (!this.gl) {
      throw new Error('WebGL initialization failed.');
    }

    this.program = new Program(this.gl);
    this.program.activate();

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.camera = new Camera(this.gl);

    const house = new Model();
    house.load('./3d/Cottage_FREE.obj', this.gl);
    house.position.z = -100;
    house.rotator.x = 30;

    const frame = () => {
      this.angle++;
      this.clear();

      house.rotator.y = this.angle;

      this.program.setProjection(this.camera.projection);

      house.render(this.program);
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
}

const main = new Main();
main.init();
