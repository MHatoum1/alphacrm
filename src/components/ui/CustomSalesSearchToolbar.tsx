import React from "react";
import { Box, Typography } from "@mui/material";

const CustomSalesSearchToolbar = React.memo(
  ({ title }: { title?: string }) => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {title && (
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      )}
    </Box>
  )
);

export default CustomSalesSearchToolbar;
