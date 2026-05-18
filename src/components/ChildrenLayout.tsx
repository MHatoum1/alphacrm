// src/pages/ChildrenLayout.tsx
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

export default function ChildrenLayout() {
  // grab the last segment of the URL

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mt: 2 }}>
        {/* this is where Deposits or Withdrawals will render */}
        <Outlet />
      </Box>
    </Box>
  );
}
