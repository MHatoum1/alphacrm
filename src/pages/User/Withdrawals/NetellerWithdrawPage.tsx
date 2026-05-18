import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchNetellerWithdrawMeta,
  sendNetellerWithdraw,
  resetNetellerWithdraw,
} from "@/redux/slices/netellerWithdrawSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function NetellerWithdrawPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const d = useAppDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userID = user?.userID as string | undefined;

  const { wallets, purses, status, saving, msg, error } = useAppSelector(
    (s) => s.netellerWithdraw
  );

  /* form state ------------------------------------------------- */
  const [wallet, setWallet] = useState("");
  const [amount, setAmt] = useState<number>(0);
  const [curr, setCurr] = useState("USD");
  const [purse, setPurse] = useState("");
  const [pin, setPin] = useState("");
  const [ko, setKo] = useState<string | false>(false);

  /* load meta only once ---------------------------------------- */
  useEffect(() => {
    if (userID) d(fetchNetellerWithdrawMeta(userID));
    return () => {
      d(resetNetellerWithdraw());
    };
  }, [userID, d]);

  /* submit ----------------------------------------------------- */
  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userID) return setKo(t("withdraw_err_user"));
    if (!wallet) return setKo(t("withdraw_err_wallet"));
    if (amount <= 0) return setKo(t("withdraw_err_amount"));
    if (!purse) return setKo(t("withdraw_err_purse"));
    if (!pin) return setKo(t("withdraw_err_pin"));

    try {
      await d(
        sendNetellerWithdraw({
          user_id: userID,
          wallet,
          amount,
          currency: curr,
          purse,
          pin,
        })
      ).unwrap();
    } catch (e: any) {
      setKo(t(e) || t("withdraw_err_default"));
    }
  };

  /* ui --------------------------------------------------------- */
  if (status === "loading")
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  if (status === "failed")
    return (
      <CustomError
        errorMessage={error || t("withdraw_err_default")}
        onClose={() => nav("/withdraw")}
      />
    );

  const optWallet = (w: any) => (
    <MenuItem key={w.uid} value={w.uid}>
      {w.label}
    </MenuItem>
  );
  const optPurse = (p: any) => (
    <MenuItem key={p.hash} value={p.hash}>
      {p.label}
    </MenuItem>
  );

  return (
    <Box sx={{ p: { xs: 2 } }}>
      <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {msg && (
          <CustomNotification
            message={t(msg)}
            onClose={() => d(resetNetellerWithdraw())}
          />
        )}
        {ko && <CustomError errorMessage={ko} onClose={() => setKo(false)} />}

        <Typography variant="h6">{t("withdraw_neteller_title")}</Typography>

        <Box component="form" onSubmit={handle}>
          <TextField
            select
            fullWidth
            required
            margin="normal"
            label={t("from_wallet")}
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          >
            {wallets.map(optWallet)}
          </TextField>

          <TextField
            type="number"
            fullWidth
            required
            margin="normal"
            label={t("amount")}
            inputProps={{ min: 0, step: "any" }}
            value={amount || ""}
            onChange={(e) => setAmt(Number(e.target.value))}
          />

          <TextField
            select
            fullWidth
            required
            margin="normal"
            label={t("currency")}
            value={curr}
            onChange={(e) => setCurr(e.target.value)}
          >
            {["USD", "EUR", "GBP"].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            required
            margin="normal"
            label={t("neteller_account")}
            value={purse}
            onChange={(e) => setPurse(e.target.value)}
          >
            <MenuItem value="">{t("please_select")}</MenuItem>
            {purses.map(optPurse)}
          </TextField>

          <TextField
            type="password"
            fullWidth
            required
            margin="normal"
            label={t("secure_pin")}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />

          <Box textAlign="right" mt={2}>
            <Button
              variant="contained"
              type="submit"
              disabled={saving === "loading"}
            >
              {t("send")}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
