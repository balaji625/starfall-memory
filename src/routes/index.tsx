import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/components/Experience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For Vijaya · A Cinematic Birthday Memory" },
      { name: "description", content: "An interactive cinematic story for someone who became my world." },
      { property: "og:title", content: "For Vijaya · A Cinematic Birthday Memory" },
      { property: "og:description", content: "An interactive cinematic story for someone who became my world." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&family=Inter:wght@300;400;500&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Experience />;
}
