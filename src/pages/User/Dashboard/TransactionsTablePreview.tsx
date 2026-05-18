// src/components/Client/TransactionsTablePreview.tsx
import { useEffect, useMemo } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserTransactions } from "@/redux/slices/userTransactionsSlice";
import FixedPageDataGrid from "@/components/ui/FixedPageDataGrid";
import { useTranslation } from "react-i18next";

interface Props {
  limit: number;
}

export default function TransactionsTablePreview({ limit }: Props) {
  const dispatch = useAppDispatch();
  const { data: txs = [], status } = useAppSelector((s) => s.userTransactions);
  const { t } = useTranslation();
  const stored = localStorage.getItem("user");
  const uid = stored ? JSON.parse(stored).userID : undefined;
  const theme = useTheme();

  // 1️⃣ Fetch
  useEffect(() => {
    if (uid) dispatch(fetchUserTransactions({ user_id: uid, limit }));
  }, [dispatch, uid, limit]);

  // 2️⃣ Rows
  const rows = useMemo(
    () => txs.slice(0, limit).map((tx) => ({ ...tx })),
    [txs, limit]
  );

  // 3️⃣ Desktop columns
  const columns: GridColDef[] = useMemo(() => {
    const statusChip = (
      field: "status" | "processed" | "platform"
    ): GridColDef => ({
      field,
      headerName: t(field.toLowerCase()),
      flex: 1,
      align: "center", // ← add
      headerAlign: "center", // ← add
      renderCell: (params) => {
        const el = document.createElement("div");
        el.innerHTML = params.value;
        const txt = (el.textContent || el.innerText || "").toUpperCase();
        const txtStyle = txt.toLowerCase().replace(/\s+/g, "_");
        const bg =
          theme.palette.status[txtStyle]?.bg || theme.palette.status.default.bg;
        const color =
          theme.palette.status[txtStyle]?.color ||
          theme.palette.status.default.color;
        return (
          // 4️⃣ Use Chip for status
          // Check if txt is empty to avoid rendering empty chip
          txt.trim() === "" ? (
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary"></Typography>
            </Box>
          ) : (
            <Chip
              label={txt}
              sx={{
                width: "100%",
                justifyContent: "center",
                backgroundColor: bg,
                color,
                borderRadius: 1,
                fontWeight: 700,
              }}
            />
          )
        );
      },
    });

    return [
      {
        field: "method",
        headerName: t("method"),
        flex: 1,
        renderCell: (p) => <Box>{p.value}</Box>,
      },
      {
        field: "amount",
        headerName: t("amount"),
        flex: 1,
        align: "right",
        headerAlign: "right",
        renderCell: (p) => {
          const isDeposit = p.row.type === "deposit";
          const amt = (Number(p.value) || 0).toFixed(2);
          return (
            <Box
              component="span"
              sx={{
                fontWeight: "bold",
                color: isDeposit ? "success.main" : "error.main",
              }}
            >
              {isDeposit ? "" : "-"}
              {amt} {p.row.currency}
            </Box>
          );
        },
      },
      statusChip("status"),
      statusChip("processed"),
      {
        field: "created",
        headerName: t("created"),
        flex: 1,
        valueGetter: (params) =>
          dayjs(params as string).format("DD MMM, HH:mm"),
      },
    ];
  }, [t]);

  // 4️⃣ Two-column mobile snapshot from first 4 cols
  const mobileColumns: GridColDef[] = useMemo(() => {
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
  }, [columns, t]);

  // 5️⃣ Loading
  if (status === "loading") {
    return (
      <Box textAlign="center" py={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // 6️⃣ Delegate to FixedPageDataGrid
  return (
    <FixedPageDataGrid
      title={t("last_transactions")}
      rows={rows}
      columns={columns}
      mobileColumns={mobileColumns}
      rowCount={rows.length}
    />
  );
}
