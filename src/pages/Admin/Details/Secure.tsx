// ────────────────────────────────────────────────────────────
// src/pages/Admin/Details/SecurePage.tsx
// ────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function SecurePage({
  /** optional prop – router param has priority */
  userId: propId,
}: {
  userId?: number;
}) {
  /* ——— where do we take the id from? ——— */
  const { id: routeId } = useParams<{ id: string }>();
  const userId = Number(routeId) || propId || 0; // 0 ⇒ invalid

  const { t } = useTranslation();

  /* ——— local state ——— */
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"save" | "reset" | "">("");

  /* snackbars */
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  /* confirm-dialog */
  const [openDlg, setOpenDlg] = useState(false);

  /* helpers */
  const fireOk = (msgKey: string) => setOkMsg(t(msgKey));
  const fireErr = (msg: any) =>
    setErrMsg(msg?.response?.data?.detail ?? msg?.message ?? String(msg));

  /* ————————————————— 1) change MAIN password ————————————————— */
  const handleSavePassword = async () => {
    if (!password.trim()) return fireErr({ message: t("password_required") });

    try {
      setLoading("save");
      const form = new URLSearchParams({
        action: "updateUserPassword",
        id: String(userId),
        user_password: password,
      });
      await axiosInstance.post("/admindetails", form);
      fireOk("user_password_updated");
      setPassword("");
    } catch (e) {
      fireErr(e);
    } finally {
      setLoading("");
    }
  };

  /* ————————————————— 2) reset secure-PIN ————————————————— */
  const doResetPin = async () => {
    try {
      setLoading("reset");
      const form = new URLSearchParams({
        action: "resetSecurePin",
        id: String(userId),
      });
      await axiosInstance.post("/admindetails", form);
      fireOk("secure_pin_deleted");
    } catch (e) {
      fireErr(e);
    } finally {
      setLoading("");
      setOpenDlg(false);
    }
  };

  /* ————————————————— UI ————————————————— */
  return (
    <Paper sx={{ p: 2 }}>
      {okMsg && (
        <CustomNotification message={okMsg} onClose={() => setOkMsg("")} />
      )}
      {errMsg && (
        <CustomError errorMessage={errMsg} onClose={() => setErrMsg("")} />
      )}

      <Typography variant="h6" gutterBottom>
        {t("secure_information")}
      </Typography>

      {/* ⇢ Change password */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label={t("new_user_password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          sx={{ maxWidth: 350, flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleSavePassword}
          disabled={loading === "save"}
          startIcon={
            loading === "save" ? <CircularProgress size={18} /> : undefined
          }
        >
          {t("store")}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ⇢ Reset secure-PIN */}
      <Button
        variant="outlined"
        color="error"
        disabled={loading === "reset"}
        onClick={() => setOpenDlg(true)}
        startIcon={
          loading === "reset" ? <CircularProgress size={18} /> : undefined
        }
      >
        {t("reset_secure_pin")}
      </Button>

      {/* confirmation dialog */}
      <Dialog open={openDlg} onClose={() => setOpenDlg(false)}>
        <DialogTitle sx={{ bgcolor: "#3887BE", color: "#fff" }}>
          {t("reset_secure_pin")}
        </DialogTitle>
        <DialogContent>{t("are_you_sure")}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDlg(false)}>{t("cancel")}</Button>
          <Button color="error" onClick={doResetPin}>
            {t("confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
