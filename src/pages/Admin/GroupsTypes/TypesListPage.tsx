// src/pages/Admin/Types/TypesListPage.tsx
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { Link as RouterLink, useOutlet } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMemo, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import EntityNoTabNoTitlePage from "@/components/ui/EntityNoTabNoTitlePage";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

import { fetchTypes, deleteType } from "@/redux/slices/adminTypesSlice";
import { GridState } from "@/components/ui/DataTablesMapper";
import { useTranslation } from "react-i18next";

interface TypeRow {
  id: number;
  type: string;
  shortval: string;
  initial: string;
  spread: string;
  commission: string;
  leverage: string;
  hosting: string;
  strategy: string;
  iseuropean: string; // "0" or "1"
  islive: string; // "0" or "1"
  enabled: string; // "0" or "1"
  server: string;
  server_name: string;
}

// map a flat backend row into your TypeRow
const mapRow = (r: any[]): TypeRow => ({
  id: r[0],
  type: r[1],
  shortval: r[2],
  initial: r[3],
  spread: r[4],
  commission: r[5],
  leverage: r[6],
  hosting: r[7],
  strategy: r[8],
  iseuropean: r[9],
  islive: r[10],
  enabled: r[11],
  server: r[12],
  server_name: r[13],
});

// backend column → index
const backendCols: Record<string, number> = {
  id: 0,
  type: 1,
  shortval: 2,
  initial: 3,
  spread: 4,
  commission: 5,
  leverage: 6,
  hosting: 7,
  strategy: 8,
  iseuropean: 9,
  islive: 10,
  enabled: 11,
  server: 12,
  server_name: 13,
};

// package exactly what fetchTypes wants
// package exactly what fetchTypes wants
const buildFetchArg = ({
  grid,
}: {
  grid: GridState;
}): { urlPart: string; gridState: GridState } => ({
  // this must match the slice’s expected urlPart
  urlPart: "types",
  gridState: grid,
});

export default function TypesListPage() {
  const child = useOutlet();
  if (child) return <Paper>{child}</Paper>;

  const dispatch = useAppDispatch();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { t } = useTranslation();

  // ① Define your initialGrid once, for both the table and reloads:
  const initialGrid: GridState = {
    page: 0,
    pageSize: 10,
    sortModel: [{ field: "type", sort: "asc" }],
    filterValue: "",
    columns: [],
    backendColumns: {},
    draw: 1,
    order: backendCols.type,
  };

  // columns definition
  /* ---------------- column factory (desktop vs mobile) ---------------- */
  const makeColumns =
    () =>
    ({ isMobile }: { isMobile: boolean }): GridColDef<TypeRow>[] => {
      /* ===== MOBILE: show just a two‑column snapshot ===== */
      if (isMobile) {
        return [
          {
            field: "type",
            headerName: t("info"),
            flex: 2,
            sortable: false,
            renderCell: (params) => (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {params.row.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {params.row.shortval}
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
                  {String(params.row.iseuropean) === "1"
                    ? t("eu")
                    : t("non_eu")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {String(params.row.islive) === "1" ? t("live") : t("demo")}
                </Typography>
              </Box>
            ),
          },
        ];
      }

      /* ===== DESKTOP: full table ===== */
      return [
        { field: "type", headerName: t("type"), flex: 1 },
        { field: "shortval", headerName: t("short_value"), flex: 1 },
        { field: "initial", headerName: t("initial_deposit"), flex: 1 },
        { field: "spread", headerName: t("spread"), flex: 1 },
        { field: "commission", headerName: t("commission"), flex: 1 },
        { field: "leverage", headerName: t("max_leverage"), flex: 1 },
        {
          field: "iseuropean",
          headerName: t("european"),
          flex: 1,
          renderCell: (p) =>
            String(p.row.iseuropean) === "1" ? t("yes") : t("no"),
        },
        { field: "server_name", headerName: t("report_server"), flex: 2 },
        { field: "server", headerName: t("platform"), flex: 1 },
        {
          field: "islive",
          headerName: t("live_or_demo"),
          flex: 1,
          renderCell: (p) =>
            String(p.row.islive) === "1" ? t("live") : t("demo"),
        },
        {
          field: "enabled",
          headerName: t("enabled"),
          flex: 1,
          renderCell: (p) =>
            String(p.row.enabled) === "1" ? t("yes") : t("no"),
        },
        {
          field: "action",
          headerName: t("actions"),
          flex: 1,
          sortable: false,
          renderCell: (p) => (
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                component={RouterLink}
                to={`/groupstypes/${p.row.id}/edit`}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(p.row.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          ),
        },
      ];
    };

  const buildColumns = useMemo(() => makeColumns(), [t]);

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteType(id)).unwrap();
      setSuccessMsg(t("type_deleted", "Type deleted successfully"));

      // ② Immediately re-fetch the table with the same grid state:
      dispatch(fetchTypes({ urlPart: "types", gridState: initialGrid }));
    } catch (e: any) {
      setErrorMsg(e.message || t("delete_failed", "Delete failed"));
    }
  };
  return (
    <Paper sx={{ p: 2, boxShadow: "none" }}>
      {successMsg && (
        <CustomNotification
          message={successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}
      {errorMsg && (
        <CustomError errorMessage={errorMsg} onClose={() => setErrorMsg("")} />
      )}

      <Box display="flex" justifyContent="space-between" ml={2}>
        <Grid container columnSpacing={0} rowSpacing={1}>
          {" "}
          {/* ⬅︎ no left/right gutters */}
          <Grid item xs={12} sx={{ px: 0 }}>
            <Box>
              <Button
                component={RouterLink}
                to="/groupstypes/new"
                variant="contained"
                sx={{ width: { xs: "100%", sm: "auto" }, mb: { xs: 2, sm: 2 } }}
              >
                {t("add_type", "Add Type")}
              </Button>

              <EntityNoTabNoTitlePage<
                { urlPart: string; gridState: GridState },
                any[],
                TypeRow
              >
                fetchThunk={fetchTypes}
                selectSlice={(s: RootState) => ({
                  data: s.adminTypes.data,
                  recordsTotal: s.adminTypes.recordsTotal,
                  recordsFiltered: s.adminTypes.recordsFiltered,
                  status: s.adminTypes.loading ? "loading" : "idle",
                })}
                mapRow={mapRow}
                buildColumns={buildColumns}
                getBackendColumns={() => backendCols}
                buildFetchArg={buildFetchArg}
                initialGrid={initialGrid}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
