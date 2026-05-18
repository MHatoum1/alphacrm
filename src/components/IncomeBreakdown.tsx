import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import CustomDonutChart from "./charts/CustomDonutChart";

const data_donut = {
  day: {
    series: [22, 18, 8, 15],
    labels: [
      "Marketing Channels",
      "Offline Channels",
      "Direct Sales",
      "Other Channels",
    ],
  },
  week: {
    series: [70, 50, 30, 60],
    labels: ["Marketing", "Offline", "Direct", "Other"],
  },
  month: {
    series: [150, 130, 100, 120],
    labels: ["Marketing", "Offline", "Direct", "Other"],
  },
};

// Function to return filtered data
const filterData = (filter: string) => {
  switch (filter) {
    case "Day":
      return data_donut.day;
    case "Week":
      return data_donut.week;
    case "Month":
      return data_donut.month;
    default:
      return data_donut.month;
  }
};

const IncomeBreakdown: React.FC = () => {
  const seriesItems = [
    { title: "Marketing Channels", value: "$22.0k", color: "#5E81F4" },
    { title: "Offline Channels", value: "$18.6k", color: "#F4BE5E" },
    { title: "Direct Sales", value: "$8.4k", color: "#7CE7AC" },
    { title: "Other Channels", value: "$15.3k", color: "#FF808B" },
  ];

  return (
    <Paper elevation={3} sx={{ padding: 3, borderRadius: "12px" }}>
      {/* Dynamic Donut Chart */}
      <CustomDonutChart
        title="Income Breakdown"
        series={[]}
        labels={[]}
        filterData={filterData}
      />

      {/* Category Breakdown */}
      <Grid container spacing={2} sx={{ marginTop: 3 }}>
        {seriesItems.map((item, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            key={index}
            display="flex"
            alignItems="center"
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: item.color,
                marginRight: 1,
              }}
            ></Box>
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

export default IncomeBreakdown;
