import katex from "katex";

export function Latex({ tex, block = false }: { tex: string; block?: boolean }) {
  let html = "";
  try {
    html = katex.renderToString(tex, {
      displayMode: block,
      throwOnError: false,
      output: "html",
    });
  } catch (e) {
    return <code className="text-destructive">{tex}</code>;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
