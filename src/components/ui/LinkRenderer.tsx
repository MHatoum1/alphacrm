import React from "react";

interface LinkRendererProps {
  htmlString: string;
  openInNewTab?: boolean;
}

const LinkRenderer: React.FC<LinkRendererProps> = ({
  htmlString,
  openInNewTab = true, // ✅ default value here
}) => {
  const getAnchorData = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchorElement = doc.querySelector("a");
    if (anchorElement) {
      return {
        href: anchorElement.getAttribute("href") || "#",
        text: anchorElement.textContent || "",
      };
    }
    return null;
  };

  const anchorData = getAnchorData(htmlString);

  if (!anchorData) {
    return <span>{htmlString}</span>;
  }

  const target = openInNewTab ? "_blank" : "_self";

  return (
    <a
      href={anchorData.href}
      target={target}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {anchorData.text}
    </a>
  );
};

export default LinkRenderer;
