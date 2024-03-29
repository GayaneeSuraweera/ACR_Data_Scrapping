const fs = require("fs");
const { By, Builder } = require("selenium-webdriver");

require("selenium-webdriver/chrome");

function saveJSONToFile(jsonContents, fileName) {
  fs.writeFileSync(fileName, jsonContents);
}
async function getDeveloper() {
  let driver = await new Builder().forBrowser("chrome").build();
  let columnData = [];
  try {
    const projectId = 247;
    await driver.get("https://acr2.apx.com/mymodule/reg/accview.asp?id1=247");
    const cellsDev = await driver.findElements(
      By.xpath("/html/body/form/table/tbody/tr/td[2]")
    );

    for (const cell of cellsDev) {
      const cellText = await cell.getText();
      columnData.push(cellText);
    }
    saveJSONToFile(
      JSON.stringify({
        company_Name: columnData[0],
        account_Type: columnData[1],
        contact_Name: columnData[2],
        company_City: columnData[3],
        company_State: columnData[4],
        company_Country: columnData[5],
        company_Website: columnData[6],
      }),
      `./developer_details/${projectId}.json`
    );
  } catch (error) {
    console.error(error);
  } finally {
    await driver.quit();
  }
}

getDeveloper();
