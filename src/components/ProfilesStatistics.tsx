// src/components/ProfilesStatistics.tsx
import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import CustomDonutChart from "./charts/CustomDonutChart";
import { useTranslation } from "react-i18next";

export interface ProfilesStatisticsProps {
  series: number[];
  labels: string[];
  /** Optional per‐slice colors in the same order as `series`/`labels` */
  colors?: string[];
}

const ProfilesStatistics: React.FC<ProfilesStatisticsProps> = ({
  series,
  labels,
  colors,
}) => {
  const { t } = useTranslation();

  // default color palette if none passed

  // build breakdown items from labels+series
  const breakdownItems = labels.map((label, idx) => ({
    title: t(label),
    value: series[idx],
    color: colors?.[idx],
  }));

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: "12px", height: '100%', display: 'flex', flexDirection: 'column'  }}>
      {/* Donut */}
      <CustomDonutChart
        title={t("profiles_statistics")}
        series={series}
        labels={labels}
        // no time filters here
        colors={colors}
        filters={[]}
        filterData={() => ({ series, labels })}
      />

      {/* Legend / breakdown */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {breakdownItems.map((item, i) => (
          <Grid key={i} item xs={12} sm={6} display="flex" alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: item.color,
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {item.value}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ProfilesStatistics;
