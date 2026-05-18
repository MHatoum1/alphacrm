import React from "react";
import Chart from "react-apexcharts";
import { Box, Typography, useTheme } from "@mui/material";

interface CustomBarChartProps {
  title?: string;
  series: { name: string; data: number[] }[];
  labels: string[];
  colors?: string[];
  height?: number;
  filters?: string[]; // Dynamic filters like ["Day", "Week", "Month"]
  filterData?: (filter: string) => {
    series: { name: string; data: number[] }[];
    labels: string[];
  };

  // Chart customization options
  stroke?: { width?: number; curve?: "smooth" | "straight" | "stepline" };
  yaxis?: {
    show?: boolean;
    labels?: {
      show?: boolean;
      style?: { colors?: string; fontSize?: string };
    };
  };
  grid?: { show?: boolean; borderColor?: string; strokeDashArray?: number };
  legend?: { show?: boolean; position?: "top" | "right" | "bottom" | "left" };
  tooltip?: { enabled?: boolean; theme?: "light" | "dark" };
  plotOptions?: {
    bar?: { endingShape?: "rounded" | "flat"; columnWidth?: string };
  };
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({
  title,
  series,
  labels,
  colors, // Default colors
  // Default styling
  stroke = { width: 2, curve: "smooth" },
  grid = { show: true, borderColor: "#E0E0E0", strokeDashArray: 4 },
  legend = { show: true, position: "bottom" },
  tooltip = { enabled: true, theme: "light" },
  yaxis = {
    labels: {
      style: { colors: "#A0A0A0", fontSize: "12px" },
    },
  },
  plotOptions = { bar: { endingShape: "rounded", columnWidth: "20%" } },
}) => {
  const theme = useTheme();

  const data = { series, labels };

  const options = {
    chart: {
      type: "bar" as const,
      height: "100%",
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    colors: colors,
    stroke: stroke,
    grid: grid,
    yaxis: yaxis,
    legend: legend,
    tooltip: tooltip,
    plotOptions: plotOptions,
    xaxis: {
      categories: data.labels,
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: "12px" },
      },
    },
  };

  return (
    <Box sx={{ width: "100%", textAlign: "center" }}>
      {/* Title and Filter Buttons */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
      >
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <Box sx={{ width: "100%", height: "270px" }}>
        {/* Chart Component */}
        <Chart
          options={options}
          series={data.series}
          type="bar"
          height="100%"
        />
      </Box>
    </Box>
  );
};

export default CustomBarChart;
