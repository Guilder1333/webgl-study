import { Camera } from './engine/camera';
import { Program } from './engine/program';
import { Model } from './engine/model';
import { ResourceManager } from './engine/resource-manager';
import { HouseModel } from './game/house';
import { Entity } from './engine/entity';

class Main {
  private gl: WebGLRenderingContext;
  private resourceManager: ResourceManager;
  private program: Program;
  private camera: Camera;
  private models: Entity[] = [];
  constructor() {}

  async init() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const glOrNull = canvas.getContext('webgl');
    if (!glOrNull) {
      throw new Error('WebGL initialization failed.');
    }
    this.gl = glOrNull;

    this.resourceManager = new ResourceManager(this.gl);

    this.program = new Program(this.gl);
    this.program.activate();

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.camera = new Camera(this.gl);
    this.camera.position.z = 50;

    const house = new HouseModel();
    house.position.z = -50;
    house.rotator.x = 30;
    this.models.push(house);

    for (const model of this.models) {
      await model.init(this.resourceManager);
    }

    let lastFrameTime = performance.now();
    const frame = (timeStamp: number) => {
      const deltaTime = (timeStamp - lastFrameTime) / 1000;
      lastFrameTime = timeStamp;

      this.update(deltaTime);

      this.render();
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

  update(deltaTime: number) {
    for (const model of this.models) {
      model.update(deltaTime);
    }
  }

  render() {
    this.clear();

    this.program.setViewMatrix(this.camera.makeMatrix());
    this.program.setProjection(this.camera.projection);

    for (const model of this.models) {
      model.render(this.program);
    }
  }
}

const main = new Main();
main.init();
