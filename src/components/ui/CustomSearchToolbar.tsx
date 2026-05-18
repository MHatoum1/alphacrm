import React from "react";
import { Box, Typography } from "@mui/material";
import { GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";

const CustomSearchToolbar = React.memo(
  ({ title }: { title?: string }) => {
    const { t } = useTranslation();

    return (
      <Box
        sx={{
          p: 1,
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
        <GridToolbarQuickFilter placeholder={t("search")} autoFocus />
      </Box>
    );
  }
);

export default CustomSearchToolbar;
