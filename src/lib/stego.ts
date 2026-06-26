// LSB steganography on PNG via Canvas.
// Layout in image bytes (R,G,B channels of every pixel, alpha untouched):
//   magic "SVP1" (4 bytes) | payload length uint32 BE (4 bytes) | payload
// One byte = 8 pixels, 1 bit per R/G/B (but we use only R-channel LSB,
// pixel-by-pixel, for simplicity and maximum compatibility).

const MAGIC = "SVP1";

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load carrier image."));
      img.src = url;
    });
  } finally {
    // Revoke after image used
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function imageToCanvas(img: HTMLImageElement): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; data: ImageData } {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D unavailable.");
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { canvas, ctx, data };
}

export function capacityBytes(width: number, height: number): number {
  // 3 LSB per pixel / 8 bits per byte, minus 8-byte header
  return Math.floor((width * height * 3) / 8) - 8;
}

export async function getCarrierInfo(file: File): Promise<{ width: number; height: number; capacity: number }> {
  const img = await loadImage(file);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    capacity: capacityBytes(img.naturalWidth, img.naturalHeight),
  };
}

function writeBits(buf: Uint8ClampedArray, payload: Uint8Array): void {
  let bitIdx = 0;
  const totalBits = payload.length * 8;
  for (let p = 0; p < buf.length && bitIdx < totalBits; p += 4) {
    for (let ch = 0; ch < 3 && bitIdx < totalBits; ch++) {
      const byte = payload[bitIdx >> 3];
      const bit = (byte >> (7 - (bitIdx & 7))) & 1;
      buf[p + ch] = (buf[p + ch] & 0xfe) | bit;
      bitIdx++;
    }
  }
}

function readBits(buf: Uint8ClampedArray, byteCount: number): Uint8Array {
  const out = new Uint8Array(byteCount);
  let bitIdx = 0;
  const totalBits = byteCount * 8;
  for (let p = 0; p < buf.length && bitIdx < totalBits; p += 4) {
    for (let ch = 0; ch < 3 && bitIdx < totalBits; ch++) {
      const bit = buf[p + ch] & 1;
      const byteI = bitIdx >> 3;
      out[byteI] = (out[byteI] << 1) | bit;
      bitIdx++;
    }
  }
  return out;
}

export async function embedPayload(carrier: File, payload: Uint8Array): Promise<Blob> {
  const img = await loadImage(carrier);
  const { canvas, ctx, data } = imageToCanvas(img);
  const cap = capacityBytes(canvas.width, canvas.height);
  if (payload.length > cap) {
    throw new Error(`Payload too large. Capacity: ${cap} bytes, payload: ${payload.length} bytes.`);
  }

  // Build header
  const header = new Uint8Array(8);
  header.set(new TextEncoder().encode(MAGIC), 0);
  new DataView(header.buffer).setUint32(4, payload.length, false);

  const full = new Uint8Array(header.length + payload.length);
  full.set(header, 0);
  full.set(payload, header.length);

  writeBits(data.data, full);
  ctx.putImageData(data, 0, 0);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Failed to encode PNG."));
      else resolve(blob);
    }, "image/png");
  });
}

export async function extractPayload(stego: File): Promise<Uint8Array> {
  const img = await loadImage(stego);
  const { data } = imageToCanvas(img);

  const header = readBits(data.data, 8);
  const magic = new TextDecoder().decode(header.slice(0, 4));
  if (magic !== MAGIC) {
    throw new Error("No StegaVault payload detected in this image.");
  }
  const len = new DataView(header.buffer).getUint32(4, false);
  const cap = capacityBytes(img.naturalWidth, img.naturalHeight);
  if (len <= 0 || len > cap) {
    throw new Error("Corrupted payload header.");
  }

  // Read header + payload together to avoid re-walking
  const all = readBits(data.data, 8 + len);
  return all.slice(8);
}
