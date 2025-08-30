## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `heat-flow` unit type JSON file.
- New unit type includes units:
  - Btu/hr-F (Conductivity) [reference: 1 Btu/hr-F = | 0.527528 W/mk]
  - w/K (Conductivity) [reference: 1 w/K = 1.895633976 Btu/hr-F]
- Create a new `heat-flow.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `heat-flow.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
