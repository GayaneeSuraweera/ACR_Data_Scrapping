const { log } = require("console");
const fs = require("fs");
const { By, Builder } = require("selenium-webdriver");
const { until } = require("selenium-webdriver");
require("selenium-webdriver/chrome");
async function ACR_webscraping() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("https://acr2.apx.com/myModule/rpt/myrpt.asp?r=111");
    const allData = [];
    while (true) {
      const rows = await driver.findElements(By.xpath("//table/tbody/tr"));
      const pageData = [];
      // Extract header row
      const headerRow = await rows[4].findElements(By.css("td"));
      const headers = [];
      for (let i = 0; i < headerRow.length; i++) {
        const headerText = await headerRow[i].getText();
        const jsonStyleKey = headerText
          .toLowerCase()
          .replace(/\s+/g, "_") // Replace spaces with underscores
          .replace(/_+$/, ""); // Remove any trailing underscores
        headers.push(jsonStyleKey);
      }
      for (let i = 5; i < rows.length - 4; i++) {
        const row = rows[i];
        const cells = await row.findElements(By.css("td"));
        const rowData = [];
        for (let j = 0; j < cells.length; j++) {
          const cell = cells[j];
          try {
            const anchorElement = await cell.findElement(By.css("a"));
            const hrefAttribute = await anchorElement.getAttribute("href");
            rowData[headers[j]] = hrefAttribute;
          } catch (error) {
            const cellText = await cell.getText();
            rowData[headers[j]] = cellText;
          }
        }
        //    console.log(rowData?.project_id)
        const data = {
          project_id: rowData?.project_id,
          "compliance_program_id_(arb_or_ecology)":
            rowData["compliance_program_id_(arb_or_ecology)"],
          project_developer: rowData?.project_developer,
          project_name: rowData?.project_name,
          project_type: rowData?.project_type,
          "project_methodology/protocol":
            rowData["project_methodology/protocol"],
          current_crediting_period_start_date:
            rowData?.current_crediting_period_start_date,
          current_crediting_period_end_date:
            rowData?.current_crediting_period_end_date,
          voluntary_status: rowData?.voluntary_status,
          "compliance_program_status_(arb_or_ecology)":
            rowData["compliance_program_status_(arb_or_ecology)"],
          project_status_date: rowData?.project_status_date,
          project_site_location: rowData?.project_site_location,
          project_site_state: rowData?.project_site_state,
          project_site_country: rowData?.project_site_country,
          "sustainable_development_goal(s)":
            rowData["sustainable_development_goal(s)"],
          current_vvb: rowData?.current_vvb,
          acr_project_validation: rowData?.acr_project_validation,
          total_number_of_credits_registered:
            rowData?.total_number_of_credits_registered,
          documents: rowData?.documents,
          project_website: rowData["project_website"],
        };
        // const jsonObject = Object.assign({}, ...rowData);
        // console.log(JSON.stringify(jsonObject, null, 2));
        // const rowDataJson = JSON.stringify(rowData);
        pageData.push(data);
        console.log(data);
      }
      // Add the data from the current page to the array
      allData.push(...pageData);
      console.log("all data", allData);
      //   const existingData = JSON.parse(fs.readFileSync('output.json'));
      //   existingData.push(...allData);
      //   const updatedJsonData = JSON.stringify(allData, null, 2);
      //   fs.writeFileSync('output.json', updatedJsonData);
      fs.writeFileSync("output.json", JSON.stringify(allData, null, 2));
      existingData = JSON.parse(fs.readFileSync("output.json"));
      //   const combinedData = existingData.concat(pageData);
      //   fs.writeFileSync("output.json", JSON.stringify(combinedData, null, 2));
      // Print data for the current page
      //   console.log(
      //     `Data for page ${allData.length / (rows.length - 9)}:`,
      //     pageData
      //   );
      const nextPageButton = await driver.findElement(By.id("x999nextbutton2"));
      // Check the src attribute of the next page button
      const nextButtonSrc = await nextPageButton.getAttribute("src");
      // Click the next page button only if it has the expected src
      if (nextButtonSrc === "https://acr2.apx.com/ImgTable/next.gif") {
        await nextPageButton.click();
        await driver.sleep(2000);
        console.log("Data going to the next page");
      } else {
        console.log("Quit");
        break;
      }
    }
  } finally {
    await driver.quit();
  }
}
ACR_webscraping();
