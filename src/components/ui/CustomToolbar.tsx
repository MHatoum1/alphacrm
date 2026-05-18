// src\components\ui\CustomToolbar.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

const CustomToolbar = React.memo(({ title }: { title?: string }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {title && (
      <Typography variant="h6" fontWeight="bold">
        {title}
      </Typography>
    )}
  </Box>
));
export default CustomToolbar;
