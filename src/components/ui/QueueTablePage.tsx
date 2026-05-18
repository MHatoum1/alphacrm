// src/components/ui/QueueTablePage.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Paper, useMediaQuery, useTheme } from "@mui/material";
import debounce from "lodash.debounce";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/redux/hooks";
import { useSelector } from "react-redux";
import CustomDataGrid from "./CustomDataGrid";
import { GridState } from "@/components/ui/DataTablesMapper";


export interface QueueTablePageProps<FetchArg, RawRow, Row> {
  title: string;
  fetchThunk: (arg: FetchArg) => any;
  selectSlice: (s: any) => {
    data: RawRow[];
    recordsTotal: number;
    status: "idle" | "loading" | "succeeded" | "failed";
    recordsFiltered: number;
  };
  mapRow: (raw: RawRow, index: number) => Row;
  buildColumns: (opts: { isMobile: boolean; theme: any }) => any[];
  getBackendColumns: () => Record<string, number>;
  buildFetchArg: (opts: {
    searchParams: URLSearchParams;
    grid: GridState;
  }) => FetchArg;
  initialGrid?: GridState;
  PaperProps?: React.ComponentProps<typeof Paper>;
}

export default function QueueTablePage<FetchArg, RawRow, Row>({
  title,
  fetchThunk,
  selectSlice,
  mapRow,
  buildColumns,
  getBackendColumns,
  buildFetchArg,
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
}: QueueTablePageProps<FetchArg, RawRow, Row>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();


  // grid state (debounced)
  const [gridState, setGridState] = useState<GridState>(initialGrid);
  const debouncedSetGrid = useCallback(
    debounce(
      (updater: (p: GridState) => GridState) =>
        setGridState((prev) => updater(prev)),
      300
    ),
    []
  );
  const onGridStateChange = (delta: Partial<GridState>) => {
    const apply = (prev: GridState) => {
      const next: GridState = { ...prev, ...delta };
      next.draw = (prev.draw ?? 0) + 1;
      return next;
    };
    delta.sortModel ? debouncedSetGrid(apply) : setGridState(apply);
  };

  // build & sync columns
  const uiColumns = useMemo(
    () => buildColumns({ isMobile, theme }),
    [isMobile, theme, buildColumns]
  );
  const serverColumns = useMemo(
    () => buildColumns({ isMobile: false, theme }),
    [theme, buildColumns]
  );
  useEffect(() => {
    setGridState((prev) => ({
      ...prev,
      columns: serverColumns,
      backendColumns: getBackendColumns(),
    }));
  }, [serverColumns, getBackendColumns]);

  // fetch
  const prev = useRef<{ q: string; grid: GridState }>({
    q: searchParams.toString(),
    grid: gridState,
  });
  useEffect(() => {
    if (!gridState.columns.length) return;
    const q = searchParams.toString();
    if (
      prev.current.q === q &&
      JSON.stringify(prev.current.grid) === JSON.stringify(gridState)
    )
      return;
    prev.current = { q, grid: gridState };
    dispatch(fetchThunk(buildFetchArg({ searchParams, grid: gridState })));
  }, [searchParams, gridState, dispatch, fetchThunk, buildFetchArg]);

  // get rows
  const { data, recordsFiltered, status } = useSelector(selectSlice);
  const rows = useMemo(() => data.map((r, i) => mapRow(r, i)), [data, mapRow]);

  return (
    <Paper sx={{ mt:2, boxShadow: "none" }} {...PaperProps}>
      <CustomDataGrid
        rows={rows}
        columns={uiColumns}
        title={title}
        onGridStateChange={onGridStateChange}
        rowCount={recordsFiltered}
        loading={status === "loading"}
        sortModel={gridState.sortModel}
        rowHeight={isMobile ? 60 : undefined}
      />
    </Paper>
  );
}
