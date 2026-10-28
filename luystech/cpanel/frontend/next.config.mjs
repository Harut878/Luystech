/** @type {import('next').NextConfig} */

// Ստատիկ export՝ `npm run build`-ը ստեղծում է `out/` թղթապանակը՝ սովորական
// HTML/CSS/JS ֆայլեր, որոնք դրվում են cPanel-ի public_html-ում։
// Անվտանգության header-ները (CSP և այլն) տրվում են .htaccess-ով (backend/.htaccess)։
const nextConfig = {
  output: "export",
  trailingSlash: true,          // /admin/texts/ → admin/texts/index.html (Apache-ի համար)
  images: { unoptimized: true },
};

export default nextConfig;
