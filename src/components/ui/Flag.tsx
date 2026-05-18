import React from "react";
import { FormControlLabel, Typography } from "@mui/material";
import ThemedSwitch from "@/components/ui/ThemedSwitch";

export interface FlagProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const Flag: React.FC<FlagProps> = ({ label, checked = false, onChange }) => (
  <FormControlLabel
    sx={{ my: 1, mr: 1 }}
    control={
      <ThemedSwitch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    }
    label={
      <Typography sx={{ ml: 1 }} variant="body2">
        {label}
      </Typography>
    }
  />
);

export default Flag;
