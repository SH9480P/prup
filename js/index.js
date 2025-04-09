import { getMarkdownLocalImageSyntaxInfo } from "./image-syntax-seeker.js";
import { updateFile } from "./markdown-updater.js";
import { uploadFiles } from "./image-uploader.js";
import { throwIfInvalidMarkdown } from "./utils.js";

try {
  const mdPath = process.argv[2];

  await throwIfInvalidMarkdown(mdPath);

  const mdBody = (await fs.readFile(mdPath)).toString();

  const imageSyntaxInfo = getMarkdownLocalImageSyntaxInfo(mdPath, mdBody);

  if (imageSyntaxInfo.length > 0) {
    const uploadedImageUrls = await uploadFiles(
      imageSyntaxInfo.map((info) => info.validImgPath)
    );
    await updateFile(mdPath, mdBody, imageSyntaxInfo, uploadedImageUrls);
  }
} catch (error) {
  console.error(error);
  process.exit(1);
}
