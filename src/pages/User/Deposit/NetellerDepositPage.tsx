import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
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
  fetchNetellerAccounts,
  sendNetellerDeposit,
  resetNeteller,
} from "@/redux/slices/netellerSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

/* ▸ matches /deposit/neteller or /deposit/neteller/:code (optional) */
export default function NetellerDepositPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  /* current user -------------------------------------------------- */
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  /* slice state --------------------------------------------------- */
  const { rows, status, error, redirect } = useAppSelector((s) => s.neteller);
  const payment = useAppSelector((s) => s.neteller.payload);
  /* local form state --------------------------------------------- */
  const [to, setTo] = useState("");
  const [amount, setAmt] = useState<number>(0);
  const [curr, setCurr] = useState("USD");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);

  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);

  /* step 2 – after API returns redirect_url */
  useEffect(() => {
    if (redirect) {
      setOk(t("confirm_payment_details"));
    }
  }, [redirect, t]);

  /* load selectable accounts once -------------------------------- */
  useEffect(() => {
    if (user_id) dispatch(fetchNetellerAccounts(user_id));

    return () => {
      dispatch(resetNeteller());
    }; // cleanup on unmount
  }, [user_id, dispatch]);

  /* ----------------------------------------------------------------
     ① normal form submit  →  calls /userdeposit  action=netellerInit
     ② API returns {redirect_url, reference, commission, …}
     ③ we now just show the confirmation banner with the URL
  -----------------------------------------------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) {
      setKo(t("deposit_err_user"));
      return;
    }
    if (!to) {
      setKo(t("deposit_err_to"));
      return;
    }
    if (amount <= 0) {
      setKo(t("deposit_err_amount"));
      return;
    }
    if (!email) {
      setKo(t("deposit_err_email"));
      return;
    }
    if (!agree) {
      setKo(t("deposit_err_agree"));
      return;
    }

    try {
      await dispatch(
        sendNetellerDeposit({ user_id, to, amount, currency: curr, email })
      ).unwrap();
      // success → waiting for redirect click
    } catch (err: any) {
      setKo(err?.message || t("deposit_err_default"));
    }
  };

  /* ──────────────────────────────────────────────────────────── */
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

  /* helper to render <option/>s */
  const menu = (row: any) => (
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
        {ok && <CustomNotification message={ok} onClose={() => setOk(false)} />}
        {ko && <CustomError errorMessage={ko} onClose={() => setKo(false)} />}

        <Typography variant="h6" gutterBottom>
          {t("deposit_neteller_title")}
        </Typography>

        {/* ─── STEP 1 : form ───────────────────────────── */}
        {!redirect && (
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
              {rows.map(menu)}
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
              type="email"
              fullWidth
              required
              margin="normal"
              label={t("neteller_account_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
              }
              label={
                <a
                  href="/documents/Agreement_on_the_Storage_of_the_Cardholders_Credentials.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("agree_neteller_terms")}
                </a>
              }
            />

            <Box textAlign="right" mt={2}>
              <Button variant="contained" type="submit">
                {t("send")}
              </Button>
            </Box>
          </Box>
        )}

        {/* ─── STEP 2 : confirmation ───────────────────── */}
        {/* STEP 2 – confirmation */}
        {redirect && payment && (
          <Box>
            <Typography paragraph>{t("neteller_confirm_text")}</Typography>

            <List sx={{ display: "inline-block", textAlign: "left", mb: 2 }}>
              <ListItem dense>
                <ListItemText primary={`${t("amount")}: ${payment.amount}`} />
              </ListItem>
              <ListItem dense>
                <ListItemText
                  primary={`${t("currency")}: ${payment.currency}`}
                />
              </ListItem>
              {payment.reference && (
                <ListItem dense>
                  <ListItemText
                    primary={`${t("reference")}: ${payment.reference}`}
                  />
                </ListItem>
              )}
            </List>

            {/* ▼ new line for the action button */}
            <Box mt={1}>
              <Button
                href={redirect}
                variant="contained"
                size="large"
                target="_blank"
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
