import { defineConfig } from "astro/config";

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: "https://rootenginear.github.io",
  base: "/gh-issues-cms",
  integrations: [
    compress({
      html: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
      },
      img: false,
    }),
  ],
});
