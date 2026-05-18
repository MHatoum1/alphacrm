// ────────────────────────────────────────────────────────────
// src/components/Admin/StatusLabel.tsx
// ────────────────────────────────────────────────────────────
import { Chip, useTheme } from "@mui/material";
import type { User } from "@/utils/commonData";

interface Props {
  /** If provided we infer the label / colour from the user flags */
  user?: User;
  /** Override the text shown inside the chip */
  label?: string;
  /** Override the colour key (must exist in theme.palette.status) */
  statusKey?: string;
}

export default function StatusLabel({ user, label, statusKey }: Props) {
  const theme = useTheme();

  /* 1️⃣  Decide which key to use */
  let key: string = "unverified";
  if (statusKey) key = statusKey;
  else if (user?.verified) key = "verified";
  else if (user?.limited) key = "limited";
  else if (user?.dormant) key = "dormant";

  /* 2️⃣  Pick colours + text */
  const fallback = theme.palette.status.pending ?? {
    bg: "rgba(244, 190, 94, 0.1)",
    color: "#F4BE5E",
  };
  const { bg, color } = theme.palette.status[key] ?? fallback;
  const text =
    label ??
    {
      verified: "Verified",
      limited: "Limited",
      dormant: "Dormant",
      unverified: "Unverified",
    }[key] ??
    key.replace(/_/g, " ");

  /* 3️⃣  Render */
  return (
    <Chip
      label={text}
      size="small"
      sx={{
        bgcolor: bg,
        color,
        fontWeight: 700,
        "& .MuiChip-label": { px: 0.75 }, // a bit tighter
      }}
    />
  );
}
