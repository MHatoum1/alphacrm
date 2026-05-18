// src\components\ui\CustomError.tsx
import React from "react";
import { Alert, AlertProps } from "@mui/material";

interface CustomErrorProps extends AlertProps {
  errorMessage: string;
}

const CustomError: React.FC<CustomErrorProps> = ({
  errorMessage,
  onClose,
  severity = "error",
  sx,
  ...props
}) => {
  return (
    <Alert
      onClose={onClose}
      severity={severity}
      variant="filled"
      sx={{
        width: "100%",
        borderRadius: 2,
        mb: 2,
        fontWeight: "bold",
        color: "#b94a48", // Text color (red)
        backgroundColor: "#f2dede", // Background (light red)
        border: "1px solid #eed3d7", // Border (reddish)
        ...sx,
      }}
      {...props}
    >
      {errorMessage}
    </Alert>
  );
};

export default CustomError;
