import { withMermaid } from "vitepress-plugin-mermaid";

const { BASE: base = "/" } = process.env;

// https://vitepress.dev/reference/site-config
export default withMermaid({
  lang: "en-US",
  title: "LazyChain",
  description: "Enhaced NFTs community",
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  base: base,
  sitemap: {
    hostname: "https://lazy.fun/",
  },

  head: [
    ["link", { rel: "icon", href: "/img/favicon.svg", type: "image/svg+xml" }],
    ["link", { rel: "icon", href: "/img/favicon.png", type: "image/png" }],
    [
      "link",
      { rel: "shortcut icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    ["meta", { name: "msapplication-TileColor", content: "#fff" }],
    ["meta", { name: "theme-color", content: "#228B22" }],
    [
      "meta",
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
      },
    ],
    [
      "meta",
      {
        property: "description",
        content: "Enhaced NFTs community",
      },
    ],
    ["meta", { httpEquiv: "Content-Language", content: "en" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: "/img/lazy-cover.jpg" }],
    ["meta", { name: "twitter:site:domain", content: "CelestineSloths" }],
    ["meta", { name: "twitter:url", content: "https://lazy.fun" }],
    ["meta", { name: "og:image", content: "/img/lazy-cover.jpg" }],
    ["meta", { name: "apple-mobile-web-app-title", content: "LazyChain" }],
    // TODO upload documentation to chatbot
    // [
    //   "script",
    //   {},
    //   `
    //   window.chatbaseConfig = {
    //     chatbotId: "sw0sRxREFEQLTdqwC_Fbe",
    //   }
    //   `,
    // ],
    // [
    //   "script",
    //   {
    //     src: "https://www.chatbase.co/embed.min.js",
    //     id: "sw0sRxREFEQLTdqwC_Fbe",
    //     defer: true,
    //   },
    // ],
    [
      "script",
      {
        src: "https://platform.twitter.com/widgets.js"
      },
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: nav(),
    outline: {
      level: "deep",
    },

    footer: {
      message: "Released under the APACHE-2.0 License",
      copyright: "Copyright © 2023 CelestineSloth Society",
    },

    search: {
      provider: "local",
      options: {
        detailedView: true,
      },
    },

    sidebar: {
      "/": sidebarHome(),
    },

    editLink: {
      pattern: "https://github.com/Lazychain/docs/edit/main/:path",
      text: "Edit this page on GitHub",
    },

    logo: {
      alt: "LazyChain Logo",
      light: "/img/logo-dark.svg",
      dark: "/img/logo-dark.svg",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/Lazychain" },
      { icon: "twitter", link: "https://twitter.com/CelestineSloths" },
      { icon: "discord", link: "https://discord.com/invite/DafwZFz7MY" },
    ],
  },
  transformPageData(pageData) {
    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push([
      "meta",
      {
        name: "og:title",
        content:
          pageData.frontmatter.layout === "home"
            ? `LazyChain`
            : `${pageData.title} | LazyChain`,
      },
      {
        name: "og:description",
        content: pageData.frontmatter.layout === `${pageData.description}`,
      },
    ]);
  },
});

function nav() {
  return [
    { text: "Learn", link: "/learn/intro" },
    { text: "Tutorials", link: "/tutorials/quick-start" },
    { text: "How To Guides", link: "/guides/overview" },
    { text: "Blog", link: "/blog/overview" },
  ];
}

function sidebarHome() {
  return [
    {
      text: "Learn",
      collapsed: true,
      items: [
        {
          text: "Overview",
          collapsed: true,
          items: [
            { text: "Introduction", link: "/learn/intro" },
            { text: "About LazyChain", link: "/learn/about" },
          ],
        },
        {
          text: "Resources",
          collapsed: true,
          items: [
            { text: "Technical specifications", link: "/learn/specifications" },
          ],
        },
      ],
    },
    {
      text: "Tutorials",
      collapsed: true,
      items: [
        {
          text: "Quick start guide",
          link: "/tutorials/quick-start",
        },
      ],
    },
    {
      text: "How To Guides",
      collapsed: true,
      items: [
        {
          text: "Staking your NFT",
          link: "/guides/nft-staking",
        },
        {
          text: "Apps",
          collapsed: true,
          items: [
            {
              text: "Dex",
              link: "/guides/dex",
            },
          ],
        },
      ],
    },
    {
      text: "Blog",
      collapsed: true,
      items: [
        { text: "Overview", link: "/blog/overview" },
        {
          text: "Proff of Lazyness",
          link: "/blog/proof-of-lazyness",
        },
      ],
    },
  ];
}
