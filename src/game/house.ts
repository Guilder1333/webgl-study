import { CompositeModel } from '../engine/composite-model';
import { Entity } from '../engine/entity';
import { Model } from '../engine/model';
import { Vector3 } from '../engine/vector';

export class HouseModel extends CompositeModel {
  private readonly house: Entity;

  private angle: number = 0;

  constructor() {
    super({
      model: new Model('./3d/Cottage_FREE.obj', new Vector3(50, 0, 0)),
    });
    this.house = this.root.model;
    console.log(this.house);
  }

  update(time: number): void {
    super.update(time);

    this.angle += time * 30;
    this.rotator.y = this.angle;
  }
}
