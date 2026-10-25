import { readFile, writeFile } from "node:fs/promises";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToString(React.createElement(App));
  const file = new URL("../dist/index.html", import.meta.url);
  let doc = await readFile(file, "utf8");
  if (!doc.includes("<!--app-html-->")) {
    throw new Error("prerender marker <!--app-html--> missing from dist/index.html");
  }
  doc = doc.replace("<!--app-html-->", html);
  await writeFile(file, doc);
  console.log(`prerendered ${html.length} bytes of HTML`);
} finally {
  await vite.close();
}
