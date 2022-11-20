import bezier from "bezier-curve";
import { rand } from"./../functions/mathFunctions.js";

/**
 * @property {{x: number, y: number}} start - the starting point for the curve
 * @property {{x: number, y: number}} end - the ending point for the curve
 * @property {array} points - the middle points for the curve
 * @property {int} thickness - the thickness of the curve
 * @property {int} bezierPoints - the number of points to evaluate curve with
 */
export default class BezierCurve {
  /**
   * @param {{x: number, y: number}} [start]
   * @param {{x: number, y: number}} [end]
   * @param {array} [points]
   * @param {int} [thickness]
   * @param {int} [bezierPoints]
   */
  constructor(
    start = { x: 0, y: 0 },
    end = { x: 0, y: 0 },
    points = [],
    thickness = 1,
    bezierPoints = 100
  ) {
    this.start = start;
    this.end = end;
    this.points = points;
    this.thickness = thickness;
    this.bezierPoints = bezierPoints;
  }

  /**
   * @param {int} [xMax]
   * @param {int} [yMax]
   * @param {int} [nofPoints]
   * @param thickness
   * @param {int}[bezierPoints]
   * @returns {BezierCurve}
   */
  static getRandomCurve({
    xMax,
    yMax,
    nofPoints = 1,
    thickness = 1,
    bezierPoints = 100,
  }) {
    let start = { x: rand(xMax), y: rand(yMax) },
      end = { x: rand(xMax), y: rand(yMax) },
      points = [];

    for (let i = 0; i < nofPoints; i++) {
      points.push({ x: rand(xMax), y: rand(yMax) });
    }

    return new BezierCurve(start, end, points, thickness, bezierPoints);
  }

  /**
   * @param {number} [t] Range (0 - 1).
   * @returns {Object} {x: number, y: number}
   */
  getPoint(t) {
    let points = [];
    this.points.forEach((p) => points.push([p.x, p.y]));

    return bezier(t, [
      [this.start.x, this.start.y],
      ...points,
      [this.end.x, this.end.y],
    ]);
  }

  /**
   * @param {{x: number, y: number}}[start]
   * @param {{x: number, y: number}}[end]
   * @param {int|null}[thickness]
   * @param {[{x: number, y: number}]}[points]
   */
  setProperties({
    start = { x: 0, y: 0 },
    end = { x: 0, y: 0 },
    thickness = null,
    points = [],
  }) {
    this.start = start;
    this.end = end;
    this.thickness = thickness ?? this.thickness;
    this.points = points;
  }
}
