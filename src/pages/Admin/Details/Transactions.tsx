// src/pages/TransactionsPage.tsx
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import EntityNoTabPage from "@/components/ui/EntityNoTabPage";
import { fetchDetailedTransactions } from "@/redux/slices/adminDetailsSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import { GridColDef } from "@mui/x-data-grid";
import LinkRenderer from "@/components/ui/LinkRenderer";
import { Box, Typography } from "@mui/material";

// ─── 1) Backend column mapping ───────────────────────────
const backendCols: Record<string, number> = {
  id: 0,
  type: 1,
  method: 2,
  reference: 3,
  amount: 4,
  currency: 5,
  date_created: 6,
  status: 7,
  processed: 8,
  platform: 9,
};

// ─── 2) Row type & mapper ─────────────────────────────────
interface TxRow {
  id: string;
  type: string;
  method: string;
  reference: string;
  amount: string;
  currency: string;
  date_created: string;
  status: string;
  processed: string;
  platform: string;
}

const mapRow = (raw: any[]): TxRow => ({
  id: raw[0],
  type: raw[1],
  method: raw[2],
  reference: raw[3],
  amount: raw[4],
  currency: raw[5],
  date_created: raw[6],
  status: raw[7],
  processed: raw[8],
  platform: raw[9],
});

// ─── 4) The page component ─────────────────────────────────
export default function TransactionsPage() {
  const { t } = useTranslation();
  // pull `id` out of the URL; treat it as your user_id
  const { id } = useParams<{ id: string }>();
  const user_id = id!;

  // ─── 3) Columns builder (desktop + mobile) ────────────────
  const buildColumns = ({
    isMobile,
    theme,
  }: {
    isMobile: boolean;
    theme: any;
  }): GridColDef[] => {
    if (isMobile) {
      // Two-column mobile view
      return [
        {
          field: "id",
          headerName: t("info"),
          flex: 2,
          renderCell: (p) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                <LinkRenderer htmlString={p.row.id} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.row.reference}
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

    // Desktop: one column per field + status chips
    const statusChip = (field: keyof TxRow): GridColDef => ({
      field,
      headerName: t(
        field
          .split("_")
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(" ")
      ),
      flex: 1,
      renderCell: (p) => {
        const el = document.createElement("div");
        el.innerHTML = p.value;
        const txt = (el.textContent || "").toUpperCase();
        const key = txt.toLowerCase().replace(/\s+/g, "_");
        const bg =
          theme.palette.status[key]?.bg || theme.palette.status.default.bg;
        const color =
          theme.palette.status[key]?.color ||
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
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      { field: "type", headerName: t("type"), flex: 1 },
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
    <EntityNoTabPage<
      { urlPart: string; gridState: GridState; user_id: string }, // now includes user_id
      any[], // RawRow
      TxRow // Row
    >
      // 4.1  thunk
      fetchThunk={fetchDetailedTransactions}
      // 4.2  redux selector
      selectSlice={(s: RootState) => s.adminDetails}
      // 4.3  row mapper & columns
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      // 4.4  buildFetchArg must return exactly { urlPart, gridState }
      buildFetchArg={({ grid }: { grid: GridState }) => ({
        urlPart: "transactions", // literal segment in your route
        user_id,
        gridState: grid,
      })}
      // 4.5  title shown above the grid
      title={t("transactions")}
      // 4.6  initial grid state (sort by date_created desc)
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "date_created", sort: "desc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: backendCols.date_created,
      }}
    />
  );
}
