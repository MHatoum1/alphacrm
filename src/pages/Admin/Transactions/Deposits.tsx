// src/pages/Deposits.tsx
import { GridColDef } from "@mui/x-data-grid";
import EntityTablePage from "@/components/ui/EntityTablePage";
import { fetchDeposits } from "@/redux/slices/adminTransactionsSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import { useTranslation } from "react-i18next";
import LinkRenderer from "@/components/ui/LinkRenderer";
import { Box, Typography } from "@mui/material";
import { defineTabs } from "@/utils/defineTabs";
/* ───────────────────────────── tabs ───────────────────────────── */

type TabKey =
  | "all_deposits"
  | "new"
  | "approved"
  | "declined"
  | "successful"
  | "failed"
  | "pending";

const depositsTabs = (t: any) =>
  defineTabs<TabKey>([
    {
      key: "all_deposits",
      label: t("all_deposits"),
      path: "/transactions/all_deposits",
    },
    { key: "new", label: t("new_deposits"), path: "/deposits/new" },
    { key: "approved", label: t("approved"), path: "/deposits/approved" },
    { key: "declined", label: t("declined"), path: "/deposits/declined" },
    { key: "successful", label: t("successful"), path: "/deposits/successful" },
    { key: "failed", label: t("failed"), path: "/deposits/failed" },
    { key: "pending", label: t("platform_pending"), path: "/deposits/pending" },
  ]);

/* ──────────────── raw array ‑→ row object mapper ─────────────── */

const mapRow = (r: any[]): Record<string, any> => ({
  id: r[0],
  email: r[1],
  name: r[2],
  method: r[3],
  reference: r[4],
  amount: r[5],
  currency: r[6],
  date_created: r[7],
  status: r[8],
  processed: r[9],
  platform: r[10],
});

/* ───────────────────── backend column map ────────────────────── */

const backendCols: Record<string, number> = {
  id: 0,
  email: 1,
  name: 2,
  method: 3,
  reference: 4,
  amount: 5,
  currency: 6,
  date_created: 7,
  status: 8,
  processed: 9,
  platform: 10,
};

const getBackendColumns = () => backendCols; // same for every tab

/* ─────────────── build argument for thunk fetch ──────────────── */

const buildFetchArg = ({
  urlPart,
  grid,
}: {
  urlPart: string;
  searchParams: URLSearchParams; // not needed here but kept for signature parity
  grid: GridState;
}) => ({ urlPart, gridState: grid });

/* ────────────────────────── page itself ─────────────────────── */

export default function DepositsPage() {
  const { t } = useTranslation();

  /* ─────────────────────── columns builder ─────────────────────── */

  const buildColumns = ({
    isMobile,
    theme,
  }: {
    activeTab: TabKey;
    isMobile: boolean;
    theme: any;
  }): GridColDef[] => {
    if (isMobile) {
      return [
        {
          field: "id",
          headerName: t("info"),
          flex: 2,
          renderCell: (params) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                <LinkRenderer
                  htmlString={params.row.id}
                  openInNewTab={!isMobile}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {params.row.email}
              </Typography>
            </Box>
          ),
        },
        {
          field: "details",
          headerName: t("details"),
          flex: 1,
          sortable: false,
          renderCell: (params) => {
            const temp = document.createElement("div");
            temp.innerHTML = params.row.status;
            const statusText = (
              temp.textContent ||
              temp.innerText ||
              ""
            ).toUpperCase();
            const statusTextStyle = statusText
              .toLowerCase()
              .replace(/\s+/g, "_");
            const backgroundColor =
              theme.palette.status[statusTextStyle]?.bg ||
              theme.palette.status.default.bg;
            const textColor =
              theme.palette.status[statusTextStyle]?.color ||
              theme.palette.status.default.color;
            return (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Box display="flex" flexDirection="column">
                  <Box
                    sx={{
                      backgroundColor,
                      color: textColor,
                      borderRadius: "8px",
                      padding: "4px 8px",
                      textAlign: "center",
                      minWidth: "90px",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {statusText}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {params.row.amount} {params.row.currency}
                  </Typography>
                </Box>
              </Box>
            );
          },
        },
      ];
    }

    const statusChip = (
      field: "status" | "processed" | "platform"
    ): GridColDef => ({
      field,
      headerName: t(field[0].toUpperCase() + field.slice(1)),
      flex: 1,
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
          <Box
            sx={{
              backgroundColor: bg,
              color,
              borderRadius: 1,
              px: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {txt}
            </Typography>
          </Box>
        );
      },
    });

    return [
      {
        field: "id",
        headerName: t("id"),
        flex: 1,
        renderCell: (p) => (
          <LinkRenderer htmlString={p.value} openInNewTab={false} />
        ),
      },
      { field: "email", headerName: t("email"), flex: 2 },
      { field: "name", headerName: t("name"), flex: 1 },
      { field: "method", headerName: t("method"), flex: 1 },
      { field: "reference", headerName: t("reference"), flex: 1 },
      { field: "amount", headerName: t("amount"), flex: 1 },
      { field: "currency", headerName: t("currency"), flex: 1 },
      { field: "date_created", headerName: t("date_created"), flex: 1 },
      statusChip("status"),
      statusChip("processed"),
      statusChip("platform"),
    ];
  };

  return (
    <EntityTablePage
      basePath="/transactions"
      tabs={depositsTabs(t)}
      fetchThunk={fetchDeposits}
      selectSlice={(s: RootState) => s.transactions}
      mapRow={(raw, _i) => mapRow(raw)}
      buildColumns={buildColumns}
      buildFetchArg={buildFetchArg}
      getBackendColumns={getBackendColumns}
      getTitle={(tab) => depositsTabs(t).find((x) => x.key === tab)!.label}
      /* optional: override initial sort */
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "date_created", sort: "desc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: 7,
      }}
    />
  );
}
