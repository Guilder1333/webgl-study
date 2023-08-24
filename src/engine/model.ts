import { Entity } from './entity';
import { Program } from './program';
import { RenderableMesh, ResourceManager } from './resource-manager';
import { Rotator } from './rotator';
import { Vector3 } from './vector';
const emptyModels: RenderableMesh[] = [];

export class Model extends Entity {
  private meshes: RenderableMesh[] = emptyModels;
  constructor(
    private readonly source: string,
    position?: Vector3,
    rotation?: Rotator
  ) {
    super(position, rotation);
    console.log(position);
  }

  async init(resourceManager: ResourceManager) {
    this.meshes = await resourceManager.loadModel(this.source);
  }

  render(program: Program) {
    program.setModelMatrix(this.makeMatrix());
    for (const mesh of this.meshes) {
      this.draw(program, mesh);
    }
  }

  private draw(program: Program, mesh: RenderableMesh) {
    const buffer = mesh.bufferIndex;
    if (!buffer) {
      return;
    }

    program.setVertices(buffer);
    program.setTextureCoords(buffer);

    if (mesh.material && mesh.material.diffuseIndex) {
      program.setTexture0(mesh.material.diffuseIndex);
    }

    program.drawArray(0, mesh.bufferSize);
  }
}
