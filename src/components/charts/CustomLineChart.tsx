import React, { useState } from "react";
import Chart from "react-apexcharts";
import { Box, Button, Typography } from "@mui/material";

interface CustomLineChartProps {
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

  // Chart Options (Exposed for customization)
  grid?: {
    show: boolean;
    borderColor: string;
    strokeDashArray: number;
    xaxis?: { lines: { show: boolean } };
    yaxis?: { lines: { show: boolean } };
  };
  stroke?: {
    width: number;
    curve: "smooth" | "straight" | "stepline";
  };
  xaxis?: {
    show?: boolean;
    categories?: string[];
    labels?: {
      show?: boolean;
      style?: { colors?: string; fontSize?: string };
    };
  };
  yaxis?: {
    show?: boolean;
    labels?: {
      show?: boolean;
      style?: { colors?: string; fontSize?: string };
    };
  };
  tooltip?: {
    enabled?: boolean;
    theme?: "light" | "dark";
  };
  legend?: {
    show?: boolean;
    position?: "top" | "right" | "bottom" | "left";
  };
  dataLabels?: {
    enabled?: boolean;
  };
  fill?: {
    type?: "solid" | "gradient" | "pattern" | "image";
    gradient?: {
      shade?: "light" | "dark";
      type?: "vertical" | "horizontal" | "diagonal1" | "diagonal2";
      opacityFrom?: number;
      opacityTo?: number;
    };
  };
}

const CustomLineChart: React.FC<CustomLineChartProps> = ({
  title,
  series,
  labels,
  colors = ["#5E81F4", "#F4BE5E", "#7CE7AC"],
  height = 250,
  filters = ["Day", "Week", "Month"],
  filterData,

  // Default chart options
  grid = {
    show: true,
    borderColor: "#F0F0F3",
    strokeDashArray: 5,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  },
  stroke = { width: 3, curve: "smooth" },
  xaxis = {
    labels: {
      style: { colors: "#A0A0A0", fontSize: "12px" },
    },
  },
  yaxis = {
    labels: {
      style: { colors: "#A0A0A0", fontSize: "12px" },
    },
  },
  tooltip = { enabled: true, theme: "light" },
  legend = { show: false, position: "bottom" },
  dataLabels = { enabled: false },
  fill = {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "vertical",
      opacityFrom: 0.4,
      opacityTo: 0,
    },
  },
}) => {
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  // Handle filter selection and update data dynamically
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const filteredData = filterData
    ? filterData(activeFilter)
    : { series, labels };

  const options = {
    chart: {
      type: "area" as const,
      height: height,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 500,
      },
    },
    colors: colors,
    grid: grid,
    stroke: stroke,
    xaxis: {
      categories: filteredData.labels,
      ...xaxis,
    },
    yaxis: yaxis,
    tooltip: tooltip,
    legend: legend,
    dataLabels: dataLabels,
    fill: fill,
  };

  return (
    <Box sx={{ width: "100%", height: height }}>
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
        <Box display="flex" flexWrap="wrap">
          {filters.map((label) => (
            <Button
              key={label}
              variant={label === activeFilter ? "contained" : "outlined"}
              sx={{ marginRight: 1, textTransform: "none", minWidth: "70px" }}
              onClick={() => handleFilterChange(label)}
            >
              {label}
            </Button>
          ))}
          <Button variant="outlined">
            <i className="la la-calendar-week"></i>
          </Button>
        </Box>
      </Box>

      {/* Chart Component */}
      <Chart
        options={options}
        series={filteredData.series}
        type="area"
        height={height}
      />
    </Box>
  );
};

export default CustomLineChart;
