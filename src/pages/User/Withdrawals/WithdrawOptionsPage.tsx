// src/pages/User/Withdraw/WithdrawOptionsPage.tsx
import { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWithdrawOptions } from "@/redux/slices/withdrawSlice";
import FixedPageDataGrid from "@/components/ui/FixedPageDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { useNavigate, useOutlet } from "react-router-dom";

// const CYPRUS_TIME_ZONE = "Asia/Beirut";

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

export default function WithdrawOptionsPage() {
  // 1️⃣ All hooks at the top
  const outlet = useOutlet();
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { t } = useTranslation();
  // const whishWithdrawalBlocked = isWhishWithdrawalBlocked();

  // current user
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  // redux state
  const { rows, docsExpired, status } = useAppSelector((s) => s.withdraw);

  // 2️⃣ Prepare grid rows
  const allRows = useMemo(
    () =>
      rows
        .map((r) => ({
          id: r.code,
          group: r.group,
          image:
            r.code === "googlepay" || r.name === "Google Pay"
              ? "/images/google-pay-mark.svg"
              : `/images/${r.image}`,
          code: r.code,
          currency: r.currency,
          fees: r.fees,
          min_amount: r.min_amount,
          processing: r.processing,
        }))
        .sort((a, b) => a.group.localeCompare(b.group)),
    [rows]
  );

  // 3️⃣ Desktop columns
  const columns: GridColDef[] = useMemo<GridColDef[]>(
    () => [
      {
        field: "image",
        headerName: t("withdraw_option"),
        flex: 1.2,
        sortable: false,
        align: "left",
        headerAlign: "left",
        renderCell: (p) => (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",   // vertical centring
              justifyContent: "left",// horizontal centring
            }}
          >
            <Box
              component="img"
              src={p.value as string}
              alt={p.row.name}
              sx={{ maxWidth: 100, maxHeight: 50, objectFit: "contain" }}
            />
          </Box>
        ),
      },
      { field: "currency", headerName: t("transfer_currency"), flex: 1 },
      { field: "fees", headerName: t("commission_and_fees"), flex: 2 },
      {
        field: "min_amount",
        headerName: t("minimum_to_withdraw"),
        flex: 1,
      },
      { field: "processing", headerName: t("processing"), flex: 1 },
      {
        field: "actions",
        headerName: t("make_withdraw"),
        flex: 1.3,
        sortable: false,
        renderCell: (p) => (
          <Button
            size="small"
            variant="contained"
            // disabled={p.row.code === "whish" && whishWithdrawalBlocked}
            onClick={() =>
              nav(docsExpired ? "/withdraw" : `/withdraw/${p.row.code}`)
            }
          >
            {t("make_withdraw")}
          </Button>
        ),
      },
    ],
    [t, nav, docsExpired]
  );

  // 4️⃣ Mobile two-column snapshot (first 4 fields)
  const mobileColumns: GridColDef[] = useMemo(() => {
    // use [group, image, currency, fees, min_amount, processing]
    return [
      {
        field: "info",
        headerName: t("info"),
        flex: 2,
        sortable: false,
        renderCell: (p) => (
          <Box
            sx={{
              py: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 0.75,
            }}
          >
            <Box
              component="img"
              src={p.row.image as string}
              alt={p.row.code}
              sx={{ maxWidth: 78, maxHeight: 34, objectFit: "contain" }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.25,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
              }}
            >
              {p.row.currency}
            </Typography>
          </Box>
        ),
      },
      {
        field: "details",
        headerName: t("details"),
        flex: 1.2,
        sortable: false,
        renderCell: (p) => (
          <Box
            sx={{
              py: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 0.75,
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              {p.row.min_amount}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.25, whiteSpace: "normal" }}
            >
              {p.row.processing}
            </Typography>
          </Box>
        ),
      },
    ];
  }, [columns, t]);

  // 5️⃣ Side-effect to fetch data once
  useEffect(() => {
    if (user_id) {
      dispatch(fetchWithdrawOptions({ user_id }));
    }
  }, [dispatch, user_id]);

  // 6️⃣ Early returns (hooks never skipped)
  if (status === "loading") {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (status === "failed") {
    return (
      <Typography color="error" mt={4}>
        {t("withdraw_options_error")}
      </Typography>
    );
  }
  if (outlet) {
    // nested child route
    return <Paper sx={{ p: 3 }}>{outlet}</Paper>;
  }

  // 7️⃣ Final render
  return (
    <FixedPageDataGrid
      title={t("withdraw_options_title")}
      rows={allRows}
      columns={columns}
      mobileColumns={mobileColumns}
      mobileRowHeight={96}
      rowCount={allRows.length}
      loading={false}
    />
  );
}
