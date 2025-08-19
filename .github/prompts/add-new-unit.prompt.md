## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `temperature-difference` unit type JSON file.
- New unit type includes units:
  - delta-k (Kelvin)
  - delta-c (Celsius)
  - delta-f (Fahrenheit) [reference: 1 delta-F = 0.555555556 delta-C]
- Create a new `temperature-difference.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `temperature-difference.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
