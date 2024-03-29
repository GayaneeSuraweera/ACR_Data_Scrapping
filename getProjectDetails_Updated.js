const fs = require("fs");
const { By, Builder } = require("selenium-webdriver");
const { until } = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
require("selenium-webdriver/chrome");

function saveJSONToFile(jsonContents, fileName) {
  fs.writeFileSync(fileName, jsonContents);
}
async function getProjectNameDetails(list) {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    for (const ProjectNameDetails of list) {
      let projectId = ProjectNameDetails.list;
      let projectNameLink = ProjectNameDetails.list;
      await driver.get(projectNameLink);
      const rows = await driver.findElements(
        By.xpath("/html/body/form/table/tbody/tr")
      );

      // Initialize an empty object to store the table data
      const tableData = {};

      // Iterate over each row of the table
      for (const row of rows) {
        // Find cells in the current row
        const cells = await row.findElements(By.css("td"));

        // Ensure there are exactly two cells (two-column table)
        if (cells.length === 2) {
          // Extract text content from the cells
          const key = await cells[0].getText();
          const value = await cells[1].getText();

          // Store key-value pair in the tableData object
          tableData[key] = value;
        }
      }
      fs.writeFileSync(
        `./project_details/${projectId}.json`,
        JSON.stringify(tableData)
      );
    }
  } catch (error) {
    console.error(error);
  } finally {
    await driver.quit();
  }
}

getDeveloper();
