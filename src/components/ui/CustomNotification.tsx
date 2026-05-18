// src\components\ui\CustomNotification.tsx
import React from "react";
import { Alert, AlertProps } from "@mui/material";

interface CustomNotificationProps extends AlertProps {
  message: string;
}

const CustomNotification: React.FC<CustomNotificationProps> = ({
  message,
  onClose,
  severity = "success",
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
        color: "#468847", // Text color (green)
        backgroundColor: "#dff0d8", // Background (light green)
        border: "1px solid #d6e9c6", // Border (greenish)
        ...sx,
      }}
      {...props}
    >
      {message}
    </Alert>
  );
};

export default CustomNotification;
