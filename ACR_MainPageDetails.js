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
          const projectId = await getProjectId(await cells[0].getText());
          const Compliance_Program_ID_ARB_or_Ecology = await cells[1].getText();
          const Project_Developer = await getHrefAttribute(cells[2], driver);
          const Project_Name = await getHrefAttribute(cells[3], driver);
          const Project_Type = await cells[4].getText();
          const project_methodology_protocol = await cells[5].getText();
          const current_crediting_period_start_date = await cells[6].getText();
          const current_crediting_period_end_date = await cells[7].getText();
          const voluntary_status = await cells[8].getText();
          const compliance_program_status_arb_or_ecology =
            await cells[9].getText();
          const project_status_date = await cells[10].getText();
          const project_site_location = await cells[11].getText();
          const project_site_state = await cells[12].getText();
          const project_site_country = await cells[13].getText();
          const sustainable_development_goal = await cells[14].getText();
          const current_vvb = await cells[15].getText();
          const acr_project_validation = await cells[16].getText();
          const total_number_of_credits_registered = await cells[17].getText();
          const document = await getHrefAttribute(cells[18], driver);
          const project_website = await getHrefAttribute(cells[19], driver);

          saveJSONToFile(
            JSON.stringify({
              project_id: projectId,
              compliance_program_id: Compliance_Program_ID_ARB_or_Ecology,
              project_developer: Project_Developer,
              project_name: Project_Name,
              project_type: Project_Type,
              project_methodology_protocol: project_methodology_protocol,
              current_crediting_period_start_date:
                current_crediting_period_start_date,
              current_crediting_period_end_date:
                current_crediting_period_end_date,
              voluntary_status: voluntary_status,
              compliance_program_status:
                compliance_program_status_arb_or_ecology,
              project_status_date: project_status_date,
              project_site_location: project_site_location,
              project_site_state: project_site_state,
              project_site_country: project_site_country,
              sustainable_development_goal: sustainable_development_goal,
              current_vvb: current_vvb,
              acr_project_validation: acr_project_validation,
              total_number_of_credits_registered:
                total_number_of_credits_registered,
              documents: document,
              project_website: project_website,
            }),
            `./project02/${projectId}.json`
          );
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

async function getHrefAttribute(cell, driver) {
  try {
    const anchorElement = await cell.findElement(By.css("a"));
    return await anchorElement.getAttribute("href");
  } catch (error) {
    // If anchor element not found, return empty string
    return "";
  }
}

ACR_webscraping();
