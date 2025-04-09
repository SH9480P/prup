import fs from "fs/promises";

function createImageSyntax(altText, imgURL, mouseoverText) {
  return mouseoverText == null
    ? `![${altText}](${imgURL})`
    : `![${altText}](${imgURL} "${mouseoverText}")`;
}

async function replaceImageSyntax(mdBody, imageSyntaxInfo, uploadedImageUrls) {
  for (const [idx, { mdIdx, fullTextLen, alt, mouseover }] of imageSyntaxInfo
    .toReversed()
    .entries()) {
    const url = uploadedImageUrls[idx];
    const before = mdBody.slice(0, mdIdx);
    const newImageSyntax = createImageSyntax(alt, url, mouseover);
    const after = mdBody.slice(mdIdx + fullTextLen);
    mdBody = `${before}${newImageSyntax}${after}`;
  }
  return mdBody;
}

async function updateFile(mdPath, mdBody, imageSyntaxInfo, uploadedImageUrls) {
  const replacedMdBody = await replaceImageSyntax(
    mdBody,
    imageSyntaxInfo,
    uploadedImageUrls
  );
  await fs.writeFile(mdPath, replacedMdBody);
}

export { updateFile };
