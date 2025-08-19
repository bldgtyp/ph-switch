## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `co2-emissions` unit type JSON file.
- New unit type includes units:
  - g-CO2/Wh
  - kg-CO2/Wh
  - g-CO2/kWh
  - kg-CO2/kWh
  - g-CO2/btu
  - kg-CO2/btu
  - g-CO2/kbtu
  - kg-CO2/kbtu
  - g-CO2/m2
  - kg-CO2/m2
  - g-CO2/m3
  - kg-CO2/m3
- Create a new `co2-emissions.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `co2-emissions.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
