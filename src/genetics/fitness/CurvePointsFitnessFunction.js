import BaseFitnessFunction from "./BaseFitnessFunction.js";
import { colors } from "../../utils/colors.js";

const { white } = colors;

export default class CurvePointsFitnessFunction extends BaseFitnessFunction {
  /**
   * @param {Agent}[agent]
   * @param {JimpImage}[edgeMatrix]
   * @return {number}
   */
  evaluate({ agent, edgeMatrix }) {
    const agentBezier = agent.getUpdatedBezierCurve();
    let sumOfCoverage = 0,
      points = [agentBezier.start, agentBezier.end,...agentBezier.points ];

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      let { x, y } = point;
      if (!isNaN(x) && !isNaN(y)) {
        const colorValue = edgeMatrix.getColorOnPosition(x, y);
        sumOfCoverage += colorValue;
      } else {
        sumOfCoverage = 0;
        break;
      }
    }

    let avg;
    if (sumOfCoverage === 0) {
      avg = 1;
    } else {
      avg = 1 / sumOfCoverage / (points.length * white);
    }

    return avg * this.weight + this._evaluate({ agent, edgeMatrix });
  }
}
