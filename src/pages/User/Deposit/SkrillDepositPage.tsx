import {
  Box,
  Button,
  CircularProgress,
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
import { useLocation, useNavigate } from "react-router-dom"; // ⬅️ NEW
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchSkrillAccounts,
  sendSkrillDeposit,
  resetSkrill,
} from "@/redux/slices/skrillSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function SkrillDepositPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const { pathname, search } = useLocation(); // ⬅️ NEW

  /* ─── detect /deposit/skrill/result ─────────────────────────── */
  const isResult = pathname.endsWith("/result"); // ⬅️ NEW

  /* ─── current user id ───────────────────────────────────────── */
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  /* ─── slice state ───────────────────────────────────────────── */
  const { rows, status, error, redirect } = useAppSelector((s) => s.skrill);
  const payment = useAppSelector((s) => s.skrill.payload);

  /* ─── local form state ──────────────────────────────────────── */
  const [to, setTo] = useState("");
  const [amount, setAmt] = useState<number>(0);
  const [curr, setCurr] = useState("USD");
  const [email, setEmail] = useState("");

  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);

  /* load accounts once (skip when on /result) ------------------- */
  useEffect(() => {
    if (!isResult && user_id) dispatch(fetchSkrillAccounts(user_id)); // ⬅️ change
    return () => {
      dispatch(resetSkrill());
    };
  }, [isResult, user_id, dispatch]); // ⬅️ change

  /* tiny banner when step-2 is reached -------------------------- */
  useEffect(() => {
    if (redirect) setOk(t("confirm_payment_details"));
  }, [redirect, t]);

  /* ⬅️ NEW: handle provider callback status on /result ---------- */
  useEffect(() => {
    if (!isResult) return;
    const q = new URLSearchParams(search);
    const status = q.get("status");
    

    if (status === "2") {
      setOk(t("deposit_skrill_pending_confirmation"));
      setKo(false);
    } else if (status === "-1") {
       setKo(t("deposit_skrill_failed"));
      setOk(false);
    } else {
      // Unknown / missing status -> treat as failure
      setKo(t("deposit_skrill_failed"));
      setOk(false);
    }
  }, [isResult, search]);

  /* submit ------------------------------------------------------ */
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

    try {
      await dispatch(
        sendSkrillDeposit({ user_id, to, amount, currency: curr, email })
      ).unwrap();
    } catch (err: any) {
      setKo(err?.message || t("deposit_err_default"));
    }
  };

  /* helpers ----------------------------------------------------- */
  const menu = (r: any) => (
    <MenuItem key={r.uid} value={r.uid}>
      {r.label}
    </MenuItem>
  );

  /* ─── render ────────────────────────────────────────────────── */
  if (status === "loading" && !isResult) // ⬅️ don't block /result view
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (status === "failed" && !isResult)
    return (
      <CustomError
        errorMessage={error || t("deposit_err_default")}
        onClose={() => nav("/deposit")}
      />
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
        {/* banners */}
        {ok && <CustomNotification message={ok} onClose={() => setOk(false)} />}
        {ko && <CustomError errorMessage={ko} onClose={() => setKo(false)} />}

        {/* If this is the callback URL, we only show the banners */}
        {isResult ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t("deposit_skrill_title")}
            </Typography>
            {/* Optionally add a back button */}
            <Box mt={2}>
              <Button variant="outlined" onClick={() => nav("/deposit")}>
                {t("back")}
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              {t("deposit_skrill_title")}
            </Typography>

            {/* STEP 1 – form */}
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
                  label={t("skrill_email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Box textAlign="right" mt={2}>
                  <Button variant="contained" type="submit">
                    {t("send")}
                  </Button>
                </Box>
              </Box>
            )}

            {/* STEP 2 – confirmation */}
            {redirect && payment && (
              <Box>
                <Typography paragraph>{t("skrill_confirm_text")}</Typography>

                <List sx={{ display: "inline-block", textAlign: "left", mb: 2 }}>
                  <ListItem dense>
                    <ListItemText primary={`${t("amount")}: ${payment.amount}`} />
                  </ListItem>
                  <ListItem dense>
                    <ListItemText primary={`${t("currency")}: ${payment.currency}`} />
                  </ListItem>
                  {payment.reference && (
                    <ListItem dense>
                      <ListItemText primary={`${t("reference")}: ${payment.reference}`} />
                    </ListItem>
                  )}
                </List>

                <Box mt={1}>
                  <Button href={redirect} variant="contained" size="large" target="_blank">
                    {t("pay_now")}
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
