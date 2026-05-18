import React from "react";
import { FormControlLabel, Typography, Radio, useTheme } from "@mui/material";

export type RadioItemPaletteKey = "success" | "warning" | "error";

export interface RadioItemProps {
  value: string;
  label: string;
  paletteKey: RadioItemPaletteKey;
}

const RadioItem: React.FC<RadioItemProps> = ({ value, label, paletteKey }) => {
  const theme = useTheme();
  return (
    <FormControlLabel
      value={value}
      sx={{ my: 0.5 }}
      control={
        <Radio size="small" sx={{ color: theme.palette[paletteKey].main }} />
      }
      label={
        <Typography
          variant="body2"
          sx={{ color: theme.palette[paletteKey].main }}
        >
          {label}
        </Typography>
      }
    />
  );
};

export default RadioItem;
