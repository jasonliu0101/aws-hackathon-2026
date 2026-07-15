/** @type {import('next').NextConfig} */

// GitHub Pages 部署在 https://<user>.github.io/<repo>/ 子路徑下，
// 需要 basePath / assetPrefix。本機開發 (next dev) 不套用，避免路徑改變。
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repo = "AWS-hackathon";

const nextConfig = {
  reactStrictMode: true,
  // 靜態匯出：產生純前端 out/ 供 GitHub Pages 託管
  output: "export",
  // GitHub Pages 沒有 Next.js 影像最佳化伺服器，必須關閉
  images: { unoptimized: true },
  // 讓每頁輸出 index.html，Pages 路由更穩定
  trailingSlash: true,
  // 傳給前端，讓 asset() helper 為 public/ 圖片補上 basePath
  env: { NEXT_PUBLIC_BASE_PATH: isGithubPages ? `/${repo}` : "" },
  ...(isGithubPages ? { basePath: `/${repo}`, assetPrefix: `/${repo}/` } : {}),
};

export default nextConfig;
