export type CmsImageOpts = {
  width?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png";
};

export function cmsAssetUrl(
  cmsBaseUrl: string,
  fileId: string,
  opts: CmsImageOpts = {}
) {
  const url = new URL(`/assets/${fileId}`, cmsBaseUrl);
  url.searchParams.set("width", String(opts.width ?? 1600));
  url.searchParams.set("quality", String(opts.quality ?? 80));
  url.searchParams.set("format", opts.format ?? "webp");
  return url.toString();
}
