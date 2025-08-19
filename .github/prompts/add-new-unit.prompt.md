## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `power-intensity` unit type JSON file.
- New unit type includes units:
  - Btu/hr-ft2 (btu per hour-foot-squared) [reference: 1.0 Btu/hr-ft2 = 0.293071111 W/ft2 | 3.154591186 W/m2 ]
  - kBtu/hr-ft2 (kbtu per hour-foot-squared)
  - W/ft2 (watt per foot-squared) [reference: 1.0 W/ft2 = 3.154591186 Btu/hr-ft2 | 10.76391042 W/m2 ]
  - kW/ft2 (kilowatt per foot-squared)
  - W/m2 (watt per meter-squared) [reference: 1.0 W/m2 = 0.09290304 W/ft2 | 0.316998286 Btu/hr-ft2 ]
  - kW/m2 (kilowatt per meter-squared)
- Create a new `power-intensity.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `power-intensity.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
