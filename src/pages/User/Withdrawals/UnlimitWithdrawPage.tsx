import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  sendUnlimitWithdraw,
  resetUnlimit,
  fetchUnlimitWithdrawAccounts,
} from "@/redux/slices/unlimitSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function UnlimitWithdrawPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  const { status, error, payload, accounts } = useAppSelector(
    (s) => s.unlimit
  );

  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [pin, setPin] = useState("");
  const [recipientInfo, setRecipientInfo] = useState(user?.name || "");
  const [pan, setPan] = useState("");
  const [holder, setHolder] = useState(user?.name || "");
  const [expiration, setExpiration] = useState("");
  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);

  useEffect(() => {
    if (payload) setOk(t("withdraw_request_ok"));
  }, [payload, t]);

  useEffect(() => {
    if (user_id) dispatch(fetchUnlimitWithdrawAccounts(user_id));
    return () => {
      dispatch(resetUnlimit());
    };
  }, [user_id, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user_id) return setKo(t("withdraw_err_user"));
    if (!wallet) return setKo(t("withdraw_err_to"));
    if (amount <= 0) return setKo(t("withdraw_err_amount"));
    if (!pin) return setKo(t("withdraw_err_pin"));
    if (!recipientInfo || !pan || !holder || !expiration) {
      return setKo(t("withdraw_err_default"));
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiration)) {
      return setKo(t("expiry_mm_yy_invalid"));
    }

    try {
      await dispatch(
        sendUnlimitWithdraw({
          user_id,
          wallet,
          amount,
          currency,
          pin,
          email: user?.email || "",
          recipient_info: recipientInfo,
          pan,
          holder,
          expiration,
        })
      ).unwrap();
    } catch (err: any) {
      setKo(err || t("withdraw_err_default"));
    }
  };

  if (status === "loading")
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (status === "failed") {
    return (
      <CustomError
        errorMessage={error || t("withdraw_err_default")}
        onClose={() => nav("/withdraw")}
      />
    );
  }

  const accountOption = (row: any) => (
    <MenuItem key={row.uid} value={row.uid}>
      {row.label}
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
        {ok && (
          <CustomNotification message={t(ok)} onClose={() => setOk(false)} />
        )}
        {ko && (
          <CustomError errorMessage={t(ko)} onClose={() => setKo(false)} />
        )}

        <Typography variant="h6" gutterBottom>
          {t("withdraw_unlimit_title", "Withdraw - Debit/Credit")}
        </Typography>

        {!payload && (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              select
              fullWidth
              required
              margin="normal"
              label={t("from_wallet")}
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            >
              {(accounts || []).map(accountOption)}
            </TextField>

            <TextField
              type="number"
              fullWidth
              required
              margin="normal"
              label={t("amount")}
              inputProps={{ min: 0, step: "any" }}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            <TextField
              select
              fullWidth
              required
              margin="normal"
              label={t("currency")}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {["USD", "EUR"].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required
              margin="normal"
              label={t("recipient_info", "Recipient Info")}
              value={recipientInfo}
              onChange={(e) => setRecipientInfo(e.target.value)}
            />
            <TextField
              fullWidth
              required
              margin="normal"
              label={t("card_number", "Card Number")}
              value={pan}
              onChange={(e) => setPan(e.target.value)}
            />
            <TextField
              fullWidth
              required
              margin="normal"
              label={t("card_holder", "Card Holder")}
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
            />
            <TextField
              fullWidth
              required
              margin="normal"
              label={t("expiry_mm_yy")}
              value={expiration}
              inputProps={{ maxLength: 5, placeholder: "MM/YY" }}
              onChange={(e) => {
                let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                setExpiration(v);
              }}
            />
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
              <Button variant="contained" type="submit">
                {t("send")}
              </Button>
            </Box>
          </Box>
        )}

        {payload && (
          <Box>
            <Typography paragraph>
              {t(
                "unlimit_confirmation_done",
                "Your payment request is created and pending provider confirmation."
              )}
            </Typography>

            <List sx={{ display: "inline-block", textAlign: "left", mb: 2 }}>
              <ListItem dense>
                <ListItemText primary={`${t("amount")}: ${payload.amount}`} />
              </ListItem>
              <ListItem dense>
                <ListItemText
                  primary={`${t("currency")}: ${payload.currency}`}
                />
              </ListItem>
              {payload.reference && (
                <ListItem dense>
                  <ListItemText
                    primary={`${t("reference")}: ${payload.reference}`}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
