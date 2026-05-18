// src/pages/User/Dashboard/AccountsTablePreview.tsx
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAccounts } from "@/redux/slices/userAccountsSlice";
import FixedPageDataGrid from "@/components/ui/FixedPageDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  limit: number;
}

export default function AccountsTablePreview({ limit }: Props) {
  const dispatch = useAppDispatch();
  const { live = [], demo = [], status } = useAppSelector((s) => s.accounts);
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const uid = user?.userID;
  const { t } = useTranslation();

  // 1️⃣ Fetch once
  useEffect(() => {
    if (uid) dispatch(fetchAccounts({ user_id: uid }));
  }, [dispatch, uid]);

  // 2️⃣ Rows
  const rows = useMemo(
    () => [...live, ...demo].slice(0, limit).map((r) => ({ id: r.uid, ...r })),
    [live, demo, limit]
  );

  // 3️⃣ Desktop columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "login",
        headerName: t("account_login"),
        flex: 1,
        renderCell: (p) => (
          <Link to={`/accounts/detailed/${p.row.uid}/transactions`}>{p.value}</Link>
        ),
      },
      { field: "type", headerName: t("type"), flex: 1 },
      { field: "balance", headerName: t("balance"), flex: 1 },
      { field: "equity", headerName: t("equity"), flex: 1 },
      { field: "server", headerName: t("server"), flex: 1 },
      { field: "currency", headerName: t("currency"), flex: 1 },
      { field: "credit", headerName: t("credit"), flex: 1 },
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
              {
                <Link to={`/accounts/detailed/${p.row["uid"]}`}>
                  {p.row["login"]}
                </Link>
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {p.row["type"]}
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

  // 5️⃣ Loader
  if (status === "idle" || status === "loading") {
    return (
      <Box textAlign="center" py={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // 6️⃣ Delegate to FixedPageDataGrid
  return (
    <FixedPageDataGrid
      title={t("accounts")}
      rows={rows}
      columns={columns}
      mobileColumns={mobileColumns}
      loading={status !== "succeeded"}
      rowCount={rows.length} // for server pagination
    />
  );
}
