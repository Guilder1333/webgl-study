import { Camera } from './camera';
import { Entity } from './entity';
import { Program } from './program';
import { ResourceManager } from './resource-manager';

export class RenderingPipeline {
  private readonly entities: Entity[] = [];
  private readonly program: Program;
  private resourceManager: ResourceManager;

  public readonly camera: Camera;

  constructor(private readonly gl: WebGLRenderingContext) {
    this.program = new Program(this.gl);

    this.resourceManager = new ResourceManager(this.gl);

    this.camera = new Camera(this.gl);
  }

  register(entity: Entity) {
    this.entities.push(entity);
    entity.init(this.resourceManager);
  }

  unregister(entity: Entity) {
    const index = this.entities.findIndex((c) => entity === c);
    if (index >= 0) {
      this.entities[index] = this.entities.pop() as Entity;
    }
  }

  run() {
    this.program.activate();
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
    for (const model of this.entities) {
      model.update(deltaTime);
    }
  }

  render() {
    this.clear();

    this.program.setViewMatrix(this.camera.makeMatrix());
    this.program.setProjection(this.camera.projection);

    for (const model of this.entities) {
      model.render(this.program);
    }
  }
}
