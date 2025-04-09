import fs from "fs/promises";
import path from "path";

async function getMarkdownLocalImageSyntaxInfo(mdPath, mdBody) {
  const mdImageSyntaxRegex = /!\[(.*?)\]\((.*?)\s*(?:"(.*?)")?\)/g;
  const imageSyntaxRegexResults = [...mdBody.matchAll(mdImageSyntaxRegex)].map(
    (result) => ({
      mdIdx: result.index,
      fullTextLen: result[0].length,
      alt: result[1],
      imgPath: result[2],
      mouseover: result[3],
    })
  );

  const imgSyntaxInfo = [];
  for (const rgxRes of imageSyntaxRegexResults) {
    const { imgPath } = rgxRes;

    if (imgPath.startsWith("http")) {
      continue;
    }
    const validImgPath = getMarkdownImagePath(mdPath, imgPath);
    try {
      await fs.access(validImgPath);
      imgSyntaxInfo.push({ ...rgxRes, validImgPath });
    } catch {
      continue;
    }
  }

  return imgSyntaxInfo;
}

function getMarkdownImagePath(mdPath, imgPathInMd) {
  if (path.isAbsolute(imgPathInMd)) {
    return imgPathInMd;
  }
  return path.join(path.dirname(mdPath), imgPathInMd);
}

export { getMarkdownLocalImageSyntaxInfo };
