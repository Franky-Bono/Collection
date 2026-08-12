const MAX_WIDTH = 200;
const JPEG_QUALITY = 0.7;

export async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    const scale = Math.min(1, MAX_WIDTH / imageBitmap.width);
    const w = Math.round(imageBitmap.width * scale);
    const h = Math.round(imageBitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(imageBitmap, 0, 0, w, h);
    imageBitmap.close();

    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return url;
  }
}
