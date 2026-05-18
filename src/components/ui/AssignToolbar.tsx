import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export interface SalesOption {
  value: number;
  label: string;
}

interface AssignToolbarProps {
  salesUsers: SalesOption[];
  salesId: number | "";
  onSalesChange: (id: number | "") => void;
  onAssign: () => void;
}

export default function AssignToolbar({
  salesUsers,
  salesId,
  onSalesChange,
  onAssign,
}: AssignToolbarProps) {
  const { t } = useTranslation();

  return (
    <Box display="flex" gap={2} mb={2}>
      <FormControl size="small" sx={{ minWidth: 240 }}>
        <InputLabel id="sales-select-lb">{t("assign_to")}</InputLabel>
        <Select
          labelId="sales-select-lb"
          value={salesId}
          label={t("assign_to")}
          onChange={(e) => onSalesChange(e.target.value as number | "")}
        >
          <MenuItem value="">
            <em>{t("unassign_option")}</em>
          </MenuItem>

          {salesUsers.map((u) => (
            <MenuItem key={u.value} value={u.value}>
              {u.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" color="success" onClick={onAssign}>
        {t("assign")}
      </Button>
    </Box>
  );
}
