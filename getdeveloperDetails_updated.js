const fs = require("fs");
const { Builder, By } = require("selenium-webdriver");
require("chromedriver");

async function scrapeTableData(projectDetailsList) {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    for (const projectDetails of projectDetailsList) {
      let projectId = projectDetails.projectId;
      let projectDeveloperLink = projectDetails.Project_Developer;
      await driver.get(projectDeveloperLink);

      // Find all rows in the table
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
        `./developer_details/${projectId}.json`,
        JSON.stringify(tableData)
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.quit();
  }
}

// Example usage:
const url = "https://example.com/table";
const outputFile = "table_data.json";
scrapeTableData(url, outputFile);
