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
  sendUnlimitDeposit,
  resetUnlimit,
  fetchUnlimitAccounts,
} from "@/redux/slices/unlimitSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function UnlimitDepositPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  const { status, error, redirect, payload, accounts } = useAppSelector(
    (s) => s.unlimit
  );

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);

  useEffect(() => {
    if (redirect) setOk(t("confirm_payment_details"));
  }, [redirect, t]);

  useEffect(() => {
    if (user_id) dispatch(fetchUnlimitAccounts(user_id));
    return () => {
      dispatch(resetUnlimit());
    };
  }, [user_id, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) return setKo(t("deposit_err_user"));
    if (!to) return setKo(t("deposit_err_to"));
    if (amount <= 0) return setKo(t("deposit_err_amount"));

    try {
      await dispatch(
        sendUnlimitDeposit({
          user_id,
          to,
          amount,
          currency,
        })
      ).unwrap();
    } catch (err: any) {
      setKo(err || t("deposit_err_default"));
    }
  };

  if (status === "loading")
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (status === "failed")
    return (
      <CustomError
        errorMessage={error || t("deposit_err_default")}
        onClose={() => nav("/deposit")}
      />
    );

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
        {ok && <CustomNotification message={t(ok)} onClose={() => setOk(false)} />}
        {ko && <CustomError errorMessage={t(ko)} onClose={() => setKo(false)} />}

        <Typography variant="h6" gutterBottom>
          {t("deposit_unlimit_title", "Deposit - Debit/Credit")}
        </Typography>

        {!payload && (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              select
              fullWidth
              required
              margin="normal"
              label={t("to_account")}
              value={to}
              onChange={(e) => setTo(e.target.value)}
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
                "unlimit_confirm_text",
                "Please confirm the details then click Pay now to continue."
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

            {redirect ? (
              <Box mt={1}>
                <Button
                  href={redirect}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  size="large"
                >
                  {t("pay_now")}
                </Button>
              </Box>
            ) : (
              <Typography paragraph>
                {t(
                  "unlimit_confirmation_done",
                  "Your payment request is created and pending provider confirmation."
                )}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
