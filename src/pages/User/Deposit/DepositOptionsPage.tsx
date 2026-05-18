// src/pages/User/Deposit/DepositOptionsPage.tsx
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
import { fetchDepositOptions } from "@/redux/slices/depositSlice";
import FixedPageDataGrid from "@/components/ui/FixedPageDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { useNavigate, useOutlet } from "react-router-dom";

export default function DepositOptionsPage() {
  // 1️⃣ All hooks at the top, unconditionally
  const outlet = useOutlet();
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { t } = useTranslation();

  // current user
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  // redux state
  const { rows, docsExpired, status } = useAppSelector((s) => s.clientdeposit);

  // 2️⃣ Build the grid data (always runs)
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
          name: r.name,
          code: r.code,
          currency: r.currency,
          fees: r.fees,
          min_amount: r.min_amount,
          processing: r.processing,
        }))
        .sort((a, b) => a.group.localeCompare(b.group)),
    [rows]
  );

  // desktop columns
  const columns: GridColDef[] = useMemo<GridColDef[]>(
    () => [
      {
        field: "image",
        headerName: t("deposit_option"),
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
        headerName: t("minimum_deposit"),
        flex: 1,
      },
      { field: "processing", headerName: t("processing"), flex: 1 },
      {
        field: "actions",
        headerName: t("make_deposit"),
        flex: 1.3,
        sortable: false,
        renderCell: (p) => (
          <Button
            size="small"
            variant="contained"
            onClick={() =>
              nav(docsExpired ? "/deposit" : `/deposit/${p.row.code}`)
            }
          >
            {t("make_deposit")}
          </Button>
        ),
      },
    ],
    [t, nav, docsExpired]
  );

  // mobile two-column snapshot
  const mobileColumns: GridColDef[] = useMemo(() => {
    // show “option” + “currency” vs “min_amount” + “processing”
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
              alt={p.row.name}
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
              {p.row.fees}
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

  // 3️⃣ Side‐effect to load data
  useEffect(() => {
    if (user_id) {
      dispatch(fetchDepositOptions({ user_id }));
    }
  }, [dispatch, user_id]);

  // 4️⃣ Early returns (all hooks above)
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
        {t("deposit_options_error")}
      </Typography>
    );
  }
  if (outlet) {
    return <Paper sx={{ p: 3 }}>{outlet}</Paper>;
  }

  // 5️⃣ Final render
  return (
    <FixedPageDataGrid
      title={t("deposit_options_title")}
      rows={allRows}
      columns={columns}
      mobileColumns={mobileColumns}
      mobileRowHeight={96}
      rowCount={allRows.length}
      loading={false}
    />
  );
}
