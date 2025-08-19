## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `heat-capacity-by-area` unit type JSON file.
- New unit type includes units:
  - BTU/ft2-F [ reference: 1 BTU/ft2-F = 0.293071111 Wh/ft2-F | 5.678264134 Wh/m2-K ]
  - Wh/ft2-F [ reference: 1 Wh/ft2-F = 3.412141156 BTU/ft2-F | 19.37503875 Wh/m2-K ]
  - Wh/m2-K [ reference: 1 Wh/m2-K = 0.176110159 BTU/ft2-F | 0.0516128 Wh/ft2-K ]
- Create a new `heat-capacity-by-area.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `heat-capacity-by-area.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
