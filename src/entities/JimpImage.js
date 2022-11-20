import Jimp from "jimp";
import functions from "../functions/index.js";
import utils from "../utils/index.js";

const { mathFunctions, converters } = functions;
const { colors } = utils;
const { hexAlphaToDecNoAlpha, hexToDec } = converters;
const { white, black, transparent, getWithAlpha } = colors;
const { clamp, getPointsWithThreshold, lerp } = mathFunctions;

/**
 * A helper class for the Jimp object
 *
 * @property {Jimp} #jimp - the Jimp object
 * @property {number} width - the width of the image
 * @property {number} height - the height of the image
 * @property {int} scale - the scale of the image
 */
export default class JimpImage {
  #jimp;

  /**
   * @param {Jimp} [jimp]
   * @param {number} [scale]
   */
  constructor(jimp, scale = 1) {
    this.#jimp = jimp;
    this.width = jimp.getWidth();
    this.height = jimp.getHeight();
    this.scale = scale;
  }

  /**
   * @returns {Jimp}
   */
  get image() {
    return this.#jimp;
  }

  /**
   * Returns HEX-Alpha color value from [X, Y] position.
   * @param {int} [x]
   * @param {int} [y]
   * @param {number|null} [threshold]
   * @returns {number}
   */
  getColorOnPosition(x, y, threshold = null) {
    if (threshold !== null && threshold > 1) {
      return this.#getColorWithThreshold(x, y, threshold);
    }

    return this.#jimp.getPixelColor(x, y, function (err, color) {
      return color;
    });
  }

  /**
   * Returns average HEX color value from [X, Y] +/- threshold.
   * @param {int} [x]
   * @param {int} [y]
   * @param {int} [threshold]
   * @returns {number}
   */
  #getColorWithThreshold(x, y, threshold) {
    let { xMin, xMax, yMin, yMax } = getPointsWithThreshold(
      {
        x,
        y,
      },
      threshold,
      this.width,
      this.height
    );
    let sum = 0,
      iterations = 0;

    for (let xx = xMin; xx <= xMax; xx++) {
      for (let yy = yMin; yy <= yMax; yy++, iterations++) {
        sum += this.getColorOnPosition(xx, yy);
      }
    }

    return parseInt((sum / iterations).toString());
  }

  /**
   * Returns image flatten to black and white colors.
   * @param {number} [precision]
   */
  flattenImage(precision = 1) {
    let whiteVal = clamp(precision, 1) * hexToDec("FFFFFF");

    this.#scan((x, y) => {
      let colorVal = hexAlphaToDecNoAlpha(this.getColorOnPosition(x, y));
      if (colorVal < whiteVal) {
        this.drawPoint({ x, y });
      } else {
        this.drawPoint({ x, y, color: white });
      }
    });
  }

  /**
   * @param {int} [x]
   * @param {int} [y]
   * @param {int} [color]
   * @param {number} [thickness]
   * @param {boolean} [lerpColor]
   */
  drawPoint({ x, y, color = black, thickness = 1, lerpColor = false }) {
    if (thickness > 1) {
      let { xMin, xMax, yMin, yMax } = getPointsWithThreshold(
          { x, y },
          thickness / 2,
          this.width,
          this.height
        ),
        diffX = Math.abs(xMax - xMin),
        diffY = Math.abs(yMax - yMin);

      this.image.scan(xMin, yMin, diffX, diffY, (xx, yy) => {
        if (lerpColor) {
          let t =
            1 - (Math.abs(x - xx) / diffX) * (1 - Math.abs(y - yy) / diffY);
          let alpha = lerp(0, 255, t);
          color = getWithAlpha(color, alpha);
        }
        this.image.setPixelColor(color, xx, yy);
      });
    } else {
      this.image.setPixelColor(color, x, y);
    }
  }

  /**
   * @param {int} [color]
   */
  fillColor(color) {
    this.#scan((x, y) => {
      this.drawPoint({ x, y, color });
    });
  }

  /**
   * Draws Bezier curve.
   * @param {bezierCurve: BezierCurve, scale: int, points: int, color: int, lerpColor: boolean}
   */
  drawBezier({
               bezierCurve,
               scale = 1,
               color = white,
               lerpColor = false,
             }) {
    let step = 1 / bezierCurve.bezierPoints;
    for (let t = 0; t < 1; t += step) {
      let [x, y] = bezierCurve.getPoint(t);
      if (!isNaN(x) && !isNaN(y)) {
        this.drawPoint({
          x: x * scale,
          y: y * scale,
          color,
          thickness: bezierCurve.thickness,
          lerpColor,
        });
      }
    }
  }

  /**
   * @param {string} [fileName]
   * @returns {Jimp}
   */
  writeImage(fileName = "image.png") {
    return this.image.write(fileName, (err, jimp) => {
      return jimp;
    });
  }

  toBase64() {
    let base64 = "";
    this.image.getBase64(this.image.getMIME(), (err, res) => {
      base64 = res;
    });

    return base64;
  }

  /**
   * @param {JimpImage} [edgeMatrix]
   * @param {number} [scale]
   * @returns {JimpImage}
   */
  static createFromMatrix(edgeMatrix, scale = 1) {
    return new JimpImage(
      new Jimp(
        edgeMatrix.width * scale,
        edgeMatrix.height * scale,
        transparent,
        (err, image) => image
      ),
      scale
    );
  }

  /**
   * @param {int} width
   * @param {int} height
   * @param {int} scale
   * @returns {JimpImage}
   */
  static createFromParams(width, height, scale = 1) {
    return new JimpImage(
      new Jimp(
        width * scale,
        height * scale,
        transparent,
        (err, image) => image
      ),
      scale
    );
  }

  /**
   * Performs given function on every pixel of the image.
   * @param {Function} [fn]
   */
  #scan(fn) {
    this.image.scan(0, 0, this.width, this.height, fn);
  }
}
