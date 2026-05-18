// src/pages/User/Accounts/AccountsPage.tsx
import { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Link, Outlet, useOutlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { AccountRow, fetchAccounts } from "@/redux/slices/userAccountsSlice";
import { useTranslation } from "react-i18next";
import CreateSelection from "./CreateSelection";
import FixedPageDataGrid from "@/components/ui/FixedPageDataGrid";
import { GridColDef } from "@mui/x-data-grid";

export default function AccountsPage() {
  // ─── 1. ALL HOOKS at the top ──────────────────────────────────
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const outlet = useOutlet();

  // pull userId
  const stored = localStorage.getItem("user");
  const authUser = stored ? JSON.parse(stored) : null;
  const user_id = authUser?.userID;

  // redux state
  const {
    live = [] as AccountRow[],
    demo = [] as AccountRow[],
    status = "idle",
    error,
  } = useSelector((s: RootState) => s.accounts);

  // derive flags
  const nothingYet = useMemo(
    () => live.length === 0 && demo.length === 0,
    [live.length, demo.length]
  );
  const showCreateSelection = status === "succeeded" && nothingYet;

  // fetch on mount (and re-fetch only if `nothingYet` changes)
  useEffect(() => {
    if (!user_id) return;
    if (outlet) return; // skip while viewing a child like /accounts/detailed/:uid
    dispatch(fetchAccounts({ user_id }));
  }, [dispatch, user_id, outlet]);

  // prepare rows & columns (hooks too!)
  const liveRows = useMemo(
    () => live.map((r) => ({ id: r.uid, ...r })),
    [live]
  );
  const demoRows = useMemo(
    () => demo.map((r) => ({ id: r.uid, ...r })),
    [demo]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "login",
        headerName: t("account_login"),
        flex: 1,
        renderCell: (p) => (
          <Link to={`/accounts/detailed/${p.row.uid}/transactions`}>
            {p.value}
          </Link>
        ),
      },
      { field: "type", headerName: t("type"), flex: 1 },
      { field: "currency", headerName: t("currency"), flex: 1 },
      { field: "class", headerName: t("class"), flex: 1 },
      { field: "server", headerName: t("server"), flex: 1 },
      {
        field: "balance",
        headerName: t("balance"),
        flex: 1,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "equity",
        headerName: t("equity"),
        flex: 1,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "credit",
        headerName: t("credit"),
        flex: 1,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "leverage",
        headerName: t("leverage"),
        flex: 1,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "actions",
        headerName: t("deposit"),
        flex: 1.5,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: () => (
          <Button
            size="small"
            variant="contained"
            component={Link}
            to="/deposit"
          >
            {t("deposit")}
          </Button>
        ),
      },
    ],
    [t]
  );

  // 4️⃣ Two-column snapshot for mobile (first 4 fields)
  const mobileColumns: GridColDef[] = useMemo(() => {
    return [
      {
        field: "login",
        headerName: t("info"),
        flex: 2,
        sortable: false,
        renderCell: (p) => (
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {p.row["login"]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {p.row["currency"]} - {p.row["class"]}
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
              {p.row["balance"]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {p.row["equity"]}
            </Typography>
          </Box>
        ),
      },
    ];
  }, [columns, t]);

  // ─── 2. EARLY RETURNS ────────────────────────────────────────
  if (outlet) {
    return <>{outlet}</>;
  }
  if (!user_id) {
    return <Typography color="error">{t("User not found")}</Typography>;
  }
  if (status === "loading" || status === "idle") {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (status === "failed") {
    return (
      <Typography color="error" mt={4}>
        {error}
      </Typography>
    );
  }
  if (showCreateSelection) {
    return <CreateSelection />;
  }

  // ─── 3. FINAL RENDER ─────────────────────────────────────────
  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        align="center"
        textTransform="uppercase"
      >
        {t("live_accounts")}
      </Typography>
      <FixedPageDataGrid
        rows={liveRows}
        columns={columns}
        mobileColumns={mobileColumns}
        rowCount={liveRows.length}
      />
      <Stack direction="row" justifyContent="flex-start" sx={{ mb: 4, mt: 1 }}>
        <Button variant="contained" component={Link} to="/accounts/live">
          {t("create_new_live")}
        </Button>
      </Stack>

      <Typography
        variant="h6"
        gutterBottom
        align="center"
        textTransform="uppercase"
      >
        {t("demo_accounts")}
      </Typography>
      <FixedPageDataGrid
        rows={demoRows}
        columns={columns}
        mobileColumns={mobileColumns}
        rowCount={demoRows.length}
      />
      <Stack direction="row" justifyContent="flex-start">
        <Button variant="contained" component={Link} to="/accounts/demo">
          {t("create_new_demo")}
        </Button>
      </Stack>

      <Outlet />
    </Box>
  );
}
