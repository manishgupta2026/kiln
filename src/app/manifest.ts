import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DigiGrantha — Digital Product & Web Studio",
    short_name: "DigiGrantha",
    description:
      "Bespoke digital product & web development studio. We design, engineer, and ship high-performance web applications and digital platforms.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7EE",
    theme_color: "#0F5C52",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

