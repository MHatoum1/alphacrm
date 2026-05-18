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
  sendWhishWithdraw,
  resetWhish,
  fetchWhishWithdrawAccounts,
} from "@/redux/slices/whishSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

// const CYPRUS_TIME_ZONE = "Asia/Beirut";
const LEBANON_COUNTRY = "LEBANON";
const LEBANON_PHONE_CODE = "961";
const LEBANESE_PHONE_RE = /^\d{7,8}$/;
const normalizeLebanesePhone = (value: string) =>
  value.replace(/\D/g, "").replace(/^0/, "");

// function isWhishWithdrawalBlocked(now = new Date()) {
//   const parts = new Intl.DateTimeFormat("en-GB", {
//     timeZone: CYPRUS_TIME_ZONE,
//     weekday: "short",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   }).formatToParts(now);

//   const weekday = parts.find((part) => part.type === "weekday")?.value;
//   const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
//   const minute = Number(
//     parts.find((part) => part.type === "minute")?.value ?? "0"
//   );

//   if (weekday === "Sat" || weekday === "Sun") {
//     return true;
//   }

//   return hour > 23 || (hour === 23 && minute >= 30);
// }

/* matches /withdraw/whish */
export default function WhishWithdrawPage() {
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
  const [wallet, setWallet] = useState(""); // account uid to credit (required)
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);
  // const whishWithdrawalBlocked = isWhishWithdrawalBlocked();

  // after API returns redirect_url
  useEffect(() => {
    if (payload) setOk(t("withdraw_request_ok"));
  }, [payload, t]);

  // load selectable accounts once
  useEffect(() => {
    if (user_id) dispatch(fetchWhishWithdrawAccounts(user_id));
    return () => {
      dispatch(resetWhish());
    };
  }, [user_id, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user_id) return setKo(t("withdraw_err_user"));
    if (!wallet) return setKo(t("withdraw_err_to")); // ▼ now required
    if (amount <= 0) return setKo(t("withdraw_err_amount"));
    if (!pin) return setKo(t("withdraw_err_pin"));
    if (!phone) return setKo(t("phone_number_is_required"));
    const normalizedPhone = normalizeLebanesePhone(phone);
    if (!LEBANESE_PHONE_RE.test(normalizedPhone)) {
      return setKo(t("###Wrong phone number###"));
    }
    // if (whishWithdrawalBlocked) {
    //   return setKo("withdraw_whish_unavailable_schedule");
    // }
    try {
      await dispatch(
        sendWhishWithdraw({
          user_id,
          wallet,
          amount,
          currency,
          pin,
          phone: `${LEBANON_PHONE_CODE}${normalizedPhone}`,
        })
      ).unwrap();
      setOk(t("withdraw_request_ok"));
      // success → show confirmation
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

        {/* {whishWithdrawalBlocked && (
          <Typography color="error" sx={{ mb: 2 }}>
            {t("withdraw_whish_unavailable_schedule")}
          </Typography>
        )} */}

        <Typography variant="h6" gutterBottom>
          {t("withdraw_whish_title", "Withdraw — Whish Money")}
        </Typography>

        {/* STEP 1: form */}
        {!payload && (
          <Box component="form" onSubmit={handleSubmit}>
            {/* ▼ REQUIRED account selector (same as Skrill/Neteller) */}
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
              {["USD", "EUR", "GBP"].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              required
              margin="normal"
              label={t("country")}
              value={LEBANON_COUNTRY}
              InputProps={{ readOnly: true }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                type="tel"
                required
                margin="normal"
                label={t("phone_code")}
                placeholder="+1"
                value={LEBANON_PHONE_CODE}
                InputProps={{ readOnly: true }}
                sx={{ flex: "0 0 140px" }}
              />
              <TextField
                type="tel"
                required
                margin="normal"
                label={t("phone")}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                inputProps={{ inputMode: "numeric", maxLength: 8 }}
                sx={{ flex: 1 }}
              />
            </Box>
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
                // disabled={whishWithdrawalBlocked}
              >
                {t("send")}
              </Button>
            </Box>
          </Box>
        )}

        {/* STEP 2: confirmation + Pay now */}
        {payload && (
          <Box>
            <Typography paragraph>
              {t(
                "whish_confirmation_done",
                "Here are the details for your payment."
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

            <Typography paragraph>
              {t(
                "whish_confirmation_details",
                "Nothing is required from your side. Once the payment is processed, the funds will be withdrawn from your Whish Money account."
              )}
            </Typography>

            {/* 3) Only show Pay Now if redirect actually exists */}
            {redirect ? (
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
            ) : null}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
