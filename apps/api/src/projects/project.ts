export interface Project {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  url: string;
  repoUrl?: string;
  // Path on the web app; the v1 site's images are served from /v1/images
  image: string;
}
