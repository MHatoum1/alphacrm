/*  src\pages\Admin\Accounts\MTAccountsPage.tsx  */
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import EntityNoTabPage from "@/components/ui/EntityNoTabPage";
import type { RootState, AppDispatch } from "@/redux/store";
import { fetchMtAccounts, MtAccountRow } from "@/redux/slices/mtAccountsSlice";

/* ─────────────── 1) backend column → index map ──────────────── */
const backendCols: Record<string, number> = {
  Login: 0,
  Name: 1,
  Type: 2,
  Group: 3,
  IB: 4,
  Balance: 5,
  Credit: 6,
  Leverage: 7,
  Email: 8,
  Country: 9,
  LastDate: 10,
  Regdate: 11,
  Equity: 12,
  UserColor: 13,
};

/* ─────────────── 2) raw → grid row ──────────────────────────── */
const mapRow = (r: MtAccountRow) => ({
  id: r.Login,
  ...r,
});

/* ─────────────── 4) page component ──────────────────────────── */
export default function MTAccountsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  /* ─────────────── 3) column factory (captures dispatch) ─────── */
  const makeColumns =
    () =>
    ({
      isMobile,
    }: {
      isMobile: boolean;
      theme: any;
    }): GridColDef<MtAccountRow>[] => {
      if (isMobile) {
        return [
          {
            field: "Login",
            headerName: t("info"),
            flex: 2,
            renderCell: (params: GridRenderCellParams<MtAccountRow>) => (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  <RouterLink
                    to={`/accounts/detailed/${params.row.uid}/transactions`}
                    target="_blank"
                    style={{ textDecoration: "none" }}
                  >
                    {params.row.Login}
                  </RouterLink>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {params.row.Name}
                </Typography>
              </Box>
            ),
          },
          {
            field: "details",
            headerName: t("details"),
            flex: 1,
            sortable: false,
            renderCell: (params: GridRenderCellParams<MtAccountRow>) => (
              <Box display="flex" flexDirection="column">
                <Typography variant="body2" fontWeight="bold">
                  {params.row.Balance}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {params.row.Regdate}
                </Typography>
              </Box>
            ),
          },
        ];
      }

      return [
        {
          field: "Login",
          headerName: t("login"),
          width: 110,
          renderCell: ({ value, row }) =>
            row.uid ? (
              <RouterLink
                to={`/detailed/accounts/${row.localid}`}
                target="_blank"
              >
                {value}
              </RouterLink>
            ) : (
              value
            ),
        },
        {
          field: "Name",
          headerName: t("name"),
          flex: 1,
          renderCell: ({ value, row }) =>
            row.localid ? (
              <RouterLink
                to={`/detailed/personal/${row.localid}`}
                target="_blank"
              >
                {value}
              </RouterLink>
            ) : (
              value
            ),
        },
        { field: "Email", headerName: t("email"), width: 150 },
        { field: "Type", headerName: t("type"), width: 90 },
        { field: "Group", headerName: t("group"), width: 150 },
        { field: "IB", headerName: t("ib"), width: 100 },
        {
          field: "Balance",
          headerName: t("balance"),
          type: "number",
          width: 110,
        },
        {
          field: "Credit",
          headerName: t("credit"),
          type: "number",
          width: 110,
        },
        {
          field: "Equity",
          headerName: t("equity"),
          type: "number",
          width: 110,
        },
        {
          field: "Leverage",
          headerName: t("leverage"),
          type: "number",
          width: 20,
        },
        { field: "Country", headerName: t("country"), width: 100 },
        { field: "Regdate", headerName: t("regdate"), width: 100 },
        { field: "LastDate", headerName: t("last_login"), width: 160 },
      ];
    };

  /* build column-set once */
  const buildColumns = useMemo(() => makeColumns(), [dispatch]);

  /* current user id from localStorage (same as other pages) */
  const admin_id =
    JSON.parse(localStorage.getItem("user") || "{}")?.userID ?? "";

  return (
    <EntityNoTabPage<
      /* FetchArg */ {
        page: number;
        rows: number;
        sort: string;
        order: "asc" | "desc";
        srch: string;
        srchv: string;
        admin_id: string;
      },
      /* RawRow */ MtAccountRow,
      /* Row    */ ReturnType<typeof mapRow>
    >
      title={t("mt5_accounts")}
      PaperProps={{ sx: { p: 0, boxShadow: "none" } }}
      /* -------- redux plumbing -------- */
      fetchThunk={fetchMtAccounts}
      selectSlice={(s: RootState) => ({
        data: s.mtAccounts.rows,
        recordsTotal: s.mtAccounts.total,
        recordsFiltered: s.mtAccounts.total,
        status: s.mtAccounts.status,
      })}
      /* -------- grid helpers ---------- */
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      buildFetchArg={({ grid }) => {
        const sortItem = grid.sortModel?.[0];
        // if they clicked “info”, actually sort by Login
        let sortField = sortItem?.field ?? "Regdate";
        if (sortField === "info") sortField = "Login";
        return {
          admin_id,
          page: grid.page + 1, // MT-API is 1-based
          rows: grid.pageSize,
          sort: sortField,
          order: sortItem?.sort ?? "desc",
          srch: "all",
          srchv: grid.filterValue ?? "",
        };
      }}
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "Regdate", sort: "desc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: 0,
      }}
    />
  );
}
