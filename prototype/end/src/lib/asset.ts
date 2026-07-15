// GitHub Pages 部署在 /<repo>/ 子路徑下，next/image 不會自動為 public/ 圖片
// 補上 basePath，因此所有 /assets 圖片路徑都要透過這個 helper 加前綴。
// 本機開發時 NEXT_PUBLIC_BASE_PATH 為空字串，路徑維持原樣。
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
