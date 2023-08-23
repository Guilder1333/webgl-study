import { Program } from './program';
import { ResourceManager } from './resource-manager';
import { Rotator } from './rotator';
import { Vector3 } from './vector';

export class Entity {
  public readonly position = new Vector3();
  public readonly rotator = new Rotator();

  async init(_resourceManager: ResourceManager) {}

  makeMatrix() {
    const matrix = mat4.create();
    mat4.translate(matrix, matrix, this.position);
    mat4.rotateX(matrix, matrix, this.rotator.radX());
    mat4.rotateY(matrix, matrix, this.rotator.radY());
    mat4.rotateZ(matrix, matrix, this.rotator.radZ());
    return matrix;
  }

  update(_time: number) {}

  render(_program: Program) {}
}
