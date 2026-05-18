// MultiLinkRenderer.tsx
import React from "react";

interface MultiLinkRendererProps {
  htmlString: string;
}

interface AnchorData {
  href: string;
  target: string;
  className?: string;
  title?: string;
  innerHTML: string;
}

const MultiLinkRenderer: React.FC<MultiLinkRendererProps> = ({
  htmlString,
}) => {
  const getAnchors = (html: string): AnchorData[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchors = Array.from(doc.querySelectorAll("a"));

    return anchors.map((a) => ({
      href: a.getAttribute("href") ?? "#",
      target: a.getAttribute("target") ?? "_blank",
      className: a.getAttribute("class") ?? undefined,
      title: a.getAttribute("title") ?? undefined,
      innerHTML: a.innerHTML, // preserves <i>…</i> etc.
    }));
  };

  const anchorList = getAnchors(htmlString);

  if (anchorList.length === 0) {
    // nothing to render as links
    return <span>{htmlString}</span>;
  }

  return (
    <>
      {anchorList.map(({ href, target, className, title, innerHTML }, idx) => (
        <a
          key={idx}
          href={href}
          target={target}
          className={className}
          title={title}
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          // dangerouslySetInnerHTML is fine here since you trust the source of htmlString
          dangerouslySetInnerHTML={{ __html: innerHTML }}
        />
      ))}
    </>
  );
};

export default MultiLinkRenderer;
