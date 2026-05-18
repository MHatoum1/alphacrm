import React from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import CustomLineChart from "./charts/CustomLineChart";

const data_line = {
  day: {
    series: [{ name: "Profit", data: [5, 10, 15, 10, 20, 25] }],
    labels: ["9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM"],
  },
  week: {
    series: [{ name: "Profit", data: [50, 75, 90, 85, 60, 95] }],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  month: {
    series: [{ name: "Profit", data: [500, 700, 800, 950, 1100, 1200] }],
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  },
};

// Function to return filtered data
const filterData = (filter: string) => {
  switch (filter) {
    case "Day":
      return data_line.day;
    case "Week":
      return data_line.week;
    case "Month":
      return data_line.month;
    default:
      return data_line.month;
  }
};

const IncomeDetails: React.FC = () => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: "12px",
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      {/* Dynamic Line Chart with Filtering */}
      <CustomLineChart
        title="Income Details"
        colors={["#7CE7AC"]}
        series={[]}
        height={300}
        labels={[]}
        yaxis={{ show: false }}
        xaxis={{
          labels: {
            show: false,
          },
        }}
        filterData={filterData}
      />

      {/* Financial Stats */}
      <Box display="flex" justifyContent="space-around" mt={7}>
        {[
          { label: "Total Sales", value: "$342,000" },
          { label: "Spendings", value: "$200,000" },
          { label: "Income", value: "$142,000" },
        ].map((item, index) => (
          <Box key={index} textAlign="center">
            <Typography variant="h6" fontWeight="bold">
              {item.value}
            </Typography>
            <Typography color="textSecondary">{item.label}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default IncomeDetails;
