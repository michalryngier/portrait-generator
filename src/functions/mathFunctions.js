function clamp(value, max) {
  if (value < 0) {
    return 0;
  }
  if (value > max) {
    return max;
  }

  return value;
}

/**
 * @param max
 * @param min
 * @returns {number}
 */
function rand(max, min = 0) {
  return Math.random() * (max - min) + min;
}

/**
 * @param {int}[max]
 * @param {int}[min]
 * @return {number}
 */
function randInt(max, min = 0) {
  return parseInt(Math.floor(Math.random() * (max - min) + min).toString());
}

function lerp(start, end, t) {
  return start + (end - start) * clamp(t, 1);
}

/**
 *
 * @param {number}[value]
 * @param {number}[max]
 * @param {number}[min]
 * @return {number}
 */
function normalize(value, max, min) {
  if (max === min) {
    return 1;
  }
  return Math.abs((value - min) / (max - min));
}

/**
 * @param point
 * @param threshold
 * @param xMax
 * @param yMax
 * @returns {{yMin: number, yMax: number, xMax: number, xMin: number}}
 */
function getPointsWithThreshold(point, threshold, xMax, yMax) {
  return {
    xMin: Math.round(clamp(point.x - threshold, xMax)),
    xMax: Math.round(clamp(point.x + threshold, xMax)),
    yMin: Math.round(clamp(point.y - threshold, yMax)),
    yMax: Math.round(clamp(point.y + threshold, yMax)),
  };
}

export {
  clamp,
  rand,
  getPointsWithThreshold,
  lerp,
  normalize,
  randInt,
};

