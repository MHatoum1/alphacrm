// src/components/Admin/UpdateNoteModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Note } from "@/utils/commonData";
import { useTranslation } from "react-i18next";

export default function UpdateNoteModal({
  note,
  onClose,
  onSave,
}: {
  note: Note | null;
  onClose: () => void;
  onSave: (id: number, message: string, futureDate?: string) => void;
}) {
  /* 1️⃣  always run every hook */
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [futureDate, setFutureDate] = useState("");

  /* 2️⃣  sync local state when `note` changes */
  useEffect(() => {
    if (note) {
      setMessage(note.message);
      setFutureDate(note.future_date || "");
    }
  }, [note]);

  /* 3️⃣  early‑return AFTER hooks */
  if (!note) return null;

  return (
    <Dialog open onClose={onClose} fullWidth>
      <DialogTitle sx={{ bgcolor: "#3887BE", color: "#fff" }}>
        {t("update_note")}
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <FormControl fullWidth>
            <InputLabel>{t("type")}</InputLabel>
            <Select value={note.sub_type} disabled>
              <MenuItem value={note.sub_type}>{note.sub_type}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={t("note")}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <TextField
            label={t("future_date")}
            type="datetime-local"
            fullWidth
            value={futureDate}
            onChange={(e) => setFutureDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="contained"
            onClick={() => onSave(note.id, message, futureDate)}
          >
            {t("update_note")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
