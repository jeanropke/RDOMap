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
        let min = child.Attributes.find(j => j.Type === 'MIN_POSSE_MEMBERS');
        min = min ? Number.parseInt(min.Value) : 0;
        // (0.01552 * y + -63.6), (0.01552 * x + 111.29)
        return { 'min': min, 'x': Number.parseFloat((0.01552 * Number.parseFloat(pos.Y) + -63.6).toFixed(4)), 'y': Number.parseFloat((0.01552 * Number.parseFloat(pos.X) + 111.29).toFixed(4)) };
      });
      results.push({ 'text': baseId, 'x': 0, 'y': 0, 'radius': 0, 'locations': spawnChildren });
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
      let str = null;
      if (config) str = config.String.Value;
      locs.push({ 'config': str, 'x': Number.parseFloat((0.01552 * Number.parseFloat(pos.Y) + -63.6).toFixed(4)), 'y': Number.parseFloat((0.01552 * Number.parseFloat(pos.X) + 111.29).toFixed(4)) });
    });
    results.push({ 'text': baseId, 'x': 0, 'y': 0, 'radius': 0, 'locations': locs });
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
