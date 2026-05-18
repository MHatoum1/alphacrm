/*  src/pages/Admin/Accounts/OnlineUsersPage.tsx  */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GridColDef } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";

import EntityNoTabPage from "@/components/ui/EntityNoTabPage";
import type { RootState } from "@/redux/store";
import { fetchOnlineUsers, OnlineRow } from "@/redux/slices/onlineUsersSlice";
import { Box, Typography } from "@mui/material";

/* ───────────────── 1) backend → index map ─────────────────── */
const backendCols: Record<string, number> = {
  Login: 0,
  Name: 1,
  Group: 2,
  Balance: 3,
  Credit: 4,
  Equity: 5,
  FreeMargin: 6,
  Margin: 7,
  Country: 8,
  Email: 9,
  Server: 10,
};

/* ───────────────── 2) raw → grid row ───────────────────────── */
const mapRow = (r: OnlineRow) => ({
  ...r,
  id: r.RowId,
  balanceFmt: r.Balance.toLocaleString(),
});

/* ───────────────── 4) page component ──────────────────────── */
export default function OnlineUsersPage() {
  const { t } = useTranslation();

  /* ───────────────── 3) column factory ──────────────────────── */
  const makeColumns =
    () =>
    ({ isMobile }: { isMobile: boolean }): GridColDef<OnlineRow>[] => {
      if (isMobile) {
        return [
          {
            field: "Login",
            headerName: t("info"),
            flex: 2,
            renderCell: (params) => (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  <RouterLink
                    to={`/accounts/detailed/${params.row.RowId}`}
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
            renderCell: (params) => (
              <Box display="flex" flexDirection="column">
                <Typography variant="body2" fontWeight="bold">
                  {params.row.Balance}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {params.row.FreeMargin.toLocaleString()}
                </Typography>
              </Box>
            ),
          },
        ];
      }

      return [
        { field: "Login", headerName: t("login"), width: 90 },
        { field: "Name", headerName: t("name"), width: 220 },
        { field: "Group", headerName: t("group"), width: 130 },
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
          width: 100,
        },
        {
          field: "Equity",
          headerName: t("equity"),
          type: "number",
          width: 110,
        },
        {
          field: "FreeMargin",
          headerName: t("free_margin"),
          type: "number",
          width: 120,
        },
        {
          field: "Margin",
          headerName: t("margin"),
          type: "number",
          width: 100,
        },
        { field: "Country", headerName: t("country"), width: 100 },
        { field: "Email", headerName: t("email"), width: 200},
        { field: "LastAccess", headerName: t("last_access"), width: 150 },
        { field: "Server", headerName: t("server"), width: 70 },
        
      ];
    };

  const buildColumns = useMemo(() => makeColumns(), []);

  return (
    <EntityNoTabPage<
      /* FetchArg = exactly what fetchOnlineUsers expects */
      {
        platform: "mt5" | "mt4";
        page: number;
        rows: number;
        sort: string;
        order: "asc" | "desc";
            srch: string;
        srchv: string;
      },
      /* RawRow */ OnlineRow,
      /* Row    */ ReturnType<typeof mapRow>
    >
      title={t("online_users")}
      PaperProps={{ sx: { p: 0, boxShadow: "none" } }}
      fetchThunk={fetchOnlineUsers}
      selectSlice={(s: RootState) => ({
        data: s.onlineUsers.rows,
        recordsTotal: s.onlineUsers.total,
        recordsFiltered: s.onlineUsers.total,
        status: s.onlineUsers.status,
      })}
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      buildFetchArg={({ grid }) => {
        const sort = grid.sortModel?.[0] ?? { field: "LastAccess", sort: "desc" };

      // if they clicked “info”, actually sort by Login
      let sortField = sort?.field ?? "LastAccess";
      if (sortField === "info") sortField = "LastAccess";
        return {
          platform: "mt5",
          page: grid.page + 1,
          rows: grid.pageSize,
          sort: sortField,
          order: sort.sort as "asc" | "desc",
           srch: "all",
          srchv: grid.filterValue ?? "",
        };
      }}
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "LastAccess", sort: "desc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: 0,
      }}
      //   refreshMs={5000}        /* live update every 5 s */
    />
  );
}
