// src/pages/Admin/Settings/CustomReportPage.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  FormControl,
  FormLabel,
  Divider,
  RadioGroup,
  Radio,
  Paper as MuiPaper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchHeaderOptions,
  fetchCustomReport,
} from "@/redux/slices/customReportSlice";
import axiosInstance from "@/api/axiosInstance";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment, { Moment } from "moment";
import { useTranslation } from "react-i18next";

// ─────────── restricted emails ───────────
const RESTRICTED_EMAILS = new Set([
  "info+cy@fxgrow.com",
  "ademetriou+cy@fxgrow.com",
  "nmikati+1@fxgrow.com",
  "mahdim@fxgrow.com",
]);
const isRestricted = () => {
  try {
    const raw = localStorage.getItem("user");
    const email = (raw ? JSON.parse(raw)?.email : "").toLowerCase();
    return RESTRICTED_EMAILS.has(email);
  } catch {
    return false;
  }
};

export default function CustomReportPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const { headerOptions, data, total, loading } = useAppSelector(
    (s) => s.customReport
  );

  const restricted = isRestricted();

  // All possible columns
  const ALL_COLUMNS = useMemo(() => {
    const cols = [
      { field: "email", headerName: t("email") },
      { field: "name", headerName: t("name") },
      { field: "country", headerName: t("country") },
      { field: "phone", headerName: t("phone") },
      { field: "dob", headerName: t("date_of_birth") },
      { field: "status", headerName: t("status") },
      { field: "created", headerName: t("created") }, // registration date
      { field: "campaign", headerName: t("campaign") },
      { field: "partnership", headerName: t("partnership") }, // hidden if restricted
      { field: "sales", headerName: t("sales") },
      { field: "risk_assessment", headerName: t("risk_assessment") },
      { field: "cdd", headerName: t("cdd") },
      { field: "eu", headerName: t("european") },
    ];
    return restricted ? cols.filter((c) => c.field !== "partnership") : cols;
  }, [restricted, t]);

  // ── state ───────────────────────────────────────────────
  const [isModalOpen, setModalOpen] = useState(false); // one modal for columns + filters
  const [searchTerm, setSearchTerm] = useState("");
  const [checkedFields, setCheckedFields] = useState<string[]>(["email"]);
  const [fieldOrder, setFieldOrder] = useState<string[]>(["email"]);
  const [appliedFields, setAppliedFields] = useState<string[]>([]);

  // filters state (EU + registration date range + STATUS CHECKBOXES)
  const [euNoneu, setEuNoneu] = useState<"" | "EU" | "NonEU">("");
  const [dateFrom, setDateFrom] = useState<Moment | null>(null);
  const [dateTo, setDateTo] = useState<Moment | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]); // 'unverified' | 'limited' | 'dormant' | 'verified'

  // the payload we send to API (merged)
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});

  // grid paging
  const [pageModel, setPageModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rows, setRows] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);

  // mobile detail dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState<any>(null);
  const openDialog = (row: any) => {
    setDialogRow(row);
    setDialogOpen(true);
  };

  // ── columns UI helpers ─────────────────────────────────
  const visibleCols = useMemo(
    () =>
      ALL_COLUMNS.filter((c) =>
        c.headerName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, ALL_COLUMNS]
  );
  const toggleField = (field: string) => {
    setCheckedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
    setFieldOrder((order) =>
      order.includes(field)
        ? order.filter((f) => f !== field)
        : [...order, field]
    );
  };
  const onDragEnd = (res: DropResult) => {
    if (!res.destination) return;
    const o = [...fieldOrder];
    const [m] = o.splice(res.source.index, 1);
    o.splice(res.destination.index, 0, m);
    setFieldOrder(o);
  };

  // preload header options for currently checked columns (not strictly needed now, kept harmless)
  useEffect(() => {
    if (!isModalOpen) return;
    const unique = Array.from(new Set(checkedFields));
    const safe = restricted ? unique.filter((f) => f !== "partnership") : unique;
    if (safe.length) dispatch(fetchHeaderOptions(safe));
  }, [isModalOpen, checkedFields, restricted, dispatch]);

  // apply columns + filters together
  const handleApply = () => {
    // validate dates (if one set require both)
    if (!!dateFrom !== !!dateTo) {
      alert(t("please_choose_both_dates"));
      return;
    }

    const cols = Array.from(new Set(fieldOrder));
    const safeCols = restricted ? cols.filter((f) => f !== "partnership") : cols;
    const finalCols = safeCols.filter((f) => checkedFields.includes(f));
    setAppliedFields(finalCols);

    // build filter payload
    const next: Record<string, string | string[]> = {};

    // EU/NonEU
    if (euNoneu) {
      next.col_type = "eu";
      next.category = euNoneu; // "EU" | "NonEU"
    }

    // registration date range
    if (dateFrom && dateTo) {
      next.date_from = dateFrom.format("YYYY-MM-DD");
      next.date_to = dateTo.format("YYYY-MM-DD");
    }

    // statuses[]
    if (statuses.length > 0) {
      next["statuses"] = statuses; // ['unverified','limited','dormant','verified']
    }

    setFilters(next);
    setPageModel((m) => ({ ...m, page: 0 }));
    setModalOpen(false);
  };

  const clearAllFilters = () => {
    setEuNoneu("");
    setDateFrom(null);
    setDateTo(null);
    setStatuses([]);
    setFilters({});
    setPageModel((m) => ({ ...m, page: 0 }));
  };

  // toggle a status checkbox
  const toggleStatus = (key: "unverified" | "limited" | "dormant" | "verified") =>
    setStatuses((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );

  // build grid column defs
  const gridColumns: GridColDef[] = useMemo(
    () =>
      appliedFields.map((field) => {
        const colDef: GridColDef = {
          field,
          headerName: ALL_COLUMNS.find((c) => c.field === field)!.headerName,
          flex: 1,
          sortable: false,
          filterable: false,
        };
        if (field === "status") {
          return {
            ...colDef,
            renderCell: (params) => {
              const temp = document.createElement("div");
              temp.innerHTML = params.value;
              const text = (
                temp.textContent || temp.innerText || ""
              ).toUpperCase();
              const key = text.toLowerCase().replace(/\s+/g, "_");
              const bg =
                theme.palette.status[key]?.bg ||
                theme.palette.status.default.bg;
              const color =
                theme.palette.status[key]?.color ||
                theme.palette.status.default.color;
              return (
                <Box
                  sx={{
                    backgroundColor: bg,
                    color,
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {text}
                  </Typography>
                </Box>
              );
            },
          };
        }
        if (field === "partnership") {
          return {
            ...colDef,
            renderCell: (p) => (
              <span
                dangerouslySetInnerHTML={{ __html: (p.value as string) || "" }}
              />
            ),
          };
        }
        return colDef;
      }),
    [appliedFields, theme, ALL_COLUMNS]
  );

  // mobile condensed view
  const mobileColumns: GridColDef[] = useMemo(() => {
    if (!appliedFields.length) return [];
    const f0 = appliedFields[0];
    const f1 = appliedFields[1];
    const f2 = appliedFields[2];
    const f3 = appliedFields[3];
    return [
      {
        field: "email",
        headerName: t("info"),
        flex: 2,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {params.row[f0]}
            </Typography>
            {f1 && (
              <Typography variant="body2" color="text.secondary">
                {params.row[f1]}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: "details",
        headerName: t("details"),
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box>
            {f2 && (
              <Typography variant="body1" fontWeight="bold">
                {params.row[f2]}
              </Typography>
            )}
            {f3 && (
              <Typography variant="body2" color="text.secondary">
                {params.row[f3]}
              </Typography>
            )}
          </Box>
        ),
      },
    ];
  }, [appliedFields, t]);

  // fetch data whenever applied fields / filters / page changes
  useEffect(() => {
    if (!appliedFields.length) return;
    dispatch(
      fetchCustomReport({
        columns: appliedFields,
        filters, // now can contain eu + date range + statuses[]
        page: pageModel.page,
        pageSize: pageModel.pageSize,
      })
    );
  }, [dispatch, appliedFields, filters, pageModel]);

  // map server rows into grid rows
  useEffect(() => {
    if (data.length && appliedFields.length) {
      const mapped = data.map((row, i) => {
        const obj: any = { id: pageModel.page * pageModel.pageSize + i };
        appliedFields.forEach((f, idx) => (obj[f] = row[idx]));
        return obj;
      });
      setRows(mapped);
      setRowCount(total);
    } else {
      setRows([]);
      setRowCount(0);
    }
  }, [data, total, appliedFields, pageModel]);

  // export all (respects active filters including statuses[])
  const handleExportAll = async () => {
    const stored = localStorage.getItem("user") || "";
    const admin = stored ? JSON.parse(stored) : null;
    if (!admin?.uid) throw new Error("No admin");

    const form = new URLSearchParams();
    form.append("action", "custom-report");
    form.append("type", "export");
    form.append("admin_id", admin.uid);
    appliedFields.forEach((c) => form.append("columns[]", c));

    // append filters (handle arrays)
    Object.entries(filters).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((val) => form.append(`${k}[]`, val));
      } else if (v) {
        form.append(k, v);
      }
    });

    // Request *everything* in one response:
    form.append("start", "0");
    form.append("length", String(rowCount || total || 100000));

    try {
      const resp = await axiosInstance.post("/customreport", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const envelope = resp.data;
      const payload =
        typeof envelope.data === "string"
          ? JSON.parse(envelope.data)
          : envelope.data;

      const dt = (payload?.data ?? []) as any[][];
      const allRows = dt.map((r) => {
        const o: any = {};
        appliedFields.forEach((f, i) => (o[f] = r[i]));
        return o;
      });

      const ws = XLSX.utils.json_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "CustomReport");
      XLSX.writeFile(
        wb,
        `custom_report_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`
      );
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  // helper chips text
  const activeChips: string[] = useMemo(() => {
    const chips: string[] = [];
    if (filters.col_type === "eu" && typeof filters.category === "string" && filters.category) {
      chips.push(`${t("european")}: ${filters.category}`);
    }
    if (filters.date_from && filters.date_to) {
      chips.push(`${t("created")}: ${filters.date_from} → ${filters.date_to}`);
    }
    if (Array.isArray(filters.statuses) && filters.statuses.length) {
      chips.push(`${t("status")}: ${filters.statuses.join(", ")}`);
    }
    return chips;
  }, [filters, t]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          {t("choose_columns")}
        </Button>

        {appliedFields.length > 0 && (
          <Button variant="contained" onClick={handleExportAll}>
            {t("export_to_excel")}
          </Button>
        )}

        {activeChips.map((c, i) => (
          <Chip key={i} sx={{ ml: 1 }} color="primary" label={c} onDelete={clearAllFilters} />
        ))}
      </Stack>

      {appliedFields.length > 0 ? (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={isMobile ? mobileColumns : gridColumns}
            rowCount={rowCount}
            loading={loading}
            paginationMode="server"
            paginationModel={pageModel}
            onPaginationModelChange={setPageModel}
            pageSizeOptions={[10, 25, 50]}
            disableColumnMenu
            sortingMode="server"
            sortModel={[]}
            onRowClick={isMobile ? (p) => openDialog(p.row) : undefined}
          />
        </Box>
      ) : (
        <Typography>{t("select_at_least_one_column")}</Typography>
      )}

      {/* Mobile “More details” dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {t("details")}
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {dialogRow &&
            appliedFields.slice(4).map((field) => {
              const header = ALL_COLUMNS.find((c) => c.field === field)!.headerName;
              const val = dialogRow[field];
              return (
                <Box key={field} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{header}</Typography>
                  <Typography variant="body2">
                    {field === "partnership" ? (
                      <span
                        dangerouslySetInnerHTML={{ __html: String(val || "") }}
                      />
                    ) : (
                      String(val ?? "")
                    )}
                  </Typography>
                </Box>
              );
            })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("close")}</Button>
        </DialogActions>
      </Dialog>

      {/* ───────── ONE MODAL: columns + EU + registration date + STATUS CHECKBOXES ───────── */}
      <Dialog open={isModalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {t("choose_columns")}
          <IconButton
            aria-label="close"
            onClick={() => setModalOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Columns chooser */}
          <TextField
            fullWidth
            placeholder={t("search") + "..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={2} mb={1}>
            <Box flex={1}>
              {visibleCols.map((c) => (
                <FormControlLabel
                  key={c.field}
                  control={
                    <Checkbox
                      checked={checkedFields.includes(c.field)}
                      onChange={() => {
                        toggleField(c.field);
                      }}
                    />
                  }
                  label={c.headerName}
                />
              ))}
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2" gutterBottom>
                {t("selected_columns")}
              </Typography>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="fields">
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.droppableProps}>
                      {fieldOrder
                        .filter((f) => checkedFields.includes(f))
                        .map((f, i) => (
                          <Draggable key={f} draggableId={f} index={i}>
                            {(p) => (
                              <MuiPaper
                                ref={p.innerRef}
                                {...p.draggableProps}
                                {...p.dragHandleProps}
                                sx={{
                                  p: 1,
                                  mb: 1,
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                {ALL_COLUMNS.find((c) => c.field === f)!.headerName}
                                <i className="fa fa-bars" />
                              </MuiPaper>
                            )}
                          </Draggable>
                        ))}
                      {prov.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Filters inside the SAME modal */}
          <Stack spacing={3}>
            {/* EU / Non-EU */}
            <FormControl component="fieldset">
              <FormLabel component="legend">{t("european")}</FormLabel>
              <RadioGroup
                row
                value={euNoneu}
                onChange={(e) => setEuNoneu(e.target.value as any)}
              >
                <FormControlLabel value="" control={<Radio />} label={t("all")} />
                <FormControlLabel value="EU" control={<Radio />} label="EU" />
                <FormControlLabel value="NonEU" control={<Radio />} label="Non-EU" />
              </RadioGroup>
            </FormControl>

            {/* Registration date range */}
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <DatePicker
                  label={t("date_from")}
                  value={dateFrom}
                  onChange={(d) => {
                    if (moment.isMoment(d)) setDateFrom(d);
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label={t("date_to")}
                  value={dateTo}
                  onChange={(d) => {
                    if (moment.isMoment(d)) setDateTo(d);
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Stack>
            </LocalizationProvider>

            {/* Status checkboxes */}
            <Box>
              <FormLabel sx={{ mb: 1, display: "block" }}>{t("status")}</FormLabel>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statuses.includes("unverified")}
                      onChange={() => toggleStatus("unverified")}
                    />
                  }
                  label={t("unverified") || "Unverified"}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statuses.includes("limited")}
                      onChange={() => toggleStatus("limited")}
                    />
                  }
                  label={t("limited") || "Limited"}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statuses.includes("dormant")}
                      onChange={() => toggleStatus("dormant")}
                    />
                  }
                  label={t("dormant") || "Dormant"}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statuses.includes("verified")}
                      onChange={() => toggleStatus("verified")}
                    />
                  }
                  label={t("verified") || "Verified"}
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>{t("cancel")}</Button>
          <Button onClick={clearAllFilters}>{t("clear")}</Button>
          <Button variant="contained" onClick={handleApply}>
            {t("apply")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
