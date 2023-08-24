import { HouseModel } from './game/house';
import { RenderingPipeline } from './engine/pipeline';

class Main {
  private gl: WebGLRenderingContext;
  private pipeline: RenderingPipeline;
  constructor() {}

  async init() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const glOrNull = canvas.getContext('webgl');
    if (!glOrNull) {
      throw new Error('WebGL initialization failed.');
    }
    this.gl = glOrNull;

    this.pipeline = new RenderingPipeline(this.gl);
    this.pipeline.camera.position.z = 50;

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    const house = new HouseModel();
    house.position.z = -50;
    house.rotator.x = 30;
    this.pipeline.register(house);

    this.pipeline.run();
  }
}

const main = new Main();
main.init();
