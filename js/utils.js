async function throwIfInvalidMarkdown(filePath) {
  if (filePath == undefined) {
    throw new Error(
      "File path is not provided. Please provide a markdown file path."
    );
  }
  if (path.extname(filePath) !== ".md") {
    throw new Error(
      `File "${filePath}" is not a markdown file. Please provide a file with .md extension.`
    );
  }

  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`File "${filePath}" does not exist.`);
  }
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { throwIfInvalidMarkdown, delay };
