import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Link,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchWithdrawalDetails,
  processWithdrawal,
} from "@/redux/slices/adminWithdrawalDetailsSlice";
import CustomError from "@/components/ui/CustomError";
import CustomNotification from "@/components/ui/CustomNotification";

export default function WithdrawalDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { status, data, error } = useSelector((s: RootState) => s.withdrawal);
  const { t } = useTranslation();

  const cached = localStorage.getItem("user");
  const admin = cached ? JSON.parse(cached) : null;

  if (!admin?.uid) throw new Error("No admin user in storage");

  /* local form */
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("");

  /* snackbars */
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (id) dispatch(fetchWithdrawalDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (status === "idle" && data.transaction) {
      setAmount(String(data.toRefund));
      setComment(`W${data.transaction.id}-${data.methodName}`);
    }
  }, [status, data]);

  const Label = ({
    text,
    color,
  }: {
    text: string;
    color: "success" | "error" | "warning" | "info";
  }) => <Chip size="small" label={text} color={color} sx={{ ml: 1 }} />;

  const act = async (
    action:
      | "approve"
      | "decline"
      | "close"
      | "back2processing"
  ) => {
    try {
      if (!id) return;
      await dispatch(
        processWithdrawal({
          transaction_id: id,
          amount_to_withdraw: amount,
          tp_comment: comment,
          reason,
          action,
        })
      ).unwrap();
      setOk(t("action_success"));
      dispatch(fetchWithdrawalDetails(id));
    } catch (e: any) {
      setErr(e ?? "Error");
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
        {t("withdraw_details")} #<b>{data.transaction?.id}</b>
      </Typography>

      <Grid container spacing={2}>
        {/* COLUMN 1 – WITHDRAW INFO */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("withdraw_info")}
            </Typography>
            <Info l="Method" v={data.methodName} />
            <Info l="Instrument">{renderInstrument(data)}</Info>
            <Info l="Date">{data.transaction?.date_created}</Info>
            <Info l="Amount">
              {data.transaction?.amount} {data.transaction?.currency}
            </Info>
            <Info l={t("amount_to_withdraw")}>
              {data.toRefund} {data.wallet?.currency}
            </Info>
            <Info l={t("amount_withdrawn")}>
              {data.totalRefunds} {data.wallet?.currency}
              {data.toRefund === data.totalRefunds ? (
                <Label text="✓" color="success" />
              ) : (
                <Label text="!" color="warning" />
              )}
            </Info>
          </Paper>
        </Grid>

        {/* COLUMN 2 – CLIENT INFO (same as deposit) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("client_info")}
            </Typography>
            {/* status chips */}
            {/* … identical to Deposit page … */}
            <Info l="Name">
              <Link
                target="_blank"
                href={`/detailed/personal/${data.user?.id}`}
              >
                {data.user?.name}
              </Link>
            </Info>
            <Info l="Email">
              <Link href={`mailto:${data.user?.email}`}>
                {data.user?.email}
              </Link>
            </Info>
            <Info l="Account">
              {data.wallet?.login} [{data.wallet?.currency}]
            </Info>
            <Info l="Balance">
              {data.wallet?.balance} {data.wallet?.currency}
              {(data.wallet?.balance ?? 0) >= data.toRefund ? (
                <Label text="✓" color="success" />
              ) : (
                <Label text="X" color="warning" />
              )}
            </Info>
            <Info l="Type">{data.wallet?.isglobal ? "Wallet" : "Trading"}</Info>
          </Paper>
        </Grid>

        {/* COLUMN 3 – PROCESSING INFO */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("processing_info")}
            </Typography>
            <Info l="Payment Status">
              {renderStatus(
                data.transaction?.status
                  ? data.transaction.status
                  : ""
              )}
            </Info>

           
            <Info l="Status">
              {renderFinishedStatus(
                data.transaction?.finished
                  ? data.transaction.status_finished
                  : ""
              )}
            </Info>
            {data.transaction?.finished && (
              <Info l="Processed">{data.transaction.finished}</Info>
            )}
            <Info l="Platform order">
              {data.transaction?.platform_order_id || (
                <Label text="EMPTY" color="error" />
              )}
            </Info>
            <Info l="Processor order">
              {data.info?.transactionID || <Label text="EMPTY" color="error" />}
            </Info>
          </Paper>
        </Grid>
      </Grid>

      {/* ACTIONS */}
      {!data.transaction?.finished ? (
        <Paper sx={{ p: 2, my: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label={t("amount_to_withdraw")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1 }}>{data.wallet?.currency}</Box>
                  ),
                }}
              />
              <TextField
                fullWidth
                size="small"
                sx={{ mt: 1 }}
                label={t("comment_platform")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                minRows={3}
                sx={{ mt: 1 }}
                label={t("comments")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Grid>
            {(admin?.acl?.includes("admin") || admin?.acl?.includes("dealers")) && (
              <Grid
                item
                xs={12}
                md={6}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => act("approve")}
                >
                  {t("approve")}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => act("decline")}
                >
                  {t("decline")}
                </Button>
                <Button onClick={() => act("close")}>{t("close_case")}</Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              window.confirm(t("are_you_sure")) && act("back2processing")
            }
          >
            {t("return_to_not_processed")}
          </Button>
        </Box>
      )}
    </Paper>
  );
}

/* helpers ---------------------------------------------------- */
const Info = ({
  l,
  v,
  children,
}: {
  l: string;
  v?: any;
  children?: React.ReactNode;
}) => (
  <Box sx={{ display: "flex", mb: 0.5 }}>
    <Box sx={{ width: 155, fontWeight: 500 }}>{l}</Box>
    <Box sx={{ flex: 1 }}>{children ?? v}</Box>
  </Box>
);

function renderInstrument(d: any) {
  const instrument = d.instrument ?? {};
  const purse = instrument.purse ?? d.purse ?? null;
  const hasCardMeta =
    Boolean(instrument.cardType) ||
    Boolean(instrument.cardNumber) ||
    Boolean(instrument.expires) ||
    Boolean(instrument.cardIssuer);

  if (!purse && !hasCardMeta) {
    return <Chip size="small" label="no instrument" color="error" />;
  }

  return (
    <Box>
      {purse && (
        <Box sx={{ mb: hasCardMeta ? 1 : 0 }}>
          <Link
            target="_blank"
            href={`/transactions/cards/detailed/${purse.uid}`}
          >
            {purse.purse}
          </Link>
        </Box>
      )}
      {instrument.cardType && <Box>Card Type: {instrument.cardType}</Box>}
      {instrument.cardNumber && <Box>Card Number: {instrument.cardNumber}</Box>}
      {instrument.expires && <Box>Expires: {instrument.expires}</Box>}
      {instrument.cardIssuer && <Box>Card Issuer: {instrument.cardIssuer}</Box>}
    </Box>
  );
}
function renderFinishedStatus(st: string) {
  if (st === "approved")
    return <Chip size="small" label={st} color="success" />;
  if (st === "declined") return <Chip size="small" label={st} color="error" />;
  if (!st) return <Chip size="small" label="NOT PROCESSED" />;
  return <Chip size="small" label={st} />;
}


function renderStatus(st: string) {
  if (st === "success")
    return <Chip size="small" label={st.toUpperCase()} color="success" />;
  if (st === "error") return <Chip size="small" label={st.toUpperCase()} color="error" />;
  if (st === "pending" || st === "new")
    return <Chip size="small" label={st.toUpperCase()} color="warning" />;
  if (!st) return <Chip size="small" label="PENDING" />;
  return <Chip size="small" label={st} />;
}
