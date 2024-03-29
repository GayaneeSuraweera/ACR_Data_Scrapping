const { Builder, By } = require("selenium-webdriver");
require("selenium-webdriver/chrome");
const fs = require("fs");

async function getDocumentDetails(list) {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    for (const projectdocumentDetails of list) {
      let projectId = projectdocumentDetails.projectId;
      let projectdocumentLinks = projectdocumentDetails.document;
      await driver.get(projectdocumentLinks);
      const table = await driver.findElement(
        By.xpath("/html/body/table[2]/tbody/tr[4]/td/form/table/tbody")
      );
      const rows = await table.findElements(By.css("tr"));
      console.log(rows);

      // Extract the header row to use as keys in the JSON object
      const headerRow = rows[1]; // Select the fourth row (index 3) as the header row
      const headerCells = await headerRow.findElements(By.css("td"));
      const keys = [];
      for (let cell of headerCells) {
        const key = await cell.getText();
        keys.push(key);
      }

      // Iterate over each row starting from the fifth row
      const tableData = [];
      for (let i = 2; i < rows.length; i++) {
        // Start from index 4 to skip the header rows
        const rowCells = await rows[i].findElements(By.css("td"));
        const rowData = {};
        for (let j = 0; j < keys.length; j++) {
          // Add error handling to ensure the cell content is properly retrieved
          try {
            const value = await rowCells[j].getText();
            rowData[keys[j]] = value;
          } catch (error) {
            console.error("Error retrieving cell content:", error);
          }
        }
        tableData.push(rowData);
      }

      // Write the tableData array to a JSON file
      fs.writeFileSync(
        `./documents/table_data${projectId}.json`,
        JSON.stringify(tableData)
      );
    }

    // Find the table rows directly
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.quit();
  }
}

getDocumentDetails();
