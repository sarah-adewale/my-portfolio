export interface Project {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  kind: 'project' | 'tool';
  // Shown on the homepage, in this order
  featured?: boolean;
  url?: string;
  repoUrl?: string;
  // Paths on the web app. `logo` is a white silhouette tinted by the theme; without one
  // the tile shows a monogram.
  logo?: string;
  preview?: string;
}
