import { Grid, Button, Snackbar } from "@mui/material";
import { useCallback, useState } from "react";

interface SocialPlatform {
  alt: string;
  src: string;
  buildShareUrl?: (link: string) => string; // platforms w/o a web-share API leave this undefined
}

/** identical pop-up dimensions everywhere */
const openShareWindow = (url: string) =>
  window.open(
    url,
    "_blank",
    "width=500,height=300,scrollbars=yes,resizable=yes"
  );

const SOCIALS: SocialPlatform[] = [
  // ── official share URLs ─────────────────────────────────────────────────────
  {
    alt: "facebook",
    src: "/images/social/fb-icon.png",
    buildShareUrl: (link) =>
      `https://www.facebook.com/sharer.php?u=${encodeURIComponent(link)}`,
  },
  { alt: "instagram", src: "/images/social/instagram.png" },
  {
    alt: "twitter",
    src: "/images/social/twitter-icon.png",
    buildShareUrl: (link) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}`,
  },
  {
    alt: "linkedin",
    src: "/images/social/linkedin.png",
    buildShareUrl: (link) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        link
      )}`,
  },
  { alt: "youtube", src: "/images/social/youtube.png" },
  { alt: "threads", src: "/images/social/threads.png" },
  { alt: "tiktok", src: "/images/social/tiktok.png" },
  {
    alt: "telegram",
    src: "/images/social/telegram.png",
    buildShareUrl: (link) =>
      `https://t.me/share/url?url=${encodeURIComponent(link)}`,
  },

  // ── no endpoint → copy to clipboard ─────────────────────────────────────────
];

type Props = { link: string };

export default function SocialShare({ link }: Props) {
  /** snackbar visibility */
  const [copiedOpen, setCopiedOpen] = useState(false);

  const handleShare = useCallback(
    (platform: SocialPlatform) => {
      if (platform.buildShareUrl) {
        openShareWindow(platform.buildShareUrl(link));
        return;
      }

      // ---- fallback: copy to clipboard then show toast ----
      navigator.clipboard
        .writeText(link)
        .then(() => setCopiedOpen(true))
        .catch((err) => console.error("Clipboard failure", err));
    },
    [link]
  );

  return (
    <>
      <Grid
        container
        spacing={1}
        justifyContent="flex-start"
        alignItems="flex-start"
        wrap="nowrap"
        sx={{ mb: 4 }}
      >
        {SOCIALS.map((p) => (
          <Grid item xs="auto" key={p.alt}>
            <Button
              className="social-share"
              sx={{ minWidth: 40, p: 1 }}
              aria-label={`share on ${p.alt}`}
              onClick={() => handleShare(p)}
            >
              <img src={p.src} alt={p.alt} height={24} />
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* --- copied toast (2 s) --- */}
      <Snackbar
        open={copiedOpen}
        autoHideDuration={2000}
        onClose={() => setCopiedOpen(false)}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
