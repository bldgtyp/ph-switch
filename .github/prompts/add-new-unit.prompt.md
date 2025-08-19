## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `humidity` unit type JSON file.
- New unit type includes units:
  - lb/lb [reference: 1 lb/lb = 1000 g/kg]
  - g/kg [reference: 1 g/kg = 0.001 lb/lb]
  - g/g
  - kg/kg
- Create a new `humidity.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `humidity.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
