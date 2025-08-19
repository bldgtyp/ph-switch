## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `airflow` unit type JSON file.
- New unit type includes units:
  - cfm (cubic-feet-per-minute)
  - cfh (cubic-feet-per-hour)
  - m3/h (cubic-meters-per-hour)
  - m3/m (cubic-meters-per-minute)
  - m3/s (cubic-meters-per-second)
  - L/s (liter-per-second)
- Create a new `airflow.json` file and add the relevant conversion factors.
- Ensure that thje new units are loaded in `configLoader.ts` as well.
- Run Prettier formater
- Run all tests
