## Goal:

- add a new unit-category.

## References:

- required json strucutre: `src/config/schema.json`
- example of a working unit-type json file: `src/config/power-intensity.json`

### Task:

- Add a new `energy-efficiency` unit type JSON file.
- New unit type includes units:
  - Btu/Wh [reference 1 Btu/Wh = 0.293071111 kWh/Wh]
  - W/W (Watts per Watt) [reference 1 W/W = 3.412141156 Btu/Wh]
  - SEER-IP (Seasonal Energy Efficiency Ratio - US) [reference: measured in Btu/Wh]
  - COP-IP (Coefficient of performance - US) [reference: measured in Btu/Wh]
  - SEER-SI (Seasonal Energy Efficiency Ratio - International) [reference: measured in W/W]
  - COP-SI (Coefficient of performance - International) [reference: measured in W/W]
- Create a new `energy-efficiency.json` file and add the relevant conversion factors.
- Ensure that the new units are loaded in `configLoader.ts` as well.
- Add new unit tests in `energy-efficiency.test.ts` to verify conversions between these units.
- Run Prettier formater
- Run all tests
