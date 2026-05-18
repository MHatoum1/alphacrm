import React, { useState } from "react";
import Chart from "react-apexcharts";
import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface CustomDonutChartProps {
  title?: string;
  series: number[];
  labels: string[];
  colors?: string[];
  filters?: string[];
  filterData?: (filter: string) => { series: number[]; labels: string[] };
}

const CustomDonutChart: React.FC<CustomDonutChartProps> = ({
  title,
  series,
  labels,
  // colors = ["#5E81F4", "#F4BE5E", "#7CE7AC", "#FF808B"], // Default colors
  colors,
  filters = ["Day", "Week", "Month"], // Default filters
  filterData,
}) => {
  const { t } = useTranslation();

  const [activeFilter, setActiveFilter] = useState(filters[0]);

  // Handle filter selection
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const filteredData = filterData
    ? filterData(activeFilter)
    : { series, labels };

  const options = {
    chart: {
      type: "donut" as const,
      height: "100%",
    },
    colors: colors,
    labels: filteredData.labels,
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}`, // Format values as currency
      },
    },
    stroke: {
      width: 0,
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
          {title ? t(title) : ""}
        </Typography>
        <Box display="flex" flexWrap="wrap">
          {filters.map((label) => (
            <Button
              key={label}
              variant={label === activeFilter ? "contained" : "outlined"}
              sx={{ marginRight: 1, textTransform: "none", minWidth: "70px" }}
              onClick={() => handleFilterChange(label)}
            >
              {t(label)}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Donut Chart */}
      <Box sx={{ width: "100%", height: "270px" }}>
        <Chart
          options={options}
          series={filteredData.series}
          type="donut"
          height="100%"
        />
      </Box>
    </Box>
  );
};

export default CustomDonutChart;
