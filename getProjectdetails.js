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
      let columnData = [];
      const cellName = await driver.findElements(
        By.xpath("/html/body/form/table/tbody/tr")
      );
      for (const cell of cellName) {
        const cellText = await cell.getText();
        columnData.push(cellText);
      }
      saveJSONToFile(
        JSON.stringify({
          Project_id: columnData[0],
          ARB_ID: columnData[1],
          Project_Name: columnData[2],
          Project_Type: columnData[3],
          Start_Date_Offset_Project_Commencement: columnData[4],
          Project_Reporting_Start_Date: columnData[5],
          Project_Website: columnData[6],
          Project_Site_Location: columnData[7],
          Project_Site_State: columnData[8],
          Project_Site_Country: columnData[9],
          Project_State: columnData[10],
          Project_Registration: columnData[11],
          document: columnData[12],
        }),
        `./project_name_details/${projectId}.json`
      );
    }
  } catch (error) {
    console.error(error);
  } finally {
    await driver.quit();
  }
}

getDeveloper();
