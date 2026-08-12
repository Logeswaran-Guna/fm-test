import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://futureminds.in";

const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/find-tutor", priority: 0.9, changeFrequency: "weekly" },
  { path: "/become-a-tutor", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tutor-platform", priority: 0.8, changeFrequency: "monthly" },
  { path: "/creative-learning", priority: 0.8, changeFrequency: "monthly" },
  { path: "/ai-robotics", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soft-skills", priority: 0.8, changeFrequency: "monthly" },
  { path: "/academy", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
