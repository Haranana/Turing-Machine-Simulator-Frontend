import { renderToString } from "react-dom/server";

import HomePage from "@features/home/components/HomePage";

function headFor(url: string) {
  if (url === "/") {
    return {
      lang: "en",
      title: "TuringSim — online Turing machine simulator",
      elements: new Set([
        {
          type: "meta",
          props: {
            name: "description",
            content:
            "online Turing machine simulator: turing machine, multitape, configurable syntax, nondeterminism, sharing machines"
          },
        },
        { type: "meta", props: { property: "og:title", content: "TuringSim" } },
        {
          type: "meta",
          props: { property: "og:description", content: "Online Turing machine simulator." },
        },
      ]),
    };
  }

  return { lang: "en", title: "TuringSim" };
}

export async function prerender(data: { url: string }) {
  
    const html = renderToString(
            <HomePage></HomePage>
  );

  return {
    html,
    head: headFor(data.url),
  };
}