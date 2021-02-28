const path = require('path');
const fs = require('fs');

function getAllFiles(directory, files = []) {
  fs.readdirSync(directory).forEach(file => {
    const absolute = path.join(directory, file);

    if (fs.statSync(absolute).isDirectory())
      return getAllFiles(absolute, files);

    files.push(absolute);
    return files;
  });

  return files;
}

function pointsProperties(points, precision = 4, extendBounds = 0.3334) {
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
    radius: (maxDist + extendBounds).toFixed(precision),
    center: center,
  };
}

function snippet1(x) {
  const results = [];
  x.forEach(i => {
    const baseId = i.Attributes.find(j => j.Type === 'ID').Name;
    const objectives = i.Children.find(j => j.Name === 'OBJECTIVES').Children;
    objectives.forEach((objective, index) => {
      if (index > 0) return;
      if (!objective.Children) return;
      const spawns = objective.Children.find(j => j.Name === 'POTENTIAL_SPAWN_POSITIONS');
      if (!spawns) return;
      const spawnChildren = spawns.Children.map(child => {
        let pos = child.Attributes.find(j => j.Type === 'SPAWN_POSITION').Coordinate;
        if (Number.parseFloat(pos.X) == 0 || Number.parseFloat(pos.Y) == 0 || Number.parseFloat(pos.Z) == 0) return;
        let min = child.Attributes.find(j => j.Type === 'MIN_POSSE_MEMBERS');
        min = min ? Number.parseInt(min.Value) : 1;
        // (0.01552 * y + -63.6), (0.01552 * x + 111.29)
        return { 'min': min, 'x': Number.parseFloat((0.01552 * Number.parseFloat(pos.Y) + -63.6).toFixed(4)), 'y': Number.parseFloat((0.01552 * Number.parseFloat(pos.X) + 111.29).toFixed(4)) };
      });
      const points = pointsProperties(spawnChildren);
      results.push({ 'text': baseId, 'x': Number.parseFloat(points.center[0].toFixed(4)), 'y': Number.parseFloat(points.center[1].toFixed(4)), 'radius': Number.parseFloat(points.radius), 'locations': spawnChildren });
    });
    // results = results[0];
  });
  return results;
}

function snippet2(x) {
  const results = [];
  x.forEach(i => {
    const baseId = i.Attributes.find(j => j.Type === 'ID').Name;
    const objectives = i.Children.find(j => j.Name === 'OBJECTIVES').Children;
    const locs = [];
    objectives.forEach(objective => {
      if (!objective.Attributes) return;
      const spawns = objective.Attributes.find(j => j.Type === 'SPAWN_POSITION');
      const config = objective.Attributes.find(j => j.Type === 'CONFIG');
      if (!spawns) return;
      const pos = spawns.Coordinate;
      if (Number.parseFloat(pos.X) == 0 || Number.parseFloat(pos.Y) == 0 || Number.parseFloat(pos.Z) == 0) return;
      let str = null;
      if (config) str = config.String.Value;
      locs.push({ 'x': Number.parseFloat((0.01552 * Number.parseFloat(pos.Y) + -63.6).toFixed(4)), 'y': Number.parseFloat((0.01552 * Number.parseFloat(pos.X) + 111.29).toFixed(4)) });
    });
    const points = pointsProperties(locs);
    results.push({ 'text': baseId, 'x': Number.parseFloat(points.center[0].toFixed(4)), 'y': Number.parseFloat(points.center[1].toFixed(4)), 'radius': Number.parseFloat(points.radius), 'locations': locs });
    // results = results[0];
  });
  return results;
}

const files = getAllFiles(path.join(__dirname, 'src'));
files.forEach(filePath => {
  const file = require(filePath)[1].Children[1].Children;
  const info = path.parse(filePath);
  const name = info.name;
  console.log(name);

  try {
    const result = snippet1(file);
    fs.writeFileSync(path.join(__dirname, 'results-1', `${name}.json`), JSON.stringify(result, null, 2).toLowerCase());
  } catch (error) {
    console.error(error);
  }

  try {
    const result = snippet2(file);
    fs.writeFileSync(path.join(__dirname, 'results-2', `${name}.json`), JSON.stringify(result, null, 2).toLowerCase());
  } catch (error) {
    console.error(error);
  }
});
