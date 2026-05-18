import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import EntityNoTabPage from "@/components/ui/EntityNoTabPage";
import { fetchUserMessages } from "@/redux/slices/adminDetailsSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import { GridColDef } from "@mui/x-data-grid";
import { Box, Link, Typography } from "@mui/material";

// ─── 1) Backend column → index ───────────────────────────
const backendCols: Record<string, number> = {
  date: 0,
  message: 1,
  type: 2,
  seen: 3,
  closed: 4,
};

// ─── 2) Row type & mapper ─────────────────────────────────
interface MessageRow {
  id: number; // unique for DataGrid
  date: string;
  message: string;
  type: string;
  status: string;
  canClose: boolean;
}

const mapRow = (raw: any[], idx: number): MessageRow => {
  const seen = Boolean(raw[3]);
  const closed = Boolean(raw[4]);
  return {
    id: idx,
    date: raw[0],
    message: raw[1],
    type: raw[2],
    // PHP: seen||closed ? “Accepted” : “NEW”
    status: seen || closed ? "Accepted" : "NEW",
    // only static messages that aren’t closed get a “close it” link
    canClose: raw[2] === "static" && !closed,
  };
};

// ─── 4) The page component ─────────────────────────────────
export default function MessengerPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const user_id = id!;

  // ─── 3) Columns builder ────────────────────────────────────
  const buildColumns = ({
    isMobile,
    theme,
  }: {
    isMobile: boolean;
    theme: any;
  }): GridColDef[] => {
    if (isMobile) {
      return [
        {
          field: "date",
          headerName: t("info"),
          flex: 2,
          renderCell: (p) => (
            <Box>
              <Typography fontWeight="bold">{p.row.date}</Typography>
              <Typography color="text.secondary" variant="body2">
                {p.row.message}
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
          // uppercase & normalize status for theme lookup
          const statusText = params.row.status.toUpperCase();
          const key = statusText.toLowerCase().replace(/\s/g, "_");
          const bg =
            theme.palette.status[key]?.bg ||
            theme.palette.status.default.bg;
          const color =
            theme.palette.status[key]?.color ||
            theme.palette.status.default.color;

          return (
            <Box display="flex" flexDirection="column" width="100%">
              <Box
                sx={{
                  backgroundColor: bg,
                  color,
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
                {params.row.type}
              </Typography>
            </Box>
          );
        },
      },
        {
          field: "close",
          headerName: "",
          flex: 1,
          renderCell: (p) =>
            p.row.canClose ? (
              <Link
                href={`?closeMessage=${p.row.id}`}
                underline="hover"
                variant="body2"
              >
                close it
              </Link>
            ) : null,
        },
      ];
    }

    return [
      { field: "date", headerName: t("date"), flex: 1 },
      { field: "message", headerName: t("message"), flex: 2 },
      { field: "type", headerName: t("type"), flex: 1 },
      {
        field: "status",
        headerName: t("status"),
        flex: 1,
        renderCell: (p) => (
          <Box
            sx={{
              backgroundColor:
                theme.palette.status[p.row.status.toLowerCase()]?.bg ||
                theme.palette.status.default.bg,
              color:
                theme.palette.status[p.row.status.toLowerCase()]?.color ||
                theme.palette.status.default.color,
              borderRadius: 1,
              px: 1,
              textAlign: "center",
            }}
          >
            <Typography fontWeight="bold" variant="body2">
              {p.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: "close",
        headerName: "",
        flex: 0.5,
        renderCell: (p) =>
          p.row.canClose ? (
            <Link href={`?closeMessage=${p.row.id}`}>close it</Link>
          ) : null,
      },
    ];
  };

  return (
    <EntityNoTabPage<
      { urlPart: string; gridState: GridState; user_id: string },
      any[],
      MessageRow
    >
      fetchThunk={fetchUserMessages}
      selectSlice={(s: RootState) => s.adminDetails}
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      buildFetchArg={({ grid }: { grid: GridState }) => ({
        urlPart: "messenger", // matches /detailed/messenger/:id
        user_id,
        gridState: grid,
      })}
      title={t("messenger")}
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "date", sort: "desc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: backendCols.date,
      }}
    />
  );
}
