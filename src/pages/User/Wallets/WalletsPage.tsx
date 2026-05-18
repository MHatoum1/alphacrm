// src/pages/User/Wallets/WalletsPage.tsx
import { useEffect, useMemo } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWallets, fetchLastTx } from "@/redux/slices/walletSlice";
import FixedPageDataGrid from "@/components/ui/FixedPageDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import StatusLabel from "@/components/ui/StatusLabel";

export default function WalletsPage() {
  // 1️⃣ All hooks at top
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // get user_id
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;
  const theme = useTheme();

  // redux slices
  const {
    wallets = [],
    statusW,
    lastTx = [],
    statusT,
  } = useAppSelector((s) => s.wallets);

  // derive a “first‐load” flag
  const loadingWallets = statusW === "loading" && wallets.length === 0;

  // fetch on mount
  useEffect(() => {
    if (!user_id) return;
    dispatch(fetchWallets(user_id));
    dispatch(fetchLastTx(user_id));
  }, [dispatch, user_id]);

  // prepare rows
  // prepare rows
  const walletsRows = useMemo(
    () => wallets.map((w) => ({ id: w.uid, ...w })),
    [wallets]
  );
const txRows = useMemo(() => {
  if (!lastTx) return [];
  return lastTx.map((tx) => ({ ...tx }));
}, [lastTx]);



  // desktop columns for wallets
  const walletCols: GridColDef[] = useMemo<GridColDef[]>(
    () => [
      { field: "server", headerName: t("server"), flex: 1 },
      { field: "currency", headerName: t("currency"), flex: 1 },
      {
        field: "balance",
        headerName: t("balance"),
        flex: 1,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "dw",
        headerName: t("deposited_withdrawn"),
        flex: 1,
        align: "right",
        headerAlign: "right",
        renderCell: (p) =>
          `${p.row.deposited.toFixed(2)} / ${p.row.withdrawn.toFixed(2)}`,
      },
      {
        field: "actions",
        headerName: t("actions"),
        flex: 1.5,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: () => (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: "100%", // span the whole cell
              height: "100%", // ⬅️ lets flex centring work vertically
              justifyContent: "center",
              alignItems: "center", // ⬅️ vertical centring
            }}
          >
            <Button
              size="small"
              variant="contained"
              component={Link}
              to="/deposit"
            >
              {t("deposit")}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="info"
              component={Link}
              to="/withdraw"
            >
              {t("withdraw")}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="warning"
              component={Link}
              to="/accounts/transfer"
            >
              {t("transfer")}
            </Button>
          </Stack>
        ),
      },
    ],
    [t]
  );

  // mobile snapshot for wallets (first 4 fields)
  const walletMobileCols: GridColDef[] = useMemo(() => {
    return [
      {
        field: "info",
        headerName: t("info"),
        flex: 2,
        sortable: false,
        renderCell: (p) => (
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {p.row["server"]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {p.row["currency"]}
            </Typography>
          </Box>
        ),
      },
      {
        field: "details",
        headerName: t("details"),
        flex: 1,
        sortable: false,
        renderCell: (p) => (
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {p.row["balance"] ?? "0.00"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {p.row["d/w"] ?? "0.00 / 0.00"}
            </Typography>
          </Box>
        ),
      },
    ];
  }, [walletCols, t]);

  // desktop columns for last transactions
  const txCols: GridColDef[] = useMemo<GridColDef[]>(
    () => [
      { field: "method", headerName: t("method"), flex: 1 },
      {
        field: "amount",
        headerName: t("amount"),
        flex: 1,
        align: "right",
        headerAlign: "right",
        renderCell: (p) =>
          (p.row.type === "deposit" ? "" : "-") +
          p.row.amount.toFixed(2) +
          ` ${p.row.currency}`,
      },
      {
        field: "status",
        headerName: t("status"),
        flex: 1,
        renderCell: (p) => (
          <StatusLabel statusKey={p.row.status} label={t(p.row.status)} />
        ),
      },
      {
        field: "processed",
        headerName: t("processed"),
        flex: 1,
        renderCell: (p) => (
          <StatusLabel statusKey={p.row.statusFin} label={t(p.row.statusFin)} />
        ),
      },
      {
        field: "date",
        headerName: t("date"),
        flex: 1.5,
        renderCell: (p) => dayjs(p.row.date).format("DD MMM HH:mm"),
      },
    ],
    [t]
  );

  // mobile snapshot for tx (first 4 fields)
  const txMobileCols: GridColDef[] = useMemo(() => {
    return [
      {
        field: "info",
        headerName: t("info"),
        flex: 2,
        sortable: false,
        renderCell: (params) => {
          const isDeposit = params.row.type === "deposit";
          const amt = (Number(params.row.amount) || 0).toFixed(2);
          return (
            <Box display="flex" flexDirection="column">
              <Typography
                component="span"
                sx={{
                  fontWeight: "bold",
                  color: isDeposit ? "success.main" : "error.main",
                }}
              >
                {isDeposit ? "" : "-"}
                {amt} {params.row.currency}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {params.row.method}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "details",
        headerName: t("details"),
        flex: 1,
        sortable: false,
        renderCell: (params) => {
          // extract & uppercase status
          const el = document.createElement("div");
          el.innerHTML = params.row.status;
          const txt = (el.textContent || el.innerText || "").toUpperCase();
          const key = txt.toLowerCase().replace(/\s+/g, "_");
          const bg =
            theme.palette.status[key]?.bg || theme.palette.status.default.bg;
          const fg =
            theme.palette.status[key]?.color ||
            theme.palette.status.default.color;

          return (
            <Box display="flex" flexDirection="column">
              <Box
                sx={{
                  backgroundColor: bg,
                  color: fg,
                  borderRadius: 1,
                  px: 1,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {txt}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {dayjs(params.row.created as string).format("DD MMM, HH:mm")}
              </Typography>
            </Box>
          );
        },
      },
    ];
  }, [txCols, t]);

  // 2️⃣ early returns
  if (!user_id) {
    return <Typography color="error">{t("user_not_found")}</Typography>;
  }
  if (loadingWallets) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  // 3️⃣ final render
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Wallets list */}
      <FixedPageDataGrid
        title={t("wallets_list")}
        rows={walletsRows}
        columns={walletCols}
        mobileColumns={walletMobileCols}
        rowCount={walletsRows.length}
        loading={statusW !== "succeeded"}
      />

      {/* Last transactions */}
      <FixedPageDataGrid
        title={t("last_transactions")}
        rows={txRows}
        columns={txCols}
        mobileColumns={txMobileCols}
        rowCount={txRows.length}
        loading={statusT !== "succeeded"}
      />
    </Box>
  );
}
