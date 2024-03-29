const fs = require("fs");
const { By, Builder } = require("selenium-webdriver");
require("selenium-webdriver/chrome");

function getProjectId(data = "") {
  if (data.length) {
    return data.replace("ACR", "");
  }
  return null;
}

function saveJSONToFile(jsonContents, fileName) {
  fs.writeFileSync(fileName, jsonContents);
}

let projectDeveloperList = [];
let projectNameLinkList = [];
let projectDocumentList = [];

async function ACR_webscraping() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("https://acr2.apx.com/myModule/rpt/myrpt.asp?r=111");
    while (true) {
      const rows = await driver.findElements(By.xpath("//table/tbody/tr"));
      for (let i = 5; i < rows.length - 4; i++) {
        try {
          const row = rows[i];
          const cells = await row.findElements(By.css("td"));
          const projectId = getProjectId(await cells[0].getText());
          const anchorElement = await cells[2].findElement(By.css("a"));
          const Project_Developer = await anchorElement.getAttribute("href");
          const anchorElement2 = await cells[3].findElement(By.css("a"));
          const Project_Name = await anchorElement2.getAttribute("href");
          const document = await getHrefAttribute(cells[18], driver);

          projectDeveloperList.push({ projectId, Project_Developer });
          projectNameLinkList.push({ projectId, Project_Name });
          projectDocumentList.push({ projectId, document });
        } catch (error) {
          // Handle StaleElementReferenceError by refreshing the page
          if (error.name === "StaleElementReferenceError") {
            console.log("Stale element detected. Refreshing page...");
            await driver.navigate().refresh();
            console.log("Page refreshed. Re-locating elements...");
            continue; // Continue to the next iteration of the loop
          }
          throw error; // Re-throw any other errors
        }
      }

      const nextPageButton = await driver.findElement(By.id("x999nextbutton2"));
      const nextButtonSrc = await nextPageButton.getAttribute("src");

      if (nextButtonSrc === "https://acr2.apx.com/ImgTable/next.gif") {
        await nextPageButton.click();
        await driver.sleep(2000);
        console.log("Data going to the next page");
      } else {
        console.log("No more pages. Exiting loop.");
        break;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await driver.quit();
  }
}
async function getProjectDetails(list) {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    for (const projectNameDetails of list) {
      let projectId = projectNameDetails.projectId; // Corrected
      let projectNameLink = projectNameDetails.Project_Name; // Corrected
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

// async function getDeveloperDetails(projectDetailsList) {
//   let driver = await new Builder().forBrowser("chrome").build();

//   try {
//     for (const projectDetails of projectDetailsList) {
//       let projectId = projectDetails.projectId;
//       let projectDeveloperLink = projectDetails.Project_Developer;
//       await driver.get(projectDeveloperLink);

//       // Find all rows in the table
//       const rows = await driver.findElements(
//         By.xpath("/html/body/form/table/tbody/tr")
//       );

//       // Initialize an empty object to store the table data
//       const tableData = {};

//       // Iterate over each row of the table
//       for (const row of rows) {
//         // Find cells in the current row
//         const cells = await row.findElements(By.css("td"));

//         // Ensure there are exactly two cells (two-column table)
//         if (cells.length === 2) {
//           // Extract text content from the cells
//           const key = await cells[0].getText();
//           const value = await cells[1].getText();

//           // Store key-value pair in the tableData object
//           tableData[key] = value;
//         }
//       }
//       fs.writeFileSync(
//         `./developer_details/${projectId}.json`,
//         JSON.stringify(tableData)
//       );
//     }
//   } catch (error) {
//     console.error("Error:", error);
//   } finally {
//     await driver.quit();
//   }
// }
async function getHrefAttribute(cell, driver) {
  try {
    const anchorElement = await cell.findElement(By.css("a"));
    return await anchorElement.getAttribute("href");
  } catch (error) {
    // If anchor element not found, return empty string
    return "";
  }
}
async function getDocumentDetails(list) {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    for (const projectdocumentDetails of list) {
      let projectId = projectdocumentDetails.projectId;
      let projectdocumentLinks = projectdocumentDetails.document;
      if (projectdocumentLinks === "") {
        // Skip processing if document link is empty
        console.log(
          `Skipping empty document link for project ID: ${projectId}`
        );
        continue;
      }
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
async function runScrapingAndDetails() {
  await ACR_webscraping();
  await getDeveloperDetails(projectDeveloperList);
  await getProjectDetails(projectNameLinkList);

  // Filter out entries with empty document links
  const filteredProjectDocumentList = projectDocumentList.filter(
    (item) => item.document !== ""
  );

  await getDocumentDetails(filteredProjectDocumentList);
}

runScrapingAndDetails();
