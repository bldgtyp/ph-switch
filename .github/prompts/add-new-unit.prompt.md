## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/power-intensity.json`

### Task:

- Add a new `energy-intensity` unit type JSON file.
- New unit type includes units:
  - Btu/ft2 (btu per foot-squared)
  - kBtu/ft2 (kbtu per foot-squared) [reference: 1.0 kBtu/ft2 = 0.293071111 kWH/ft2 | 3.154591186 kWH/m2 ]
  - WH/ft2 (watt-hours per foot-squared)
  - kWH/ft2 (kilowatt-hours per foot-squared) [reference: 1.0 kWH/ft2 = 3.412141156 kBtu/ft2 | 10.76391042 kWH/m2 ]
  - WH/m2 (watt-hours per meter-squared)
  - kWH/m2 (kilowatt-hours per meter-squared) [reference: 1.0 kWH/m2 = 0.092903040 kWH/ft2 | 0.316998286 kBtu/ft2 ]
- Create a new `energy-intensity.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `energy-intensity.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
