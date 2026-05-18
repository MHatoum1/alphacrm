// src/components/Overview.tsx
import React from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface OverviewItem {
  label: string;
  value: number | string;
  icon: string;    // e.g. "la-chart-line"
  color: string;   // circle background
  backgroundColor: string; // icon color
  onClick?: () => void;
}

interface OverviewProps {
  overviewItems: OverviewItem[];
}

const Overview: React.FC<OverviewProps> = ({ overviewItems }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        // responsive columns:
        gridTemplateColumns: {
          xs: "repeat(auto-fill, minmax(180px, 1fr))",  // as many 180px cards as fit
          sm: "repeat(2, 1fr)",                          // 2 columns on small+ tablets
          md: "repeat(4, 1fr)",                          // 4 columns on md+ (desktop)
        },
        // on xs, allow horizontal scroll instead of wrapping to tiny cards
        overflowX: { xs: "auto", md: "visible" },
        whiteSpace: { xs: "nowrap", md: "normal" },
        paddingBottom: { xs: 2, md: 0 },
      }}
    >
      {overviewItems.map((item, idx) => (
        <Paper
          key={idx}
          elevation={3}
          onClick={item.onClick}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1.5,
            cursor: item.onClick ? "pointer" : "default",
            // on xs, fix width so scroll works; on md+ let it flex
            minWidth: { xs: 180, md: "auto" },
            flexShrink: 0,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {t(item.label)}
            </Typography>
            <Typography variant="h6" color="text.primary">
              {item.value}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "10%",
              backgroundColor: item.color,
              color: item.backgroundColor,
            }}
          >
            <i className={`la ${item.icon}`} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default Overview;
