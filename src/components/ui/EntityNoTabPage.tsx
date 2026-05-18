// src/components/pages/EntityNoTabPage.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
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
import { useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/redux/hooks";
import { useSelector } from "react-redux";
import CustomDataGrid from "@/components/ui/CustomDataGrid";
import { GridState } from "@/components/ui/DataTablesMapper";
import { useTranslation } from "react-i18next";

export interface EntityNoTabPageProps<FetchArg = any, RawRow = any, Row = any> {
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
  mapRow: (raw: RawRow, index: number) => Row;
  /** Builds desktop & mobile column definitions */
  buildColumns: (opts: { isMobile: boolean; theme: any }) => any[];
  /** Map column.field -> backend index (needed by thunk) */
  getBackendColumns: () => Record<string, number>;
  /** Extra params (query-string, etc.) that fetchThunk needs */
  buildFetchArg: (opts: {
    searchParams: URLSearchParams;
    grid: GridState;
  }) => FetchArg;
  /** Title shown above the grid */
  title: string;
  /** Initial grid state (page size, default sort, …) */
  PaperProps?: React.ComponentProps<typeof Paper>;

  initialGrid?: GridState;
}

export default function EntityNoTabPage<FetchArg, RawRow, Row>({
  fetchThunk,
  selectSlice,
  mapRow,
  buildColumns,
  getBackendColumns,
  buildFetchArg,
  title,
  initialGrid = {
    page: 0,
    pageSize: 10,
    sortModel: [{ field: "created", sort: "desc" }],
    filterValue: "",
    columns: [],
    backendColumns: {},
    draw: 1,
    order: 0,
  },
  PaperProps,
}: EntityNoTabPageProps<FetchArg, RawRow, Row>) {
  // ─── hooks & state ─────────────────────────
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // grid state (debounced for sort & filter)
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

  // build columns
  const uiColumns = useMemo(
    () => buildColumns({ isMobile, theme }),
    [isMobile, theme, buildColumns]
  );
  const serverColumns = useMemo(
    () => buildColumns({ isMobile: false, theme }),
    [theme, buildColumns]
  );

  // sync gridState with columns
  useEffect(() => {
    setGridState((prev) => ({
      ...prev,
      columns: serverColumns,
      backendColumns: getBackendColumns(),
    }));
  }, [serverColumns, getBackendColumns]);

  // fetch data when gridState or query changes
  const prev = useRef<{ q: string; grid: GridState }>({
    q: searchParams.toString(),
    grid: gridState,
  });
  useEffect(() => {
    if (gridState.columns.length === 0) return;
    const q = searchParams.toString();
    if (
      prev.current.q === q &&
      JSON.stringify(prev.current.grid) === JSON.stringify(gridState)
    ) {
      return;
    }
    prev.current = { q, grid: gridState };
    dispatch(fetchThunk(buildFetchArg({ searchParams, grid: gridState })));
  }, [searchParams, gridState, dispatch, fetchThunk, buildFetchArg]);

  // grab data from Redux
  const { data, recordsFiltered, status } = useSelector(selectSlice);
  const rows = useMemo(() => data.map((r, i) => mapRow(r, i)), [data, mapRow]);

  // mobile detail dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState<any>(null);
  const openDialog = (row: any) => {
    setDialogRow(row);
    setDialogOpen(true);
  };

  // keep desktop columns for mobile‐dialog fallback
  const desktopColumns = useMemo(
    () => buildColumns({ isMobile: false, theme }),
    [theme, buildColumns]
  );

  // ─── render ─────────────────────────────────
  return (
    <Paper sx={{ p: 2, boxShadow: "none" }} {...PaperProps}>
      {/* data grid */}
      <Box mt={2}>
        <CustomDataGrid
          rows={rows}
          columns={uiColumns}
          title={title}
          onGridStateChange={onGridStateChange}
          rowCount={recordsFiltered}
          loading={status === "loading"}
          sortModel={gridState.sortModel}
          rowHeight={isMobile ? 60 : undefined}
          onRowClick={isMobile ? (p) => openDialog(p.row) : undefined}
        />
      </Box>

      {/* mobile‐detail dialog */}
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
          {dialogRow &&
            isMobile &&
            desktopColumns.map((col) => {
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
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
