import { Box, Button, Paper, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

function pickQueryValue(params: URLSearchParams, keys: string[]): string {
  for (const key of keys) {
    const value = (params.get(key) || "").trim();
    if (value !== "") {
      return value;
    }
  }
  return "";
}

export default function GooglePayResultPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const reference = pickQueryValue(query, ["reference", "merchant_order_id", "order_id", "id"]);
  const status = pickQueryValue(query, ["status", "result", "payment_status"]);
  const amount = pickQueryValue(query, ["amount", "payment_amount", "total", "total_amount"]);
  const currency = pickQueryValue(query, ["currency", "payment_currency"]);
  const displayedAmount = useMemo(() => {
    if (amount === "") {
      return "";
    }

    const numericAmount = Number(amount);
    return Number.isFinite(numericAmount) ? numericAmount.toFixed(2) : amount;
  }, [amount]);
  const paymentMethod =
    pickQueryValue(query, ["payment_method", "method", "paymentMethod"]) || "Google Pay";

  return (
    <Box sx={{ p: { xs: 2 } }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("deposit_googlepay_result_title", "Google Pay payment received")}
        </Typography>

        <Typography sx={{ mb: 2 }}>
          {t(
            "deposit_googlepay_result_message",
            "Your payment has been completed and is being processed automatically."
          )}
        </Typography>

        {reference !== "" && (
          <Typography sx={{ mb: 1 }}>
            {t("reference", "Reference")}: {reference}
          </Typography>
        )}

        {status !== "" && (
          <Typography sx={{ mb: 2 }}>
            {t("status", "Status")}: {status}
          </Typography>
        )}

        <Typography sx={{ mb: 1 }}>
          {t("payment_method", "Payment method")}: {paymentMethod}
        </Typography>

        {displayedAmount !== "" && (
          <Typography sx={{ mb: 2 }}>
            {t("amount", "Amount")}: {displayedAmount} {currency}
          </Typography>
        )}

        <Button variant="contained" onClick={() => nav("/deposit")}>
          {t("go_to_deposit", "Go to deposit")}
        </Button>
      </Paper>
    </Box>
  );
}
