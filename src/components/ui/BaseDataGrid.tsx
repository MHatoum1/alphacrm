// ui/BaseDataGrid.tsx
import React from "react";
import { Box, Paper } from "@mui/material";
import {
  DataGrid,
  DataGridProps,
  GridPaginationModel,
  GridSortModel,
  GridFilterModel,
} from "@mui/x-data-grid";
import { SxProps, useTheme } from "@mui/material/styles";

/** What can vary across the concrete grids */
export interface BaseGridOptions {
  /** Hide MUI footer completely (no pagination UI) */
  hideFooter?: boolean;
  /** Disable column-header sorting clicks */
  disableUserSorting?: boolean;
  /** Show a toolbar. Pass your own component or leave undefined for none. */
  Toolbar?: React.JSXElementConstructor<any>;
  /** Optional fixed row height  */
  rowHeight?: number;
  /** Enable autoHeight or supply getRowHeight callback */
  autoHeight?: boolean;
  getRowHeight?: DataGridProps["getRowHeight"];
  /** Extra DataGrid props passthrough */
  gridExtraProps?: Partial<DataGridProps>;
}

/** Union of *real* DataGrid props + our options */
export type BaseDataGridProps = Omit<
  DataGridProps,
  | "rows"
  | "columns"
  | "onPaginationModelChange"
  | "onSortModelChange"
  | "onFilterModelChange"
> & {
  rows: any[];
  columns: any[];
  /** Title text (optional) */
  title?: string;
  /** Single callback that bubbles all grid changes */
  onGridStateChange?: (state: {
    page?: number;
    pageSize?: number;
    sortModel?: { field: string; sort: "asc" | "desc" }[];
    filterValue?: string;
  }) => void;
} & BaseGridOptions;

const headerHeight = 45;
const footerHeight = 50;
const minHeight = 600;

const BaseDataGrid: React.FC<BaseDataGridProps> = ({
  rows,
  columns,
  title,
  onGridStateChange,
  hideFooter = false,
  disableUserSorting = false,
  Toolbar,
  rowHeight = 45,
  autoHeight = false,
  getRowHeight,
  gridExtraProps = {},
  ...rest
}) => {
  const theme = useTheme();

  /** 1️⃣ run-time style object reused everywhere */
  const paperSx: SxProps = {
    p: 2,
    mb: 2,
    borderRadius: 2, // 8 px
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 10px rgba(0,0,0,0.5)"
        : "0 4px 10px rgba(0,0,0,0.1)",
    "& .MuiDataGrid-root": { border: "none", fontSize: 13 },
    "& .MuiDataGrid-columnHeaders": {
      //   height: headerHeight,
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.text.secondary,
      fontWeight: 700,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    "& .MuiDataGrid-cell": {
      borderBottom: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.primary,
      display: "flex",
      alignItems: "center",
      padding: "2px 8px",
    },
    "& .MuiDataGrid-footerContainer": {
      borderTop: `1px solid ${theme.palette.divider}`,
      minHeight: footerHeight,
    },
    "& .MuiTablePagination-toolbar": { height: "auto", minHeight: "unset" },
  };

  /** 2️⃣   turn sorting off if requested */
  const finalCols = React.useMemo(
    () =>
      disableUserSorting
        ? columns.map((c: any) => ({ ...c, sortable: false }))
        : columns,
    [columns, disableUserSorting]
  );

  /** 3️⃣   height calculation only when not autoHeight */
  const calcHeight = React.useMemo(() => {
    if (autoHeight) return undefined;
    return Math.max(
      minHeight,
      rows.length * rowHeight + headerHeight + (hideFooter ? 0 : footerHeight)
    );
  }, [rows.length, rowHeight, autoHeight, hideFooter]);

  return (
    <Paper elevation={2} sx={paperSx}>
      <Box sx={{ height: calcHeight, mb: 4 }}>
        <DataGrid
          rows={rows}
          columns={finalCols}
          rowHeight={rowHeight}
          autoHeight={autoHeight}
          getRowHeight={getRowHeight}
          loading={(rest as any).loading}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          hideFooter={hideFooter}
          disableColumnMenu
          disableColumnSelector
          disableDensitySelector
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{ toolbar: Toolbar }}
          slotProps={{ toolbar: { title } }}
          /** Bubble everything through a single callback  */
          onPaginationModelChange={(m: GridPaginationModel) =>
            onGridStateChange?.({ page: m.page, pageSize: m.pageSize })
          }
          onSortModelChange={(m: GridSortModel) =>
            onGridStateChange?.({
              sortModel: m.map((x) => ({
                field: x.field,
                sort: (x.sort ?? "asc") as "asc" | "desc",
              })),
            })
          }
          onFilterModelChange={(m: GridFilterModel) => {
            const tokens = (m.quickFilterValues ?? []).filter(Boolean);
            onGridStateChange?.({
              filterValue: tokens.join(" "), // e.g. "john doe lebanon"
              page: 0,
            });
          }}
          {...gridExtraProps}
          {...rest}
        />
      </Box>
    </Paper>
  );
};

export default BaseDataGrid;
