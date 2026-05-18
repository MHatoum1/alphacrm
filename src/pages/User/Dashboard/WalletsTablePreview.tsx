// src/pages/User/Dashboard/WalletsTablePreview.tsx
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWallets } from "@/redux/slices/walletSlice";
import FixedPageDataGrid from "@/components/ui/FixedPageDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  limit: number;
}

export default function WalletsTablePreview({ limit }: Props) {
  const dispatch = useAppDispatch();
  const { wallets = [], statusW } = useAppSelector((s) => s.wallets);
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;
  const { t } = useTranslation();

  // 1️⃣ Fetch on mount
  useEffect(() => {
    if (user_id) dispatch(fetchWallets(user_id));
  }, [dispatch, user_id]);

  // 2️⃣ Base rows
  const rows = useMemo(
    () => wallets.slice(0, limit).map((w) => ({ id: w.uid, ...w })),
    [wallets, limit]
  );

  // 3️⃣ Full‐desktop columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "server",
        headerName: t("server"),
        flex: 1,
      },
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
        headerName: t("dw"),
        flex: 1,
        align: "right",
        headerAlign: "right",
        renderCell: (p) => {
          const dep = p.row.deposited as number;
          const wit = p.row.withdrawn as number;
          return `${dep.toFixed(2)} / ${wit.toFixed(2)}`;
        },
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
          </Stack>
        ),
      },
    ],
    [t]
  );

  // 4️⃣ Pick the first four fields for the 2-col mobile snapshot
  const mobileColumns: GridColDef[] = useMemo(() => {
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
  }, [columns, t]);

  // 5️⃣ Loading
  if (statusW === "idle" || statusW === "loading") {
    return (
      <Box textAlign="center" py={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // 6️⃣ Hand over to FixedPageDataGrid, passing your own mobileColumns
  return (
    <FixedPageDataGrid
      title={t("wallets")}
      rows={rows}
      columns={columns}
      mobileColumns={mobileColumns}
      loading={statusW !== "succeeded"}
      rowCount={rows.length}
    />
  );
}
