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
      const hrefAttributes = [];

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
            await driver.get(hrefAttribute); // Navigating to each URL
            // Find all table rows
            const rows = await driver.findElements(
              By.xpath('//table[@cellspacing="1"]/tbody')
            );
            console.log("39 : ", rows.length);
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];

              // Find all cells in the current row
              const cells = await row.findElements(By.tagName("tr"));

              // Array to hold data of the current row
              const rowData = [];

              // Loop through each cell in the current row
              for (let j = 1; j < cells.length; j++) {
                const cell = cells[j];

                // Get text content of the cell
                const cellText = await cell.getText();

                // Push the cell text to rowData array
                rowData.push(cellText);
              }

              // Log the rowData array, which contains data of the current row
              console.log("Row " + (i + 1) + " data:", rowData);
              //const nextPageButton = await driver.findElement(By.xpath('/html/body/form/table/tbody/tr[9]/td/div/input'));
              await driver.navigate().back(); // Come back to the original page
              await driver.sleep(2000);
            }

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
      for (const hrefAttribute of hrefAttributes) {
        await driver.get(hrefAttribute); // Navigating to each URL
        const rows = await driver.findElements(
          By.xpath("/html/body/form/table/tbody/tr")
        );

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const cells = await row.findElements(By.tagName("td"));
          console.log("cells :", cells);

          const rowData = [];

          for (const cell of cells) {
            try {
              const cellText = await cell.getText();

              // Try to find the <a> element inside the <td>
              const anchorElement = await cell.findElement(By.tagName("a"));

              // If an <a> element is found, get its attribute (e.g., href)
              const hrefAttribute = await anchorElement.getAttribute("href");
              rowData.push(cellText, hrefAttribute);
              // console.log(hrefAttribute);
              if (
                hrefAttribute &&
                !hrefAttribute.includes("www.eosclimate.com")
              ) {
                // Navigating to each URL if not www.eosclimate.com
                await driver.get(hrefAttribute);
                // Adding the hrefAttribute to hrefAttributes array
                hrefAttributes.push(hrefAttribute);
              } else {
                // If the href is www.eosclimate.com, just push the cell text
                rowData.push(cellText);
              }
            } catch (error) {
              // If no <a> element is found, get the text content of the <td>
              const cellText = await cell.getText();
              rowData.push(cellText);
            }
          }
          //const nextPageButton = await driver.findElement(By.xpath('/html/body/form/table/tbody/tr[9]/td/div/input'));
          await driver.navigate().back(); // Come back to the original page
          await driver.sleep(2000); // Optional sleep for stability
        }
      }
      // Add the data from the current page to the array
      allData.push(...pageData);
      console.log("all data", allData);
      //   const existingData = JSON.parse(fs.readFileSync('output.json'));
      //   existingData.push(...allData);

      //   const updatedJsonData = JSON.stringify(allData, null, 2);
      //   fs.writeFileSync('output.json', updatedJsonData);

      fs.writeFileSync("output1.json", JSON.stringify(allData, null, 2));
      existingData = JSON.parse(fs.readFileSync("output1.json"));
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
