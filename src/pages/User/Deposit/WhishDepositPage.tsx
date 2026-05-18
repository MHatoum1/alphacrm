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
  sendWhishDeposit,
  resetWhish,
  fetchWhishAccounts,
} from "@/redux/slices/whishSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

/* matches /deposit/whish */
export default function WhishDepositPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  // current user
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  // slice state
  const { status, error, redirect, payload, accounts } = useAppSelector(
    (s) => s.whish
  );

  // local form
  const [to, setTo] = useState(""); // account uid to credit (required)
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  
  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);

  // after API returns redirect_url
  useEffect(() => {
    if (redirect) setOk(t("confirm_payment_details"));
  }, [redirect, t]);

  // load selectable accounts once
  useEffect(() => {
    if (user_id) dispatch(fetchWhishAccounts(user_id));
    return () => {
      dispatch(resetWhish());
    };
  }, [user_id, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) return setKo(t("deposit_err_user"));
    if (!to) return setKo(t("deposit_err_to")); // ▼ now required
    if (amount <= 0) return setKo(t("deposit_err_amount"));
    
    try {
      await dispatch(
        sendWhishDeposit({
          user_id,
          to,
          amount,
          currency,
        })
      ).unwrap();
      // success → show confirmation
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
          {t("deposit_whish_title", "Deposit — Whish Money")}
        </Typography>

        {/* STEP 1: form */}
        {!redirect && (
          <Box component="form" onSubmit={handleSubmit}>
            {/* ▼ REQUIRED account selector (same as Skrill/Neteller) */}
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
              {["USD", "EUR", "GBP"].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>


            <Box textAlign="right" mt={2}>
              <Button
                variant="contained"
                type="submit"
                
              >
                {t("send")}
              </Button>
            </Box>
          </Box>
        )}

        {/* STEP 2: confirmation + Pay now */}
        {redirect && payload && (
          <Box>
            <Typography paragraph>
              {t(
                "whish_confirm_text",
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

            <Box mt={1}>
              <Button
                href={redirect}
                variant="contained"
                size="large"
                
              >
                {t("pay_now")}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
