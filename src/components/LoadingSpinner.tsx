import React from "react";
import { CircularProgress, Box } from "@mui/material";

const LoadingSpinner: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Adjust this as needed (or remove if not full screen)
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingSpinner;
