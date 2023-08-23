import { CompositeModel } from '../engine/composite-model';
import { Entity } from '../engine/entity';
import { Model } from '../engine/model';

export class HouseModel extends CompositeModel {
  private readonly house: Entity;

  private angle: number = 0;

  constructor() {
    super({
      model: new Model('./3d/Cottage_FREE.obj'),
    });
    this.house = this.root.model;
    this.house.position.x = 50;
    console.log(this.house);
  }

  update(time: number): void {
    super.update(time);

    this.angle += time * 30;
    this.rotator.y = this.angle;
  }
}
