import { Entity } from './entity';
import { Program } from './program';
import { RenderableMesh, ResourceManager } from './resource-manager';

export class Model extends Entity {
  private meshes: RenderableMesh[];
  constructor(private readonly source: string) {
    super();
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
