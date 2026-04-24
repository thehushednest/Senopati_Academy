/** @type {import('next').NextConfig} */

const cmsURL = process.env.NEXT_PUBLIC_CMS_URL || "https://cms.asksenopati.com";
const mediaURL = process.env.NEXT_PUBLIC_MEDIA_URL || "https://news.asksenopati.com";

const toRemotePattern = (value) => {
  if (!value) return null;

  const parsed = new URL(value);

  return {
    protocol: parsed.protocol.replace(":", ""),
    hostname: parsed.hostname,
    port: parsed.port
  };
};

const nextConfig = {
  reactStrictMode: true,
  // Production deploy: Docker multi-stage runtime image.
  output: "standalone",
  images: {
    remotePatterns: [
      toRemotePattern(cmsURL),
      toRemotePattern(mediaURL),
      { protocol: "https", hostname: "rumahpintar.co.id" }
    ].filter(Boolean)
  }
};

export default nextConfig;
