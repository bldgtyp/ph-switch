## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `heat-capacity-by-mass` unit type JSON file.
- New unit type includes units:
  - Btu/lb-F [ reference: 1 BTU/lb-F =4186.800585 J/kg-K ]
  - kBtu/lb-F
  - J/kg-K [ reference: 1 J/kg-K = 0.0002388458633 BTU/lb-F ]
  - kJ/kg-K
  - kWh/kg-K
  - Wh/kg-K
- Create a new `heat-capacity-by-mass.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `heat-capacity-by-mass.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
