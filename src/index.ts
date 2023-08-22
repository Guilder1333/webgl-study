import { Camera } from './camera';
import { Program } from './program';
import { Model } from './model';

class Main {
  private gl: WebGLRenderingContext;
  private angle = 0;
  private program: Program;
  private camera: Camera;
  constructor() {}

  async init() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const glOrNull = canvas.getContext('webgl');
    if (!glOrNull) {
      throw new Error('WebGL initialization failed.');
    }
    this.gl = glOrNull;

    this.program = new Program(this.gl);
    this.program.activate();

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.camera = new Camera(this.gl);

    const house = new Model();
    await house.load('./3d/Cottage_FREE.obj', this.gl);
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
