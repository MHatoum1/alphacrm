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
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchApplePayConfig,
  sendUnlimitApplePayDeposit,
  resetUnlimit,
  fetchUnlimitAccounts,
} from "@/redux/slices/unlimitSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import axiosInstance from "@/api/axiosInstance";

declare global {
  interface Window {
    ApplePaySession?: any;
  }
}

export default function ApplePayDepositPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  const { status, saving, error, redirect, payload, accounts, applePayConfig } = useAppSelector(
    (s) => s.unlimit
  );

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);
  const [applePayReady, setApplePayReady] = useState(false);
  const [applePayCheckDone, setApplePayCheckDone] = useState(false);
  const [applePayUnavailableReason, setApplePayUnavailableReason] = useState("");
  const redirectStartedRef = useRef(false);

  const encodeApplicationData = (value: string) => {
    if (typeof window === "undefined" || typeof window.btoa !== "function") {
      return value;
    }

    try {
      return window.btoa(value);
    } catch {
      return value;
    }
  };

  useEffect(() => {
    if (!redirect || redirectStartedRef.current) {
      return;
    }

    redirectStartedRef.current = true;
    window.location.assign(redirect);
  }, [redirect]);

  useEffect(() => {
    if (user_id) dispatch(fetchUnlimitAccounts(user_id));
    if (user_id) dispatch(fetchApplePayConfig(user_id));
    return () => {
      dispatch(resetUnlimit());
    };
  }, [user_id, dispatch]);

  useEffect(() => {
    let active = true;

    const checkApplePayAvailability = async () => {
      if (!applePayConfig?.merchantIdentifier) {
        if (!active) return;
        setApplePayReady(false);
        setApplePayCheckDone(true);
        setApplePayUnavailableReason("Apple Pay merchant identifier is missing.");
        return;
      }

      if (!window.ApplePaySession) {
        if (!active) return;
        setApplePayReady(false);
        setApplePayCheckDone(true);
        setApplePayUnavailableReason("Apple Pay is not available on this device/browser.");
        return;
      }

      if (window.ApplePaySession.canMakePayments()) {
        if (!active) return;
        setApplePayReady(true);
        setApplePayCheckDone(true);
        setApplePayUnavailableReason("");
        return;
      }

      try {
        const canMakePaymentsWithActiveCard =
          typeof window.ApplePaySession.canMakePaymentsWithActiveCard === "function"
            ? await window.ApplePaySession.canMakePaymentsWithActiveCard(
                applePayConfig.merchantIdentifier
              )
            : false;

        if (!active) return;

        if (canMakePaymentsWithActiveCard) {
          setApplePayReady(true);
          setApplePayUnavailableReason("");
        } else {
          setApplePayReady(false);
          setApplePayUnavailableReason(
            "Apple Pay is available, but no active supported card is ready for this merchant."
          );
        }
      } catch (err: any) {
        if (!active) return;
        setApplePayReady(false);
        setApplePayUnavailableReason(
          err?.message || "Unable to verify Apple Pay card availability."
        );
      } finally {
        if (active) {
          setApplePayCheckDone(true);
        }
      }
    };

    setApplePayCheckDone(false);
    setApplePayReady(false);
    setApplePayUnavailableReason("");
    void checkApplePayAvailability();

    return () => {
      active = false;
    };
  }, [applePayConfig]);

  const validateAppleMerchant = async (validationUrl: string) => {
    const f = new FormData();
    f.append("action", "validateApplePayMerchant");
    if (user_id) f.append("user_id", user_id);
    f.append("validation_url", validationUrl);
    const { data } = await axiosInstance.post("/unlimitpayment", f);
    return data?.data?.merchant_session;
  };

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
    if (!applePayConfig) {
      setKo("Apple Pay config missing");
      return;
    }
    if (!applePayReady) {
      setKo(applePayUnavailableReason || "Apple Pay cannot make payments on this device.");
      return;
    }

    try {
      const formattedAmount = Number(amount).toFixed(2);
      const request = {
        applicationData: encodeApplicationData(
          JSON.stringify({
            user_id,
            to,
            amount: formattedAmount,
            currency,
          })
        ),
        countryCode: applePayConfig.countryCode || "US",
        currencyCode: currency,
        merchantCapabilities: applePayConfig.merchantCapabilities || ["supports3DS"],
        supportedNetworks: applePayConfig.supportedNetworks || ["visa", "masterCard", "amex"],
        supportedCountries: [applePayConfig.countryCode || "US"],
        total: {
          label: applePayConfig.displayName || "Apple Pay",
          amount: formattedAmount,
          type: "final",
        },
      };

      const session = new window.ApplePaySession(10, request);

      session.onvalidatemerchant = async (event: any) => {
        try {
          const merchantSession = await validateAppleMerchant(event.validationURL);
          if (!merchantSession) {
            throw new Error("Missing merchant session");
          }
          session.completeMerchantValidation(merchantSession);
        } catch (err: any) {
          setKo(err?.message || "Merchant validation failed");
          session.abort();
        }
      };

      session.onpaymentauthorized = async (event: any) => {
        try {
          const payment = event?.payment;
          const paymentToken = payment?.token || null;
          const paymentData = paymentToken?.paymentData || null;

          if (!paymentData) {
            throw new Error("Missing Apple Pay token");
          }

          await dispatch(
            sendUnlimitApplePayDeposit({
              user_id,
              to,
              amount,
              currency,
              applepay_token: JSON.stringify(paymentToken),
            })
          ).unwrap();

          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        } catch (err: any) {
          setKo(err?.message || t("deposit_err_default"));
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        }
      };

      session.oncancel = () => {
        setKo("Apple Pay payment was canceled.");
      };

      session.begin();
    } catch (err: any) {
      setKo(err?.message || err || t("deposit_err_default"));
    }
  };

  if (status === "loading") {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "failed") {
    return (
      <CustomError
        errorMessage={error || t("deposit_err_default")}
        onClose={() => nav("/deposit")}
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
        {ok && <CustomNotification message={t(ok)} onClose={() => setOk(false)} />}
        {ko && <CustomError errorMessage={t(ko)} onClose={() => setKo(false)} />}

        <Typography variant="h6" gutterBottom>
          {t("deposit_applepay_title", "Deposit - Apple Pay")}
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

            {applePayCheckDone && applePayUnavailableReason && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {applePayUnavailableReason}
              </Typography>
            )}

            <Box textAlign="right" mt={2}>
              <Button
                variant="contained"
                type="submit"
                disabled={saving === "loading" || !applePayReady}
              >
                {saving === "loading" ? t("loading", "Loading...") : t("send")}
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
                <ListItemText primary={`${t("currency")}: ${payload.currency}`} />
              </ListItem>
              {payload.reference && (
                <ListItem dense>
                  <ListItemText primary={`${t("reference")}: ${payload.reference}`} />
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
