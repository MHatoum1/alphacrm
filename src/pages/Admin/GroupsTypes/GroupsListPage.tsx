import { useState, useMemo } from "react";
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
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useAppDispatch } from "@/redux/hooks";
import { fetchGroups, deleteGroup } from "@/redux/slices/adminGroupsSlice";
import { GridState } from "@/components/ui/DataTablesMapper";
import { useTranslation } from "react-i18next";
import EntityNoTabPage from "@/components/ui/EntityNoTabPage";

interface GroupRow {
  id: number;
  grp: string;
  platform: string;
  currency: string;
  configId: number;
  liveglobal: string;
}

// maps the raw `data: any[][]` → our `GroupRow`
const mapRow = (r: any[]): GroupRow => ({
  id: r[0],
  grp: r[1],
  platform: r[2],
  currency: r[3],
  configId: r[4],
  liveglobal: r[5],
});

const backendCols: Record<string, number> = {
  id: 0,
  grp: 1,
  platform: 2,
  currency: 3,
  configId: 4,
  liveglobal: 5,
};

// matches our slice’s `fetchGroups` arg
const buildFetchArg = ({ grid }: { grid: GridState }) => ({
  urlPart: "groups",
  gridState: grid,
});

export default function GroupsListPage() {
  const child = useOutlet();
  if (child) return <Paper>{child}</Paper>;

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [msgOk, setMsgOk] = useState<string | null>(null);
  const [msgErr, setMsgErr] = useState<string | null>(null);

  const initialGrid: GridState = useMemo(
    () => ({
      page: 0,
      pageSize: 10,
      sortModel: [{ field: "grp", sort: "asc" }],
      filterValue: "",
      columns: [],
      backendColumns: backendCols,
      draw: 1,
      order: backendCols.grp,
    }),
    []
  );

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteGroup(id)).unwrap();
      setMsgOk(t("group_deleted", "Group deleted"));
      // re-fetch
      dispatch(fetchGroups({ urlPart: "groups", gridState: initialGrid }));
    } catch (e: any) {
      setMsgErr(e.message || t("delete_failed", "Delete failed"));
    }
  };

  /* ─────────── column factory (desktop ↔ mobile) ─────────── */
  const makeColumns =
    () =>
    ({ isMobile }: { isMobile: boolean }): GridColDef<GroupRow>[] => {
      /* ----- mobile: two‑column snapshot ----- */
      if (isMobile) {
        return [
          {
            field: "grp",
            headerName: t("info"),
            flex: 2,
            sortable: false,
            renderCell: (p) => (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {p.row.grp}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.row.configId}
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
              <Box display="flex" flexDirection="column">
                <Typography variant="body2" fontWeight="bold">
                  {p.row.currency}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {p.row.liveglobal}
                </Typography>
              </Box>
            ),
          },
        ];
      }

      /* ----- desktop: full grid ----- */
      return [
        { field: "grp", headerName: t("name"), flex: 1 },
        { field: "platform", headerName: t("platform"), flex: 1 },
        { field: "currency", headerName: t("currency"), flex: 1 },
        { field: "configId", headerName: t("type"), flex: 1 },
        {
          field: "liveglobal",
          headerName: t("live_or_demo"),
          flex: 1,
        },
        {
          field: "action",
          headerName: t("actions"),
          sortable: false,
          flex: 1,
          renderCell: (params) => (
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                component={RouterLink}
                to={`/groupstypes/${params.row.id}/editgroup`}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(params.row.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          ),
        },
      ];
    };

  const buildColumns = useMemo(() => makeColumns(), [t]);

  return (
    <Paper sx={{ p: 2, boxShadow: "none" }}>
      {msgOk && (
        <CustomNotification message={msgOk} onClose={() => setMsgOk(null)} />
      )}
      {msgErr && (
        <CustomError errorMessage={msgErr} onClose={() => setMsgErr(null)} />
      )}

      <Box display="flex" justifyContent="space-between" ml={2}>
        <Grid container columnSpacing={0} rowSpacing={1}>
          {" "}
          {/* ⬅︎ no left/right gutters */}
          <Grid item xs={12} sx={{ px: 0 }}>
            <Box>
              <Button
                component={RouterLink}
                to="/groupstypes/newgroup"
                variant="contained"
                sx={{ width: { xs: "100%", sm: "auto" }, mb: { xs: 1, sm: 0 } }}
              >
                {t("add_group", "Add Group")}
              </Button>
              <EntityNoTabPage<
                { urlPart: string; gridState: GridState },
                any[],
                GroupRow
              >
                PaperProps={{ sx: { p: 0, boxShadow: "none" } }}
                title={t("groups_list", "Groups List")}
                fetchThunk={fetchGroups}
                selectSlice={(s) => ({
                  data: s.adminGroups.data,
                  recordsTotal: s.adminGroups.recordsTotal,
                  recordsFiltered: s.adminGroups.recordsFiltered,
                  status: s.adminGroups.loading ? "loading" : "idle",
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
