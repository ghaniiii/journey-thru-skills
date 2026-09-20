import { createFileRoute } from "@tanstack/react-router";
import { GameCanvas } from "@/components/GameCanvas";
import { portfolio } from "@/data/portfolio";

const title = `${portfolio.personal.name} — Software Engineer | Interactive 3D Portfolio`;
const description =
  "Drive through an interactive 3D world to explore Abdul Ghani Khan's education, internships, machine learning projects, quantum research and contact details.";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GameCanvas,
});
