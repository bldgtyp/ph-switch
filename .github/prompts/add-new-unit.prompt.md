## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `density` unit type JSON file.
- New unit type includes units:
  - mg/m3 (milligram / meter3)
  - g/m3 (gram / meter3)
  - kg/m3 (kilogram / meter3)
  - lb/ft3 (pound / cubic foot)
  - lb/in3 (pound / cubic inch)
- Create a new `density.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `density.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
