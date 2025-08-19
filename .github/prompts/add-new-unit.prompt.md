## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `fan-efficiency` unit type JSON file.
- New unit type includes units:
  - J/L
  - W/cfm [ reference: 1 W/cfm = 0.588577779 Wh/m3 ]
  - W/cfh (watts per cubic-foot-per-hour)
  - Wh/m3 [ reference: 1 Wh/m3 = 1.699010796 W/cfm ]
  - kWh/m3
- Create a new `fan-efficiency.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `fan-efficiency.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
