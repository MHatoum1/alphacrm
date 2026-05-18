// src/components/Admin/LeadStatusForm.tsx
import { useState } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const OPTIONS = [
  "Potential",
  "Callback",
  "Depositor",
  "Duplicate",
  "Language barrier",
  "No answer",
  "Not interested",
  "Wrong/invalid details",
  "Registered",
  "Do Not Contact"
];

export default function LeadStatusForm({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}) {
  const [status, setStatus] = useState(currentStatus);
  const { t } = useTranslation();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1,
        mb: 2,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <FormControl
        size="small"
        fullWidth
        sx={{
          flex: "1 1 auto",
          minWidth: 0,
        }}
      >
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as string)}
          displayEmpty
        >
          <MenuItem value="">{t("lead_status")}</MenuItem>
          {OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        size="small"
        onClick={() => onStatusChange(status)}
        sx={{
          flex: "0 0 auto",
          width: isXs ? "100%" : "auto",
        }}
      >
        {t("add_lead_status")}
      </Button>
    </Box>
  );
}
