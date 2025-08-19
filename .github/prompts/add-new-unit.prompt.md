## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `power` unit type JSON file.
- New unit type includes units:
  - btu/hr (British Thermal Unit per hour)
  - kbtu/hr (kilobritish Thermal Unit per hour)
  - W (watt)
  - kW (Kilowatt)
  - ton-cooling (ton of cooling)
- Create a new `power.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `power.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
