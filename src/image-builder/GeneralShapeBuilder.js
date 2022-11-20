import BaseBuilder from "./BaseShapeBuilder.js";
import genetics from "../genetics/index.js";

const { PopulationConfig } = genetics;

export default class GeneralShapeBuilder extends BaseBuilder {
  /**
   * @param {ShapeBuilderOptions} shapeBuilderOptions
   */
  constructor(shapeBuilderOptions) {
    super(shapeBuilderOptions);

    /* Setting parameters' values that are just for this type of shape */
    this.mutationChance = 0.0001;
    this.crossOverChance = 0.8;
    this.negative = false;
    this.shapeName = 'general shape';

    this.getPicture();
  }

  getDefaultPopulationConfig() {
    return new PopulationConfig({
      nofPointsMax: 4,
      nofPointsMin: 2,
      thicknessMax: 2,
      thicknessMin: 1,
      bezierPoints: 100,
      size: 1000,
    });
  }
}