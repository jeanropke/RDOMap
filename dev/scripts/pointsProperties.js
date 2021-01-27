/**
  *! Count automatically circle position and radius for set of points

  @param {array} points - array of objects that must contain "x" and "y" properties.
    - ex.
    const positions = [{ "x": 16, "y": 25 }, { "x": 146, "y": 78 }, { "x": 0, "y": -45 }];
  @param {number} extendBounds - amount of units to extend the circle around the points.

  use like:
  const myPoints = pointsProperties(positions);
  myPoints.radius(); - returns the circle containing all points.
  myPoints.center(); - returns center of the circle (center of the circle is in geometrical mass center of the figure made from connecting all points).
**/

function pointsProperties(points, precision = 4) {
  const center = (points => {
    const avg = [[], []];
    const averageValue = arr => arr.reduce((acc, amount, index, array) => amount / array.length + acc, 0);

    points.forEach(({ x, y }) => {
      avg[0].push(x);
      avg[1].push(y);
    });

    return avg.map(averageValue);
  })(points);

  const maxDist = points.reduce((acc, { x, y }) => {
    const [a, b] = [center[0] - x, center[1] - y];
    return Math.max(acc, Math.sqrt(a * a + b * b));
  }, 0);

  return {
    radius: (extendBounds = 0) => (maxDist + extendBounds).toFixed(precision),
    center: () => center,
  };
}