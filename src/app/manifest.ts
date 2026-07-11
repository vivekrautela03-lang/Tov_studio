import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TheOldverse Productions",
    short_name: "TheOldverse",
    description: "AI-powered operating system for filmmakers, creative studios, and production houses.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090B",
    theme_color: "#3ecf8e",
    orientation: "any",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
