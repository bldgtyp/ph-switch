## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `speed` unit type JSON file.
- New unit type includes units:
  - m/s (meter / second)
  - m/h (meter / hour)
  - m/day (meter / day)
  - ft/s (foot / second)
  - ft/min (foot / minute)
  - ft/h (foot / hour)
  - ft/day (foot / day)
  - kph (kilometer / hour)
  - mph (mile / hour)
- Create a new `speed.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `speed.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
