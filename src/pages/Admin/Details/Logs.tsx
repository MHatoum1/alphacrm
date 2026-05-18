//pages/Admin/Details/Logs.tsx

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import EntityNoTabAutoHeightPage from "@/components/ui/EntityNoTabAutoHeightPage";
import { fetchUserActionsLog } from "@/redux/slices/adminDetailsSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import { GridColDef } from "@mui/x-data-grid";
import { Box, Typography, Chip } from "@mui/material";

// ─── 1) Backend column mapping ───────────────────────────
const backendCols: Record<string, number> = {
  date: 0,
  action: 1,
  details: 2,
};

// ─── 2) Row type & mapper ─────────────────────────────────
interface LogsRow {
  id: number; // DataGrid requires a unique `id`
  date: string;
  action: string;
  details: string;
}

const mapRow = (raw: any[], idx: number): LogsRow => ({
  id: idx,
  date: raw[0],
  action: raw[1],
  details: raw[2],
});

/**
 * 1) Unescape any JSON-style slashes/quotes
 * 2) Parse the HTML
 * 3) If a <dd> contains a JSON array string, render each item as its own line
 */
function renderDetails(htmlString: string, isMobile: boolean = false) {
  // 1) Unescape
  const unescaped = htmlString.replace(/\\"/g, '"').replace(/\\\//g, "/");
  // 2) Parse into a real DOM
  const doc = new DOMParser().parseFromString(unescaped, "text/html");
  const dl = doc.querySelector("dl");
  if (!dl) return null;

  // 3) Build lines by stepping [dt,dd] pairs
  const lines: React.ReactNode[] = [];
  const children = Array.from(dl.children);
  for (let i = 0; i + 1 < children.length; i += 2) {
    const dt = children[i],
      dd = children[i + 1];
    if (dt.tagName !== "DT" || dd.tagName !== "DD") continue;

    const key = dt.textContent?.trim() ?? "";
    const raw = dd.textContent?.trim() ?? "";

    // JSON-array → Chip list
    let content: React.ReactNode = raw;
    if (raw.startsWith("[") && raw.endsWith("]")) {
      try {
        const arr = JSON.parse(raw) as string[];
        content = (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {arr.map((v, i) => (
              <Chip key={i} size="small" label={v} />
            ))}
          </Box>
        );
      } catch {
        /* fall back to text */
      }
    }

    lines.push(
      <Box
        key={i}
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 0.25 : 1,
        }}
      >
        <Typography component="span" variant="body2" fontWeight="bold">
          {key}:
        </Typography>
        <Box
          component="span"
          sx={{
            whiteSpace: "normal",
            wordBreak: isMobile ? "break-all" : "break-word",
          }}
        >
          {content}
        </Box>
      </Box>
    );
  }

  return <>{lines}</>;
}
// ─── 4) The page component ─────────────────────────────────
export default function LogsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const user_id = id!;

  // ─── 3) Columns builder (desktop + mobile) ────────────────
  const buildColumns = ({ isMobile }: { isMobile: boolean }): GridColDef[] => {
    // common “Details” col
    const detailsCol: GridColDef = {
      field: "details",
      headerName: t("details"),
      flex: 2,
      sortable: false,
      filterable: false,
      // allow multi-line
      renderCell: (params) => {
        if (!params.value) {
          return <Typography color="text.secondary">—</Typography>;
        }
        return (
          <Box
            sx={{
              width: "100%",
              whiteSpace: "normal",
              // let the Box wrap and break long words
              overflowWrap: "anywhere",
              lineHeight: 1.4,
              alignSelf: "flex-start",
            }}
          >
            {renderDetails(params.value as string, isMobile)}
          </Box>
        );
      },
    };

    if (isMobile) {
      return [
        {
          field: "info",
          headerName: t("info"),
          flex: 2,
          sortable: false,
          renderCell: (p) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {p.row.date}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.row.action}
              </Typography>
            </Box>
          ),
        },
        detailsCol,
      ];
    }

    return [
      { field: "date", headerName: t("date"), flex: 1 },
      { field: "action", headerName: t("action"), flex: 1 },
      detailsCol,
    ];
  };

  return (
    <EntityNoTabAutoHeightPage<
      { urlPart: string; gridState: GridState; user_id: string },
      any[],
      LogsRow
    >
      // thunk to call selectUserActionsLog
      fetchThunk={fetchUserActionsLog}
      selectSlice={(s: RootState) => s.adminDetails}
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      buildFetchArg={({ grid }: { grid: GridState }) => ({
        urlPart: "logs", // matches /detailed/logs/:id
        user_id,
        gridState: grid,
      })}
      title={t("logs")}
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

export { renderDetails };
