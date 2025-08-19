## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `energy` unit type JSON file.
- New unit type includes units:
  - btu (British Thermal Unit)
  - kBtu (kilobritish Thermal Unit)
  - joule (J)
  - kilojoule (kJ)
  - calorie (cal)
  - kilocalorie (kcal)
  - Wh (Watt-hour)
  - kWh (Kilowatt-hour)
  - MWh (Megawatt-hour)
  - therm
- Create a new `energy.json` file and add the relevant conversion factors.
- Ensure that thje new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `energy.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
