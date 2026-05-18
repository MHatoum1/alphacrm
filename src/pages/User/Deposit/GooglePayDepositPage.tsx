import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchGooglePayConfig,
  fetchUnlimitAccounts,
  resetUnlimit,
  sendUnlimitGooglePayDeposit,
} from "@/redux/slices/unlimitSlice";
import CustomError from "@/components/ui/CustomError";

declare global {
  interface Window {
    google?: any;
  }
}

export default function GooglePayDepositPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const buttonHostRef = useRef<HTMLDivElement | null>(null);

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  const { status, saving, error, accounts, googlePayConfig, redirect } = useAppSelector(
    (s) => s.unlimit
  );

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [ko, setKo] = useState<string | false>(false);

  const formattedAmount = useMemo(
    () => (Number.isFinite(amount) && amount > 0 ? Number(amount).toFixed(2) : "0.00"),
    [amount]
  );

  useEffect(() => {
    if (!user_id) return;
    dispatch(fetchUnlimitAccounts(user_id));
    dispatch(fetchGooglePayConfig(user_id));
    return () => {
      dispatch(resetUnlimit());
    };
  }, [dispatch, user_id]);

  const baseMethod = useMemo(
    () => ({
      type: "CARD",
      parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: ["VISA", "MASTERCARD"],
      },
    }),
    []
  );

  useEffect(() => {
    if (!googlePayConfig || !buttonHostRef.current) return;

    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.google?.payments?.api) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(
          'script[src="https://pay.google.com/gp/p/js/pay.js"]'
        );
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(), { once: true });
          return;
        }
        const s = document.createElement("script");
        s.src = "https://pay.google.com/gp/p/js/pay.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject();
        document.body.appendChild(s);
      });

    let disposed = false;
    ensureScript()
      .then(() => {
        if (disposed) return;
        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: googlePayConfig.environment,
        });
        paymentsClient
          .isReadyToPay({
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [baseMethod],
          })
          .then((resp: any) => {
            if (!resp?.result || !buttonHostRef.current) return;
            buttonHostRef.current.innerHTML = "";
            const btn = paymentsClient.createButton({
              onClick: () => onGooglePayClick(paymentsClient),
            });
            buttonHostRef.current.appendChild(btn);
          })
          .catch(() => setKo("Google Pay is not available on this device/browser."));
      })
      .catch(() => setKo("Failed to load Google Pay script."));

    return () => {
      disposed = true;
    };
  }, [googlePayConfig, baseMethod, to, amount, currency]);

  useEffect(() => {
    if (redirect) {
      window.location.assign(redirect);
    }
  }, [redirect]);

  const onGooglePayClick = async (paymentsClient: any) => {
    if (!user_id) return setKo(t("deposit_err_user"));
    if (!to) return setKo(t("deposit_err_to"));
    if (amount <= 0) return setKo(t("deposit_err_amount"));
    if (!googlePayConfig) return setKo("Google Pay config missing.");

    try {
      const paymentData = await paymentsClient.loadPaymentData({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            ...baseMethod,
            tokenizationSpecification: {
              type: "PAYMENT_GATEWAY",
              parameters: {
                gateway: googlePayConfig.gateway,
                gatewayMerchantId: googlePayConfig.gatewayMerchantId,
              },
            },
          },
        ],
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: formattedAmount,
          currencyCode: currency,
          countryCode: googlePayConfig.countryCode,
        },
        merchantInfo: {
          merchantName: googlePayConfig.merchantName,
        },
      });

      const token = paymentData?.paymentMethodData?.tokenizationData?.token;
      if (!token) throw new Error("Missing Google Pay token");

      const result = await dispatch(
        sendUnlimitGooglePayDeposit({
          user_id,
          to,
          amount,
          currency,
          googlepay_token: token,
        })
      ).unwrap();

      if (result?.redirect_url) {
        window.location.assign(result.redirect_url);
        return;
      }

      const resultParams = new URLSearchParams({
        amount: formattedAmount,
        currency,
        payment_method: "Google Pay",
      });
      if (result?.reference) {
        resultParams.set("reference", result.reference);
      }
      nav(`/deposit/googlepay/result?${resultParams.toString()}`);
    } catch (e: any) {
      setKo(e?.message || t("deposit_err_default"));
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

  return (
    <Box sx={{ p: { xs: 2 } }}>
      <Paper sx={{ p: 2 }}>
        {ko && <CustomError errorMessage={t(ko)} onClose={() => setKo(false)} />}

        <Typography variant="h6" gutterBottom>
          {t("deposit_googlepay_title", "Deposit - Google Pay")}
        </Typography>

        <TextField
          select
          fullWidth
          required
          margin="normal"
          label={t("to_account")}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          {(accounts || []).map((row: any) => (
            <MenuItem key={row.uid} value={row.uid}>
              {row.label}
            </MenuItem>
          ))}
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

        <Box mt={2}>
          {saving === "loading" ? (
            <Button variant="contained" disabled>
              {t("loading", "Loading...")}
            </Button>
          ) : saving === "succeeded" ? (
            <Button variant="contained" onClick={() => nav("/deposit")}>
              {t("go_to_deposit", "Go to deposit")}
            </Button>
          ) : (
            <div ref={buttonHostRef} />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
