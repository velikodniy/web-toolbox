import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Inline script to set theme before paint (prevents flash)
const themeScript = `
(function() {
  var theme = localStorage.getItem('theme');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`.trim();

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'Toolbox',
    tags: [
      {
        tag: 'script',
        children: themeScript,
        head: true,
        append: false, // Prepend to head (runs before CSS)
      },
    ],
  },
});
