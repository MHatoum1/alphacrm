// src\pages\User\Accounts\InternalTransferPage.tsx
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchTransferAccounts,
  submitTransfer,
  TransferAccount,
} from "@/redux/slices/transferSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";

export default function InternalTransferPage() {
  const { t } = useTranslation();
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  const dispatch = useAppDispatch();
  const { rows, status, saving, error } = useAppSelector(
    (s) => s.clienttransfer
  );

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [amount, setAmt] = useState<number>(0);
  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);

  useEffect(() => {
    if (user_id) dispatch(fetchTransferAccounts(user_id));
  }, [user_id, dispatch]);

  const suffix = useMemo(() => {
    const cur =
      rows.find((r) => r.uid === from)?.currency ??
      rows.find((r) => r.uid === to)?.currency ??
      "";
    return cur ? ` (${cur})` : "";
  }, [from, to, rows]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) {
      setKo(t("transfer_error_user_not_found"));
      return;
    }
    if (!from || !to || from === to) {
      setKo(t("transfer_error_invalid_accounts"));
      return;
    }
    if (amount <= 0) {
      setKo(t("transfer_error_amount_required"));
      return;
    }

    try {
      await dispatch(submitTransfer({ user_id, from, to, amount })).unwrap();
      setOk(t("transfer_success"));
      setAmt(0);
    } catch (err: any) {
      setKo(err?.message || t("transfer_error_default"));
    }
  };

  if (status === "loading")
    return (
      <Typography textAlign="center" mt={4}>
        {t("loading")}
      </Typography>
    );
  if (status === "failed")
    return (
      <CustomError
        errorMessage={error || t("transfer_error_default")}
        onClose={() => {}}
      />
    );

  const menu = (acc: TransferAccount) => (
    <MenuItem key={acc.uid} value={acc.uid}>
      {acc.label}
    </MenuItem>
  );

  return (
    <Box sx={{ p: { xs: 2 } }}>
      <Paper
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {ok && <CustomNotification message={ok} onClose={() => setOk(false)} />}
        {ko && <CustomError errorMessage={ko} onClose={() => setKo(false)} />}

        <Typography variant="h6" gutterBottom>
          {t("internal_transfer_title")}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            select
            fullWidth
            required
            margin="normal"
            label={t("internal_transfer_from")}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {rows.map(menu)}
          </TextField>

          <TextField
            select
            fullWidth
            required
            margin="normal"
            label={t("internal_transfer_to")}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            {rows.map(menu)}
          </TextField>

          <TextField
            type="number"
            fullWidth
            required
            margin="normal"
            label={`${t("internal_transfer_amount")}${suffix}`}
            value={amount || ""}
            inputProps={{ min: 0, step: "any" }}
            onChange={(e) => setAmt(Number(e.target.value))}
          />

          <Box textAlign="right" mt={2}>
            <Button
              variant="contained"
              type="submit"
              disabled={saving === "loading"}
            >
              {saving === "loading"
                ? t("internal_transfer_sending")
                : t("internal_transfer_send")}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
