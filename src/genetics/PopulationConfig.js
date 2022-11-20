/**
 * Population configuration definition.
 *
 * @property {int} xMax - the base image width value
 * @property {int} yMax - the base image height value
 * @property {int} nofPointsMax - the maximum number of points for the bezier curve
 * @property {int} nofPointsMin - the minimum number of points for the bezier curve
 * @property {int} thicknessMax - the maximum thickness of the bezier curve
 * @property {int} bezierPoints - the number of bezier curve points to evaluate
 * @property {int} size - the population size
 */
export default class PopulationConfig {
  xMax = 0;
  yMax = 0;

  /**
   * @param {int}[nofPointsMax]
   * @param {int}[nofPointsMin]
   * @param {int}[thicknessMax]
   * @param {int}[thicknessMin]
   * @param {int}[bezierPoints]
   * @param {int}[size]
   */
  constructor({
    nofPointsMax,
    nofPointsMin,
    thicknessMax,
    thicknessMin,
    bezierPoints,
    size,
  }) {
    this.nofPointsMax = nofPointsMax;
    this.nofPointsMin = nofPointsMin;
    this.thicknessMax = thicknessMax;
    this.thicknessMin = thicknessMin;
    this.bezierPoints = bezierPoints;
    this.size = size;
  }
}
