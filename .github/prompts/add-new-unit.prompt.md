## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `heat-capacity-by-volume` unit type JSON file.
- New unit type includes units:
  - BTU/ft3-F [ reference: 1 BTU/ft3-F = 0.293071111 Wh/ft3-F | 0.067066112 MJ/m3-K ]
  - Wh/ft3-F [ reference: 1 Wh/ft3-F = 3.412142 BTU/ft3-F | 0.22883904 MJ/m3-K ]
  - MJ/m3-K [ reference: 1 MJ/m3-K = 4.369883733 Wh/ft3-F | 14.91066014 Btu/hr-ft3-F ]
- Create a new `heat-capacity-by-volume.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `heat-capacity-by-volume.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
