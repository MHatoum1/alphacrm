// src/components/pages/EntityTableProfilePage.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import debounce from "lodash.debounce";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/redux/hooks";
import { useSelector } from "react-redux";
import CustomDataGrid from "@/components/ui/CustomDataGrid";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";
import { GridState } from "@/components/ui/DataTablesMapper";
import { useTranslation } from "react-i18next";

export interface EntityTableProfilePageProps<
  FetchArg = any,
  RawRow = any,
  Row = any,
  TabKey extends string = string
> {
  /** Base url segment, e.g. `/profiles`  */
  basePath: string;
  /** List of tabs with routing */
  tabs: { key: TabKey; label: string; path: string }[];
  /** Redux thunk that brings the data */
  fetchThunk: (arg: FetchArg) => any;
  /** Selector that returns `{ data, recordsTotal, status }` */
  selectSlice: (s: any) => {
    data: RawRow[];
    recordsTotal: number;
    status: "idle" | "loading" | "succeeded" | "failed";
    recordsFiltered: number; // optional, for compatibility
  };
  /** Transforms a raw backend row into the shape the grid expects */
  mapRow: (raw: RawRow, index: number, activeTab: TabKey) => Row;
  /** Builds desktop & mobile column definitions */
  buildColumns: (opts: {
    activeTab: TabKey;
    isMobile: boolean;
    theme: any;
  }) => any[];
  /** Map column.field -> backend index (needed by thunk)     */
  getBackendColumns: (activeTab: TabKey) => Record<string, number>;
  /** Optional extra params (query‑string, etc.) that fetchThunk needs */
  buildFetchArg: (opts: {
    urlPart: string;
    searchParams: URLSearchParams;
    grid: GridState;
  }) => FetchArg;
  /** Title shown above the grid */
  getTitle: (activeTab: TabKey) => string;
  /** Initial grid state (page size, default sort, …) */
  initialGrid?: GridState;
}

export default function EntityTableProfilePage<
  FetchArg,
  RawRow,
  Row,
  TabKey extends string = string
>({
  tabs,
  fetchThunk,
  selectSlice,
  mapRow,
  buildColumns,
  getBackendColumns,
  buildFetchArg,
  getTitle,
  initialGrid = {
    page: 0,
    pageSize: 10,
    sortModel: [{ field: "created", sort: "desc" }],
    filterValue: "",
    columns: [],
    backendColumns: {},
    draw: 1,
    order: 3,
  },
}: EntityTableProfilePageProps<FetchArg, RawRow, Row, TabKey>) {
  // ─────────────────────────── helpers ──────────────────────────
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { "*": subRoute = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // which tab is active
  const activeTab = (tabs.find((t) => subRoute.includes(t.key)) ?? tabs[0])
    .key as TabKey;

  const handleTabChange = (key: TabKey) => {
    const tab = tabs.find((t) => t.key === key)!;
    navigate(tab.path);
  };

  // ─────────────── grid state (kept here, debounced) ─────────────
  const [gridState, setGridState] = useState<GridState>(initialGrid);

  const debouncedSetGrid = useCallback(
    debounce(
      // updater is (prev) => next
      (updater: (p: GridState) => GridState) =>
        setGridState((prev) => updater(prev)),
      300
    ),
    []
  );

  const onGridStateChange = (delta: Partial<GridState>) => {
    const apply = (prev: GridState) => {
      const next: GridState = { ...prev, ...delta };
      next.draw = (prev.draw ?? 0) + 1; //  ← safe numeric bump
      return next;
    };

    delta.sortModel
      ? debouncedSetGrid(apply) // debounce sorts
      : setGridState(apply); // immediate for the rest
  };

  // build & memoise columns each render
  const uiColumns = useMemo(
    () => buildColumns({ activeTab, isMobile, theme }),
    [activeTab, isMobile, theme, buildColumns]
  );

  const serverColumns = useMemo(
    () => buildColumns({ activeTab, isMobile: false, theme }),
    [activeTab, theme, buildColumns]
  );

  // keep gridState in sync with columns
  useEffect(
    () =>
      setGridState((prev) => ({
        ...prev,
        columns: serverColumns,
        backendColumns: getBackendColumns(activeTab),
      })),
    [serverColumns, activeTab, getBackendColumns]
  );
  // ─────────────── fetch data when state changes ────────────────
  const prev = useRef<{ urlPart: string; grid: GridState; q: string }>({
    urlPart: subRoute,
    grid: gridState,
    q: searchParams.toString(),
  });

  useEffect(() => {
    if (gridState.columns.length === 0) return; // ← skip until ready

    const urlPart =
      (subRoute.split("/").filter(Boolean).pop() as string) || tabs[0].key;
    const q = searchParams.toString();

    if (
      prev.current.urlPart === urlPart &&
      prev.current.q === q &&
      JSON.stringify(prev.current.grid) === JSON.stringify(gridState)
    )
      return;

    prev.current = { urlPart, grid: gridState, q };
    dispatch(
      fetchThunk(buildFetchArg({ urlPart, searchParams, grid: gridState }))
    );
  }, [
    subRoute,
    searchParams,
    gridState,
    dispatch,
    buildFetchArg,
    fetchThunk,
    tabs,
  ]);

  // ─────────────── grab data from the slice ─────────────────────
  const { data, recordsFiltered, status } = useSelector(selectSlice);
  const rows = useMemo(
    () => data.map((r, i) => mapRow(r, i, activeTab)),
    [data, activeTab, mapRow]
  );

  // ─────────────── mobile dialog stuff ──────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState<any>(null);

  const openDialog = (row: any) => {
    setDialogRow(row);
    setDialogOpen(true);
  };

  // ALSO build the “desktop” version so we know what all fields are
  const desktopColumns = useMemo(
    () => buildColumns({ activeTab, isMobile: false, theme }),
    [activeTab, theme, buildColumns]
  );

  // Separate tabs
  const regularTabs = tabs.filter((t) => t.key !== "create_profile");
  const createProfileTab = tabs.find((t) => t.key === "create_profile");

  // ────────────────────────── render ────────────────────────────
  return (
    <Paper sx={{ p: 2, boxShadow: "none" }}>
      <Box display="flex" flexDirection="column" alignItems="flex-start" ml={2}>
        <CustomTabSwitcher
          tabs={regularTabs.map(({ key, label }) => ({
            key,
            label,
            iconClass: "la-icon-default",
          }))}
          activeTab={activeTab}
          onTabChange={handleTabChange as any}
        />

        {createProfileTab && (
          <Box mt={2}>
            <Button
              variant={
                activeTab === createProfileTab.key ? "contained" : "outlined"
              }
              startIcon={<i className="la la-plus" style={{ fontSize: 20 }} />}
              onClick={() => handleTabChange(createProfileTab.key as any)}
              sx={{
            textTransform: "none",
            mr: 1,
            minWidth: "70px",
            ...(activeTab === createProfileTab.key
              ? { backgroundColor: "#5E81F4", color: "white" }
              : { backgroundColor: "rgb(239, 242, 254)",border: "none",  color: "#5E81F4" }),
          }}

            >
              {createProfileTab.label}
            </Button>
          </Box>
        )}
      </Box>

      <Box ml={1} mt={2}>
        <CustomDataGrid
          rows={rows}
          columns={uiColumns}
          title={getTitle(activeTab)}
          onGridStateChange={onGridStateChange}
          rowCount={recordsFiltered}
          loading={status === "loading"}
          sortModel={gridState.sortModel}
          rowHeight={isMobile ? 60 : undefined}
          onRowClick={isMobile ? (p) => openDialog(p.row) : undefined}
        />
      </Box>

      {/* mobile details dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.default,
            boxShadow: "none",
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: "#3887BE", color: "#fff" }}>
          {t("details")}
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {dialogRow && isMobile && (
            <>
              {/*
                Show every desktop column that we DIDN'T render
                in the two mobile columns.
              */}
              {desktopColumns
                // .filter(
                //   (dc) => !desktopColumns.some((mc) => mc.field === dc.field)
                // )
                .map((col) => {
                  let val = dialogRow[col.field];
                  if (val == null || val == "") val = "--";
                  return (
                    <Box key={col.field} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">
                        {col.headerName}
                      </Typography>
                      {col.renderCell ? (
                        col.renderCell({ row: dialogRow, value: val } as any)
                      ) : (
                        <Typography variant="body2">
                          {
                            <span
                              dangerouslySetInnerHTML={{
                                __html: String(val) || "",
                              }}
                            />
                          }
                        </Typography>
                      )}
                    </Box>
                  );
                })}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
