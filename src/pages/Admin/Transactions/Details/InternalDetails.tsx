import {
  Box,
  Grid,
  Paper,
  Typography,
  Link,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { RootState, AppDispatch } from "@/redux/store";
import {
  fetchTransferDetails,
  completeTransfer,
} from "@/redux/slices/adminTransferDetailsSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import StatusLabel from "@/components/ui/StatusLabel";

export default function TransferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { status, data, error } = useSelector((s: RootState) => s.transfer);
  const { t } = useTranslation();

  /* editable order-ids */
  const [orderW, setOrderW] = useState("");
  const [orderD, setOrderD] = useState("");

  /* snackbars */
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (id) dispatch(fetchTransferDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (status === "idle" && data.withdraw) {
      setOrderW(data.withdraw.trx.platform_order_id || "");
      setOrderD(data.deposit.trx.platform_order_id || "");
    }
  }, [status, data]);

  const handleComplete = async () => {
    if (!id) return;
    if (!window.confirm(t("are_you_sure"))) return;
    try {
      await dispatch(completeTransfer(id)).unwrap();
      setOk(t("action_success"));
      dispatch(fetchTransferDetails(id));
    } catch (e: any) {
      setErr(e.message || "Error");
    }
  };

  if (status === "loading")
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Paper sx={{ p: 3 }}>
      {ok && <CustomNotification message={ok} onClose={() => setOk("")} />}
      {(err || error) && (
        <CustomError
          errorMessage={err || error || "Error"}
          onClose={() => setErr("")}
        />
      )}
      <Typography variant="h5" gutterBottom>
        {t("transaction_details")} #<b>{data.withdraw?.trx.id}</b> – #
        <b>{data.deposit?.trx.id}</b>
      </Typography>

      <Grid container spacing={2}>
        {/* WITHDRAW column */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("withdraw_info")}
            </Typography>
            <Info l="Status">
              {data.withdraw?.trx.status && (
                <StatusLabel statusKey={data.withdraw.trx.status} />
              )}
            </Info>

            <Info l="From account">
              <Link
                target="_blank"
                href={`/accounts/detailed/${data.withdraw?.trx.account_id}`}
              >
                {data.withdraw?.account.login}
              </Link>
            </Info>
            <Info l="Reference">
              {data.withdraw?.trx.reference || (
                <StatusLabel label="—" statusKey="unverified" />
              )}
            </Info>

            <Info l="Date">{data.withdraw?.trx.date_created}</Info>
            <Info l="Amount">
              {data.withdraw?.trx.amount} {data.withdraw?.trx.currency}
            </Info>

            <Info l="Platform order ID">
              <TextField
                size="small"
                variant="standard"
                value={orderW}
                onChange={(e) => setOrderW(e.target.value)}
                disabled
              />
            </Info>
          </Paper>
        </Grid>

        {/* DEPOSIT column */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("deposit_info")}
            </Typography>
            <Info l="Status">
              {data.deposit?.trx.status && (
                <StatusLabel statusKey={data.deposit.trx.status} />
              )}
            </Info>

            <Info l="To account">
              <Link
                target="_blank"
                href={`/accounts/detailed/${data.deposit?.trx.account_id}`}
              >
                {data.deposit?.account.login}
              </Link>
            </Info>
            <Info l="Reference">
              {data.deposit?.trx.reference || (
                <StatusLabel label="—" statusKey="unverified" />
              )}
            </Info>

            <Info l="Date">{data.deposit?.trx.date_created}</Info>
            <Info l="Amount">
              {data.deposit?.trx.amount} {data.deposit?.trx.currency}
            </Info>

            <Info l="Platform order ID">
              <TextField
                size="small"
                variant="standard"
                value={orderD}
                onChange={(e) => setOrderD(e.target.value)}
                disabled
              />
            </Info>
          </Paper>
        </Grid>
      </Grid>

      {(data.withdraw?.trx.status !== "success" ||
        data.deposit?.trx.status !== "success") && (
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleComplete}>
            {t("complete_transaction")}
          </Button>
        </Box>
      )}
    </Paper>
  );
}

/* tiny helper */
const Info = ({ l, children }: { l: string; children: React.ReactNode }) => (
  <Box sx={{ display: "flex", mb: 0.5 }}>
    <Box sx={{ width: 160, fontWeight: 500 }}>{l}</Box>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);
