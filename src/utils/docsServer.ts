import { marked } from "marked";
import fs from "fs";
import path from "path";

interface NavItem {
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Load navigation structure from nav.json
 */
export function loadNavigation(docsDir: string): NavSection[] {
  const navPath = path.resolve(docsDir, "nav.json");
  const navContent = fs.readFileSync(navPath, "utf-8");
  return JSON.parse(navContent);
}

/**
 * Generate sidebar HTML from navigation
 */
export function generateSidebar(
  nav: NavSection[],
  currentPath: string
): string {
  let html = '<nav class="sidebar">\n';
  html += '  <div class="sidebar-header">\n';
  html += "    <h2>SyncNexa SAuth 1.0</h2>\n";
  html += "  </div>\n";
  html += '  <ul class="nav-list">\n';

  for (const section of nav) {
    html += `    <li class="nav-section">\n`;
    html += `      <span class="section-title">${section.title}</span>\n`;
    html += `      <ul class="nav-items">\n`;

    for (const item of section.items) {
      const isActive = currentPath === `/${item.path}`;
      const activeClass = isActive ? " active" : "";
      html += `        <li><a href="/docs/${item.path}" class="nav-link${activeClass}">${item.label}</a></li>\n`;
    }

    html += `      </ul>\n`;
    html += `    </li>\n`;
  }

  html += "  </ul>\n";
  html += "</nav>\n";
  return html;
}

/**
 * Convert markdown file to HTML with layout
 */
export async function markdownToHtml(
  filePath: string,
  docsDir: string,
  currentPath: string
): Promise<string> {
  const content = fs.readFileSync(filePath, "utf-8");
  const html = await marked(content);
  const nav = loadNavigation(docsDir);
  const sidebar = generateSidebar(nav, currentPath);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SyncNexa SAuth 1.0 Developer Docs</title>
  <style>
    :root {
      --primary: #04D69D;
      --dark-bg: #f5f5f5;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: var(--dark-bg);
    }

    .container {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 260px;
      height: 100vh;
      background: white;
      border-right: 1px solid #e0e0e0;
      overflow-y: auto;
      padding: 20px 0;
      z-index: 100;
    }

    .sidebar-header {
      padding: 0 20px 20px;
      border-bottom: 2px solid var(--primary);
      margin-bottom: 20px;
    }

    .sidebar-header h2 {
      font-size: 18px;
      color: #000;
      font-weight: 600;
    }

    .nav-list {
      list-style: none;
    }

    .nav-section {
      margin-bottom: 20px;
    }

    .section-title {
      display: block;
      padding: 8px 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 0.5px;
    }

    .nav-items {
      list-style: none;
    }

    .nav-link {
      display: block;
      padding: 8px 20px;
      color: #333;
      text-decoration: none;
      font-size: 14px;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .nav-link:hover {
      background-color: #f5f5f5;
      color: var(--primary);
    }

    .nav-link.active {
      color: var(--primary);
      border-left-color: var(--primary);
      background-color: #f0fdf9;
    }

    main {
      margin-left: 260px;
      flex: 1;
      padding: 40px;
      background: white;
      max-width: 900px;
    }

    main h1 {
      color: #000;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid var(--primary);
    }

    main h2 {
      color: #000;
      margin-top: 30px;
      margin-bottom: 15px;
    }

    main h3 {
      color: #000;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    main p {
      margin-bottom: 15px;
    }

    main code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: "Courier New", monospace;
      font-size: 14px;
    }

    main pre {
      background: #f0f0f0;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
      font-size: 13px;
    }

    main pre code {
      background: none;
      padding: 0;
    }

    main a {
      color: var(--primary);
      text-decoration: none;
    }

    main a:hover {
      text-decoration: underline;
    }

    main blockquote {
      border-left: 4px solid var(--primary);
      padding-left: 15px;
      margin: 15px 0;
      color: #666;
      font-style: italic;
    }

    main table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
    }

    main table th,
    main table td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }

    main table th {
      background: #f9f9f9;
      font-weight: 600;
    }

    main ul,
    main ol {
      margin: 15px 0 15px 30px;
    }

    main li {
      margin-bottom: 8px;
    }

    /* Scrollbar styling */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: #aaa;
    }

    @media (max-width: 768px) {
      .container {
        flex-direction: column;
      }

      .sidebar {
        position: relative;
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
      }

      main {
        margin-left: 0;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${sidebar}
    <main>
      ${html}
    </main>
  </div>
</body>
</html>`;
}

/**
 * Get markdown file path relative to docs directory
 */
export function getDocPath(fileName: string, docsDir: string): string {
  // Sanitize: remove leading slashes and ensure .md extension
  const clean = fileName.replace(/^\/+/, "").replace(/\.html?$/, "");
  const filePath = path.resolve(docsDir, `${clean}.md`);

  // Prevent directory traversal
  if (!filePath.startsWith(docsDir)) {
    throw new Error("Invalid path");
  }

  return filePath;
}
