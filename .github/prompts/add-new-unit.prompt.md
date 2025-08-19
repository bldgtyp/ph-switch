## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `airflow-envelope` unit type JSON file.
- New unit type includes units:
  - cfm/ft2 (cubic-feet per minute per square foot) [ 1 cfm/ft = 18.288 m3/hr-m2 ]
  - cfm/m2 (cubic-feet per minute per square meter)
  - l/s-m2 (liter per second per square meter) [ 1 l/s-m2 = 3.6 m3/hr-m2 ]
  - m3/s-m2 (cubic meter per second per square meter)
  - m3/hr-m2 (cubic meter per hour per square meter)
  - m3/min-m2 (cubic meter per minute per square meter)
- Create a new `airflow-envelope.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `airflow-envelope.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
