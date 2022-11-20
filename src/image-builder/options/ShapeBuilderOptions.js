import genetics from "../../genetics/index.js";
const { PopulationConfig } = genetics;
/**
 * @property {string} imageUrl - image url/path/base64
 * @property {int|null} color - the color of the bezier curves in the population
 * @property {PopulationConfig} populationConfig - PopulationConfig object
 */
export default class ShapeBuilderOptions
{
  picture;
  color;
  populationConfig;

  /**
   * @param {Picture} picture
   * @param {int|null} color
   * @param {PopulationConfig} populationConfig
   */
  constructor({ picture = null, color = null, populationConfig = null }) {
    this.picture = picture;
    this.color = color;
    this.populationConfig = populationConfig;
  }
}