import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cashly - Personal Finance Management",
    short_name: "Cashly",
    description:
      "Track your finances, manage your budget, and achieve your financial goals with ease.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#111113",
    theme_color: "#30a46c",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
