import puppeteer from "puppeteer";
import { delay } from "./utils";

import("@dotenvx/dotenvx/config");

const GITHUB_HOME_URL = "https://github.com/";
const GITHUB_LOGIN_URL = "https://github.com/login";
const GITHUB_NEW_ISSUE_URL =
  "https://github.com/SH9480P/bookish-octo-fortnight/issues/new";

async function loginGithub(page) {
  await page.goto(GITHUB_LOGIN_URL);

  await page.setViewport({ width: 1920, height: 1080 });

  await page.locator("#login_field").fill(process.env.GH_USERNAME || "1");
  await page.locator("#password").fill(process.env.GH_PASSWORD || "2");

  await page.locator('.position-relative > input[type="submit"]').click();

  await waitLoginSubmitted(page);
}

async function waitLoginSubmitted(page) {
  let submitFlag = false;
  const checkMaxNum = 20;
  let i = 0;
  while (!submitFlag && i < checkMaxNum) {
    await delay(400);
    const curUrl = page.url();
    if (curUrl !== GITHUB_LOGIN_URL) {
      if (curUrl === GITHUB_HOME_URL) {
        submitFlag = true;
      }
      break;
    }
    i++;
  }
  if (!submitFlag) {
    throw new Error("Login Failed.");
  }
}

async function waitUploadComplete(page) {
  let completeFlag = false;
  const checkMaxNum = 40;
  let i = 0;
  while (!completeFlag && i < checkMaxNum) {
    await delay(500);
    const lines = await getTextLines(page);
    const regex = /<!--.*?-->/;
    if (lines.every((l) => !regex.test(l))) {
      completeFlag = true;
    }
    i++;
  }
  if (!completeFlag) {
    throw new Error("Image upload to GitHub timed out after 20 seconds");
  }
}

async function getTextLines(page) {
  const textareaSelector = await page.waitForSelector("fieldset textarea");
  const fullText = await textareaSelector.evaluate(($el) => $el.value);
  return fullText.trim().split("\n");
}

function getUrls(lines) {
  const regex = /!\[.*?\]\((.*?)\)/;
  return lines.reduce((acc, cur) => {
    const match = cur.match(regex);
    return match != null ? [...acc, match[1]] : acc;
  }, []);
}

async function usePage(callback) {
  let err = null;
  const browser = await puppeteer.launch({ headless: false });
  try {
    const page = await browser.newPage();
    await callback(page);
  } catch (error) {
    err = error;
  } finally {
    await browser.close();
    if (err) {
      throw err;
    }
  }
}

async function uploadFiles(filePaths) {
  let urls = [];

  await usePage(async (page) => {
    await loginGithub(page);

    await page.goto(GITHUB_NEW_ISSUE_URL);

    await delay(500);

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click("fieldset footer button"),
    ]);

    await fileChooser.accept(filePaths);

    await waitUploadComplete(page);

    const textLines = await getTextLines(page);
    urls = getUrls(textLines);
  });

  return urls;
}

export { uploadFiles };
