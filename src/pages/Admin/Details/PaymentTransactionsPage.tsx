// src/pages/PaymentTransactionsPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchPaymentInit,
  startPayment,
  clearConfirmation,
} from "@/redux/slices/paymentTransactionsSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";

export default function PaymentTransactionsPage() {
  const { id } = useParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  // snackbars
  const [okMsg, setOkMsg] = useState<string | false>(false);
  const [errMsg, setErrMsg] = useState<string | false>(false);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchPaymentInit(id));
    dispatch(clearConfirmation());
    setOkMsg(false);
    setErrMsg(false);
  }, [dispatch, id]);

  const { initStatus, initError, initData, confirmStatus, confirmError } =
    useAppSelector((s) => s.paymentTransactions);

  // form state
  const [to, setTo] = useState("");
  const [operation, setOperation] = useState("");
  const [currency, setCurrency] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [comment, setComment] = useState("");

  // dynamic button labels
  const [depositLabel, setDepositLabel] = useState(t("deposit", "Deposit"));
  const [withdrawLabel, setWithdrawLabel] = useState(t("withdraw", "Withdraw"));
  useEffect(() => {
    if (operation === "Credit") {
      setDepositLabel(t("credit_in", "Credit in"));
      setWithdrawLabel(t("credit_out", "Credit out"));
    } else if (operation === "Bonus") {
      setDepositLabel(t("bonus_in", "Bonus in"));
      setWithdrawLabel(t("bonus_out", "Bonus out"));
    } else {
      setDepositLabel(t("deposit", "Deposit"));
      setWithdrawLabel(t("withdraw", "Withdraw"));
    }
  }, [operation]);

  // reset form if user restarts
  useEffect(() => {
    if (confirmStatus === "idle") {
      setTo("");
      setOperation("");
      setCurrency("");
      setAmount(0);
      setComment("");
    }
  }, [confirmStatus]);

  // when init fails
  useEffect(() => {
    if (initStatus === "failed") {
      setErrMsg(
        initError || t("payment_form_failed", "Failed to load payment form")
      );
    }
  }, [initStatus, initError]);

  // when payment request fails or succeeds
  useEffect(() => {
    if (confirmStatus === "failed") {
      setErrMsg(
        confirmError || t("payment_prepare_failed", "Unable to prepare payment")
      );
    }
    if (confirmStatus === "succeeded") {
      setOkMsg(t("payment_succeeded"));
    }
  }, [confirmStatus, confirmError]);

  // ── Guards for init-loading and missing ID
  if (!id) {
    return (
      <CustomError
        errorMessage={t("missing_user_id", "Missing user id in the URL")}
        onClose={() => {}}
      />
    );
  }
  if (initStatus === "loading" || initStatus === "idle") {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // initData is now guaranteed
  const { accOptions, gacsOptions, operations, currencyOptions } = initData!;

  return (
    <Paper sx={{ p: 3, mx: "auto" }}>
      {okMsg && (
        <CustomNotification message={okMsg} onClose={() => setOkMsg(false)} />
      )}
      {errMsg && (
        <CustomError errorMessage={errMsg} onClose={() => setErrMsg(false)} />
      )}

      <Typography variant="h6" gutterBottom>
        {t("cash_payment", "Cash Payment")}
      </Typography>

      <Stack spacing={2}>
        {/* To account */}
        <FormControl fullWidth>
          <InputLabel>{t("to_account", "To Account")} </InputLabel>
          <Select
            value={to}
            label="To Account"
            onChange={(e) => setTo(e.target.value)}
          >
            {[...accOptions, ...gacsOptions].map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Operation */}
        <FormControl fullWidth>
          <InputLabel>{t("operation", "Operation")} </InputLabel>
          <Select
            value={operation}
            label="Operation"
            onChange={(e) => setOperation(e.target.value)}
          >
            {operations.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Currency */}
        <FormControl fullWidth>
          <InputLabel>{t("currency", "Currency")}</InputLabel>
          <Select
            value={currency}
            label="Currency"
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencyOptions.map((o) => (
              <MenuItem key={o.value} value={o.label}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Amount */}
        <TextField
          label={t("amount", "Amount")}
          type="number"
          inputProps={{ step: 0.01, min: 0 }}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          fullWidth
        />

        {/* Comment */}
        <TextField
          label={t("comment", "Comment")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        {/* Action buttons */}
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              dispatch(
                startPayment({
                  userId: id,
                  to,
                  operation,
                  currency_target: currency,
                  amount,
                  comment,
                  method: "deposit",
                })
              );
            }}
          >
            {depositLabel}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              dispatch(
                startPayment({
                  userId: id,
                  to,
                  operation,
                  currency_target: currency,
                  amount,
                  comment,
                  method: "withdraw",
                })
              );
            }}
          >
            {withdrawLabel}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
