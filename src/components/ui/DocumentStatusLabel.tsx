// src/components/Admin/DocumentStatusLabel.tsx
import { Chip, useTheme } from "@mui/material";

interface Props {
  /** key of the status (e.g. "new", "approved", "rejected", "expired", "deleted") */
  statusKey: string;
  /** optional override text */
  label?: string;
}

export default function DocumentStatusLabel({ statusKey, label }: Props) {
  const theme = useTheme();

  // 1️⃣ normalize & synonym‐map
  let key = statusKey.toLowerCase();
  const synonyms: Record<string, string> = {
    rejected: "declined",
    deleted: "disabled",
    expired: "error",
  };
  if (synonyms[key]) key = synonyms[key];

  // 2️⃣ pick from theme.palette.status or fallback
  const fallback = {
    bg: theme.palette.status.default.bg,
    color: theme.palette.status.default.color,
  };
  const { bg, color } = theme.palette.status[key] ?? fallback;

  // 3️⃣ decide label text
  const text =
    label ?? key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

  // 4️⃣ render
  return (
    <Chip
      label={text.toUpperCase()}
      size="small"
      sx={{
        bgcolor: bg,
        color,
        fontWeight: 700,
        height: 24,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}
