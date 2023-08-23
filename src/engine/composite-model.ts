import { Entity } from './entity';
import { Program } from './program';
import { ResourceManager } from './resource-manager';

export type Submodels = {
  model: Entity;
  children?: Submodels[] | null;
};

export class CompositeModel extends Entity {
  constructor(protected readonly root: Submodels) {
    super();
  }

  async init(resourceManager: ResourceManager) {
    const stack: Submodels[] = [this.root];
    while (stack.length) {
      const node = stack.pop() as Submodels;
      await node.model.init(resourceManager);
      if (node.children) {
        for (const child of node.children) {
          stack.push(child);
        }
      }
    }
  }

  update(time: number): void {
    const stack: Submodels[] = [this.root];
    while (stack.length) {
      const node = stack.pop() as Submodels;
      node.model.update(time);
      if (node.children) {
        for (const child of node.children) {
          stack.push(child);
        }
      }
    }
  }

  render(program: Program): void {
    program.pushMatrix(this.makeMatrix());
    this.renderSubmodel(program, this.root);
    program.popMatrix();
    // throw new Error("");
  }

  private renderSubmodel(program: Program, node: Submodels) {
    node.model.render(program);
    if (node.children) {
      program.pushMatrix(node.model.makeMatrix());
      for (const child of node.children) {
        this.renderSubmodel(program, child);
      }
      program.popMatrix();
    }
  }
}
