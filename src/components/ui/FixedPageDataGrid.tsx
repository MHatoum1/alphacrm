// src/components/ui/FixedPageDataGrid.tsx
import React, { useState, useMemo, useCallback } from "react";
import {
  Paper,
  useTheme,
  useMediaQuery,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridFilterModel,
} from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import CustomToolbar from "./CustomToolbar";

interface FixedPageDataGridProps {
  rows: any[];
  columns: GridColDef[];
  mobileColumns?: GridColDef[]; // ← Accept your custom two-col snapshot
  title?: string;
  loading?: boolean;
  rowCount?: number;
  rowHeight?: number;
  mobileRowHeight?: number;
  onFilterChange?: (value: string) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  onRowClick?: (params: any) => void;
}

const FixedPageDataGrid: React.FC<FixedPageDataGridProps> = ({
  rows,
  columns,
  mobileColumns,
  title,
  loading = false,
  rowCount = rows.length,
  rowHeight,
  mobileRowHeight,
  onFilterChange,
  onPageChange,
  onRowClick,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 1️⃣ always disable sorting
  const columnsNoSort = useMemo(
    () => columns.map((c) => ({ ...c, sortable: false })),
    [columns]
  );

  // 2️⃣ pick which two columns to show on mobile
  const colsToShow = isMobile
    ? mobileColumns ??
      /* fallback extractor */ (() => {
        if (columnsNoSort.length < 4) return columnsNoSort;
        const [c0, c1, c2, c3] = columnsNoSort;
        return [
          {
            field: "info",
            headerName: t("info"),
            flex: 2,
            renderCell: (p) => (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {p.row[c0.field]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.row[c1.field]}
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
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {p.row[c2.field]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.row[c3.field]}
                </Typography>
              </Box>
            ),
          },
        ];
      })()
    : columnsNoSort;

  // 3️⃣ mobile dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState<any>(null);
  const openDialog = useCallback((row: any) => {
    setDialogRow(row);
    setDialogOpen(true);
  }, []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        "& .MuiDataGrid-root": { border: "none", fontSize: 13 },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: theme.palette.secondary.light,
          color: theme.palette.text.secondary,
          fontWeight: 700,
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
        "& .MuiDataGrid-cell": {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DataGrid
        autoHeight
        sx={{ flex: 1 }}
        rowHeight={isMobile ? mobileRowHeight : rowHeight}
        rows={rows}
        columns={colsToShow}
        loading={loading}
        paginationMode="server"
        rowCount={rowCount}
        filterMode="server"
        disableColumnMenu
        disableColumnSelector
        disableDensitySelector
        disableRowSelectionOnClick
        hideFooter
        slots={{ toolbar: CustomToolbar }}
        slotProps={{ toolbar: { title } }}
        onFilterModelChange={(m: GridFilterModel) =>
          onFilterChange?.(m.quickFilterValues?.[0] || "")
        }
        onPaginationModelChange={(m: GridPaginationModel) =>
          onPageChange?.(m.page, m.pageSize)
        }
        onRowClick={(params) => {
          if (isMobile) openDialog(params.row);
          else onRowClick?.(params);
        }}
      />

      {isMobile && (
        <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
          <DialogTitle>
            {t("details")}
            <IconButton
              onClick={closeDialog}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {dialogRow &&
              // show everything *not* in your 2-col snapshot
              columns
                .filter((c) => !colsToShow.some((mc) => mc.field === c.field))
                .map((col) => {
                  let val = dialogRow[col.field];
                  if (val == null || val == "") val = "<br/>";
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
          <DialogActions>
            <Button onClick={closeDialog}>{t("close")}</Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
};

export default FixedPageDataGrid;
