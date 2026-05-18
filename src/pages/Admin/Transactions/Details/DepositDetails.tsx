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
  fetchDepositDetails,
  processDeposit,
} from "@/redux/slices/adminDepositDetailsSlice";
import CustomError from "@/components/ui/CustomError";
import CustomNotification from "@/components/ui/CustomNotification";

export default function DepositDetailsPage() {
  const { id } = useParams<{ id: string }>(); // /detailed/deposit/:tid
  const dispatch = useDispatch<AppDispatch>();
  const { status, data, error } = useSelector((s: RootState) => s.deposit);
  const { t } = useTranslation();

  const cached = localStorage.getItem("user");
  const admin = cached ? JSON.parse(cached) : null;

  if (!admin?.uid) throw new Error("No admin user in storage");

  /* local form state */
  const [amountDep, setAmountDep] = useState("");
  const [amountSet, setAmountSet] = useState("");
  const [tpComment, setTpComment] = useState("");
  const [reason, setReason] = useState("");

  /* snackbars */
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  /* load */
  useEffect(() => {
    if (id) dispatch(fetchDepositDetails(id));
  }, [dispatch, id]);

  /* populate defaults when data arrives */
  useEffect(() => {
    if (status === "idle" && data.transaction) {
      setAmountDep(
        String(data.transaction.amount_finished || data.transaction.amount)
      );
      setAmountSet(String(data.transaction.amount));
      setTpComment(`D${data.transaction.id}-${data.methodName}`);
    }
  }, [status, data]);

  /* helpers */
  const Label = ({
    text,
    color,
  }: {
    text: string;
    color: "success" | "error" | "warning" | "info";
  }) => <Chip size="small" label={text} color={color} sx={{ ml: 1 }} />;

  /* process action */
  const doAction = async (
    action: "approve" | "decline" | "close" | "back2processing"
  ) => {
    try {
      if (!id) return;
      await dispatch(
        processDeposit({
          transaction_id: id,
          amount_deposit: amountDep,
          amount: amountSet,
          tp_comment: tpComment,
          reason,
          action,
        })
      ).unwrap();
      setOk(t("action_success"));
      dispatch(fetchDepositDetails(id)); // refresh
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
        {t("deposit_details")} #<b>{data.transaction?.id}</b>
      </Typography>

      <Grid container spacing={2}>
        {/* ---- CLIENT INFO ---- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
              {t("client_info")}
            </Typography>
            <InfoLine label="Status">
              {data.user?.verified && <Label text="Verified" color="success" />}
              {data.user?.limited && <Label text="Limited" color="warning" />}
              {data.user?.dormant && <Label text="Dormant" color="warning" />}
              {!data.user?.verified &&
                !data.user?.limited &&
                !data.user?.dormant && (
                  <Label text="UNVERIFIED" color="error" />
                )}
            </InfoLine>
            <InfoLine label="Name">{data.user?.name}</InfoLine>
            <InfoLine label="Email">
              <Link
                target="_blank"
                href={`/detailed/personal/${data.user?.id}`}
              >
                {data.user?.email}
              </Link>
            </InfoLine>
            <InfoLine label="Wallet">
              {data.wallet?.login} {data.wallet?.currency}
            </InfoLine>
            <InfoLine label="Account">
              {data.account
                ? `${data.account.login} ${data.account.currency}`
                : t("keep_in_wallet")}
            </InfoLine>
          </Paper>
        </Grid>

        {/* ---- DEPOSIT INFO ---- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
              {t("deposit_info")}
            </Typography>

            <InfoLine label="Status">
              {data.transaction?.status === "success" ? (
                <Label
                  text={data.transaction.status.toUpperCase()}
                  color="success"
                />
              ) : (
                <Label
                  text={data.transaction?.status.toUpperCase()}
                  color="error"
                />
              )}
            </InfoLine>
            <InfoLine label="Method">{data.methodName}</InfoLine>
            <InfoLine label="Instrument">{renderInstrument(data)}</InfoLine>
            <InfoLine label="Transaction ID">
              {data.info?.transactionID || "—"}
            </InfoLine>
            <InfoLine label="Auth ID">
              {data.info?.authTransactionID || "—"}
            </InfoLine>
            <InfoLine label="Reference">
              {data.transaction?.reference || "—"}
            </InfoLine>
            <InfoLine label="Date">{data.transaction?.date_created}</InfoLine>
            <InfoLine label="Amount">
              {data.transaction?.amount} {data.transaction?.currency}
            </InfoLine>
            <InfoLine label="Commission">{data.commission}%</InfoLine>
          </Paper>
        </Grid>

        {/* ---- PROCESSING ---- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
              {t("processing_info")}
            </Typography>

            <InfoLine label="Capture ID">
              {data.info?.captureTransactionID ? (
                <>
                  {data.info.captureTransactionID}{" "}
                  <Label text="captured" color="success" />
                </>
              ) : (
                <Label text="not captured" color="warning" />
              )}
            </InfoLine>

            <InfoLine label="Platform order">
              {data.transaction?.platform_order_id || (
                <Label text="none" color="error" />
              )}
            </InfoLine>

            {data.transaction?.finished && (
              <>
                <InfoLine label="Status">
                  {renderFinishedStatus(data.transaction.status_finished)}
                </InfoLine>
                <InfoLine label="Processed">
                  {data.transaction.finished}
                </InfoLine>
                <InfoLine label="Amount">
                  {data.transaction.amount_finished} {data.wallet?.currency}
                </InfoLine>
              </>
            )}

            <InfoLine label="Processor answer">
              {data.info?.resultMessage || "N/A"}
            </InfoLine>
          </Paper>
        </Grid>
      </Grid>

      {/* ---------- ACTION FORM (only if NOT finished) ---------- */}
      {!data.transaction?.finished && (
        <Paper sx={{ p: 2, my: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t("amount_to_deposit")}
                value={amountDep}
                onChange={(e) => setAmountDep(e.target.value)}
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
                value={tpComment}
                onChange={(e) => setTpComment(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t("amount_to_settle")}
                value={amountSet}
                onChange={(e) => setAmountSet(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1 }}>{data.transaction?.currency}</Box>
                  ),
                }}
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
                md={4}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => doAction("approve")}
                >
                  {t("approve")}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => doAction("decline")}
                >
                  {t("decline")}
                </Button>
                <Button onClick={() => doAction("close")}>
                  {t("close_case")}
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
      {data.transaction?.finished && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure to mark transaction as NOT PROCESSED?"
                )
              ) {
                doAction("back2processing");
              }
            }}
          >
            {t("return_to_not_processed")}
          </Button>
        </Box>
      )}
    </Paper>
  );
}

/* helper tiny component */
function InfoLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", mb: 0.5 }}>
      <Box sx={{ width: 130, fontWeight: 500 }}>{label}</Box>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}
function renderInstrument(d: any) {
  if (d.purse) {
    return (
      <Link
        target="_blank"
        href={`/transactions/cards/detailed/${d.purse.uid}`}
      >
        {d.purse.purse}
      </Link>
    );
  }
  if (d.info?.cardNumber) {
    return `${d.info.cardNumber} (${d.info.cardExpMonth}/${d.info.cardExpYear})`;
  }
  return <Chip size="small" label="no instrument" color="error" />;
}

function renderFinishedStatus(st: string) {
  if (st === "approved")
    return <Chip size="small" label={st} color="success" />;
  if (st === "declined") return <Chip size="small" label={st} color="error" />;
  return <Chip size="small" label={st} />;
}
