export const getPublicPath = (path: string) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  // 1. If the path is already an absolute URL (starts with http), return it
  if (path.startsWith("http")) return path;

  // 2. If the path is already absolute for the current domain (starts with /)
  if (path.startsWith("/")) {
    // If we are on GitHub Pages (basePath exists), we must prepend it
    if (basePath) {
      // Prevent double slashes (e.g., //nextjstemtemplate//image.jpg)
      return `${basePath}${path.startsWith("/") ? path : "/" + path}`;
    }
    return path;
  }

  // 3. If it's a relative path (no leading slash), prepend the base path
  return `${basePath}/${path}`;
};
