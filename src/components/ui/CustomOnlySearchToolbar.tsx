import React from "react";
import { Box } from "@mui/material";
import { GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";

const CustomOnlySearchToolbar = React.memo(() => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <GridToolbarQuickFilter placeholder={t("search")} autoFocus />
    </Box>
  );
});

export default CustomOnlySearchToolbar;
