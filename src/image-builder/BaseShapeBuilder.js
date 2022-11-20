import genetics from "../genetics/index.js";
import logger from "../utils/logger.js";
import Picture from "../entities/Picture.js";

const { MiddlePointsFitnessFunction, CurvePointsFitnessFunction } = genetics.fitness;
const { Cauldron, PopulationConfig, fitness } = genetics;

/**
 * @property {string} shapeName - a shape name used in logs
 * @property {boolean} negative - controls if the evaluation should be a negative
 * @property {PopulationConfig} populationConfig - a config object for the population
 * @property {number} crossOverChance - a chance factor for cross over
 * @property {number} mutationChance - a chance factor for mutationChance
 * @property {int} nofMixes - number of mixes in cauldron
 * @property {int} maxMixingTime - if specified the cauldron will doMixing for that number of milliseconds
 * @property {Picture} picture - the Picture object
 * @property {JimpImage} edgeMatrix - edge matrix JimpImage object
 * @property {JimpImage} binaryImage - binary image JimpImage object
 * @property {[{func: fitness.IFitnessFunction, weight: number}]} fitnessFuncs - number of mixes in cauldron
 * @property {ShapeBuilderOptions} options - shape builder options
 */
export default class BaseShapeBuilder {
  shapeName = "BaseBuilder";
  populationConfig;
  crossOverChance = 1.0;
  mutationChance = 1.0;
  negative = false
  nofMixes = 100;
  fitnessFuncs = [
    { func: MiddlePointsFitnessFunction, weight: 1 },
  ];
  maxMixingTime = 0;
  picture;
  edgeMatrix;
  binaryImage;
  options;

  /**
   * @param {ShapeBuilderOptions} shapeBuilderOptions
   */
  constructor(shapeBuilderOptions) {
    this.options = shapeBuilderOptions;
    this.picture = shapeBuilderOptions.picture;
    this.populationConfig = this.mergePopulationConfigWithDefault(shapeBuilderOptions.populationConfig);
  }

  /**
   * It creates a new Picture object and assigns it to the picture property
   */
  getPicture() {
    return this.picture;
  }

  /**
   * It creates a cauldron, fills it with a population of random shapes, and then mixes them until the best shape is found
   * @returns {Promise<Cauldron>}
   */
  async buildShape() {
    logger.log("Building shape: " + this.shapeName);

    logger.log("Getting edge matrix");
    this.edgeMatrix = await this.picture.edgeMatrix;
    this.binaryImage = await this.picture.binaryImage;

    this.populationConfig.xMax = this.binaryImage.width;
    this.populationConfig.yMax = this.binaryImage.height;

    logger.log("Removing noise");
    const precisionForFlatteningImages = 0.1;
    this.edgeMatrix.flattenImage(precisionForFlatteningImages);
    this.binaryImage.flattenImage(precisionForFlatteningImages);

    const cauldron = new Cauldron(
      this.populationConfig,
      this.negative,
      this.crossOverChance,
      this.mutationChance,
    );

    logger.log("Mixing...");
    cauldron.doMixing({
      edgeMatrix: this.edgeMatrix,
      fitnessFuncs: this.fitnessFuncs,
      nofMixes: this.nofMixes,
      maxMixingTime: this.maxMixingTime,
    });

    return cauldron;
  }

  /**
   * Sets default config values if they are not present.
   * @param {PopulationConfig} populationConfig
   */
  mergePopulationConfigWithDefault(populationConfig) {
    const defaultConfig = this.getDefaultPopulationConfig();
    if (!populationConfig) {
      return defaultConfig;
    }

    Object.keys(defaultConfig).forEach(key => {
      if (!populationConfig[key]) {
        populationConfig[key] = defaultConfig[key];
      }
    })

    return populationConfig;
  }

  /**
   * @return {PopulationConfig} - A default population config.
   */
  getDefaultPopulationConfig() {
    return new PopulationConfig({
      nofPointsMax: 2,
      nofPointsMin: 1,
      thicknessMax: 1,
      thicknessMin: 1,
      bezierPoints: 100,
      size: 100,
    });
  }
}