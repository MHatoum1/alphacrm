//pages/Admin/Details/Queue.tsx

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import EntityNoTabAutoHeightPage from "@/components/ui/EntityNoTabAutoHeightPage";
import { fetchUserEmails } from "@/redux/slices/adminDetailsSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import { GridColDef } from "@mui/x-data-grid";
import { Box, Typography, Chip } from "@mui/material";
import parse, { HTMLReactParserOptions } from "html-react-parser";

// ─── 1) Backend column mapping ───────────────────────────
const backendCols: Record<string, number> = {
  date: 0,
  task: 1,
  processed: 2,
  details: 3,
};

// ─── 2) Row type & mapper ─────────────────────────────────
interface QueueRow {
  id: number; // DataGrid requires a unique `id`
  date: string;
  task: string;
  processed: string;
  details: string;
}

const mapRow = (raw: any[], idx: number): QueueRow => ({
  id: idx,
  date: raw[0],
  task: raw[1],
  processed: raw[2],
  details: raw[3],
});

/**
 * 1) Unescape any JSON-style slashes/quotes
 * 2) Parse the HTML
 * 3) If a <dd> contains a JSON array string, render each item as its own line
 */
function renderDetails(htmlString: string) {
  // unescape any leftover \" or \/
  const unescaped = htmlString.replace(/\\"/g, '"').replace(/\\\//g, "/");

  const options: HTMLReactParserOptions = {
    replace: (node) => {
      // look for <dd>TEXT</dd>
      if (
        node.type === "tag" &&
        node.name === "dd" &&
        node.children.length === 1 &&
        node.children[0].type === "text"
      ) {
        const text = node.children[0].data.trim();

        // if it's a JSON array, parse & render each item
        if (text.startsWith("[") && text.endsWith("]")) {
          try {
            const arr: string[] = JSON.parse(text);
            return (
              <Box
                component="dd"
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
              >
                {arr.map((val, i) => (
                  <Chip key={i} size="small" label={val} />
                ))}
              </Box>
            );
          } catch {
            // fall through to normal text
          }
        }
      }
      // leave everything else untouched
    },
  };

  return <>{parse(unescaped, options)}</>;
}

// ─── 4) The page component ─────────────────────────────────
export default function QueuePage() {
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
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.4,
          }}
        >
          {params.value ? (
            renderDetails(params.value as string)
          ) : (
            <Typography color="text.secondary">—</Typography>
          )}
        </Box>
      ),
    };

    if (isMobile) {
      return [
        {
          field: "date",
          headerName: t("date_task"),
          flex: 5,
          sortable: false,
          renderCell: (p) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {p.row.date}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.row.task}
              </Typography>
            </Box>
          ),
        },
        detailsCol,
      ];
    }

    return [
      { field: "date", headerName: t("date"), flex: 0.2 },
      { field: "task", headerName: t("task"), flex: 0.1 },
      { field: "processed", headerName: t("processed"), flex: 0.1 },
      detailsCol,
    ];
  };

  return (
    <EntityNoTabAutoHeightPage<
      { urlPart: string; gridState: GridState; user_id: string },
      any[],
      QueueRow
    >
      // thunk to call fetchUserEmails
      fetchThunk={fetchUserEmails}
      selectSlice={(s: RootState) => s.adminDetails}
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      buildFetchArg={({ grid }: { grid: GridState }) => ({
        urlPart: "queue", // matches /detailed/queue/:id
        user_id,
        gridState: grid,
      })}
      title={t("user_actions_log")}
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
