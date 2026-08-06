// Corta e redimensiona no navegador, antes do upload — a imagem que chega no Storage já
// nasce no formato certo (4:3). Evita depender de otimização de imagem em tempo de request
// (ex. next/image na Vercel) pra decidir o crop; o arquivo salvo já é a versão final.

const TARGET_RATIO = 4 / 3;
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.85;

function loadImage(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    img.src = url;
  });
}

/** Corta ao centro pra 4:3 e redimensiona (sem ampliar imagens menores), virando um JPEG. */
export async function cropToProductRatio(file: File): Promise<File> {
  const { img, url } = await loadImage(file);
  try {
    const sourceRatio = img.width / img.height;

    let cropWidth = img.width;
    let cropHeight = img.height;
    if (sourceRatio > TARGET_RATIO) {
      cropWidth = img.height * TARGET_RATIO;
    } else {
      cropHeight = img.width / TARGET_RATIO;
    }
    const cropX = (img.width - cropWidth) / 2;
    const cropY = (img.height - cropHeight) / 2;

    const outputWidth = Math.round(Math.min(cropWidth, MAX_WIDTH));
    const outputHeight = Math.round(outputWidth / TARGET_RATIO);

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "produto";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}
