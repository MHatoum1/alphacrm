// src/pages/Admin/Details/ComingSoonPage.tsx
import { Typography, Box } from "@mui/material";
import { useParams } from "react-router-dom";

export default function ComingSoonPage() {
  const { tab } = useParams<{ tab: string }>();
  const name = tab?.replace(/_/g, " ") || "Feature";
  return (
    <Box>
      <Typography variant="body1">
        {name.charAt(0).toUpperCase() + name.slice(1)} content coming soon…
      </Typography>
    </Box>
  );
}
