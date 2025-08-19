const Ajv = require('ajv');
const schema = require('../src/config/schema.json');
const lengthConfig = require('../src/config/length.json');
const areaConfig = require('../src/config/area.json');
const volumeConfig = require('../src/config/volume.json');
const temperatureConfig = require('../src/config/temperature.json');

const ajv = new Ajv();
const validate = ajv.compile(schema);

function check(name, config) {
  const valid = validate(config);
  if (valid) {
    console.log(name, 'VALID');
  } else {
    console.log(name, 'INVALID');
    console.log(validate.errors);
  }
}

check('length', lengthConfig);
check('area', areaConfig);
check('volume', volumeConfig);
check('temperature', temperatureConfig);
