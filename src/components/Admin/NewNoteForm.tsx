// src/components/Admin/NewNoteForm.tsx
import { useState } from "react";
import { Grid, TextField, Button, MenuItem, Stack } from "@mui/material";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTranslation } from "react-i18next";

export default function NewNoteForm({
  onAdd,
}: {
  onAdd: (msg: string, type: string, date?: string | null) => void;
}) {
  const { t } = useTranslation();
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("");
  const [rem, setRem] = useState<string | null>(null);

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("type")}
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            {["call", "email", "note", "call_again", "no_answer"].map((v) => (
              <MenuItem key={v} value={v}>
                {t(v)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            size="small"
            label={t("note")}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={t("future_date")}
              value={rem ? dayjs(rem) : null}
              onChange={(val) => setRem(val ? val.format("YYYY-MM-DD") : null)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Button
            fullWidth
            variant="contained"
            disabled={!msg.trim() || !type}
            sx={{ height: 40 }}
            onClick={() => {
              onAdd(msg.trim(), type, rem);
              // clear local
              setMsg("");
              setType("");
              setRem(null);
            }}
          >
            {t("add_note")}
          </Button>
        </Grid>
      </Grid>
    </Stack>
  );
}
