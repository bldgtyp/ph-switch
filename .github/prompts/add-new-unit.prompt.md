## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/length.json`

### Task:

- Add a new `pressure` unit type JSON file.
- New unit type includes units:
  - Pa (Pascal)
  - inHg (inch Mercury) [reference: 1 inHg = 3386.39 Pa]
  - inWC (inch water-column) [reference: 1 inWC = 249.0889083 Pa]
  - Bar (bar) [reference: 1 Bar = 100000 Pa]
  - psi (Pound-Force-per-Square-Inch) [reference: 1 psi = 6894.76 Pa]
  - atm (Atmosphere) [reference: 1 atm = 101325 Pa]
  - Torr (Torr) [reference: 1 Torr = 133.322 Pa]
- Create a new `pressure.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `pressure.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
