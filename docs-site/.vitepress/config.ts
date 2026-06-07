import { defineConfig } from "vitepress";

export default defineConfig({
  title: "AI Studio SDK",
  description: "Enterprise AI Studio SDK documentation",
  themeConfig: {
    nav: [
      { text: "Getting Started", link: "/getting-started" },
      { text: "React", link: "/react-guide" },
      { text: "Vue", link: "/vue-guide" },
      { text: "Schema", link: "/schema-guide" }
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/getting-started" },
          { text: "Installation", link: "/installation" },
          { text: "React Guide", link: "/react-guide" },
          { text: "Vue Guide", link: "/vue-guide" },
          { text: "Schema Guide", link: "/schema-guide" },
          { text: "Provider Guide", link: "/provider-guide" },
          { text: "Plugin Guide", link: "/plugin-guide" },
          { text: "Workspace Guide", link: "/workspace-guide" },
          { text: "Examples", link: "/examples" },
          { text: "FAQ", link: "/faq" },
          { text: "Migration Guide", link: "/migration-guide" }
        ]
      }
    ]
  }
});
