// src/pages/Admin/Settings/AccountReportPage.tsx
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  TextField,
  Stack,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment, { Moment } from "moment";
import { useState, useMemo } from "react";
import axiosInstance from "@/api/axiosInstance";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

import { useTheme, useMediaQuery, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAccountReport,
  AccountReportFilters,
} from "@/redux/slices/accountReportSlice";
import { useTranslation } from "react-i18next";
import { countriesList as countryOptions } from "@/assets/constants/countryCodes";
import { ALL_CURRENCIES as currencyOptions } from "@/assets/constants/currency";

export default function AccountReportPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { rows, status } = useAppSelector((s) => s.accountReport);

  // filter dialog open
  const [open, setOpen] = useState(false);

  // filters state
  const [euNoneu, setEuNoneu] = useState<"EU" | "NonEU" | "">("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [dateFrom, setDateFrom] = useState<Moment | null>(null);
  const [dateTo, setDateTo] = useState<Moment | null>(null);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  // paging
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const applyFilters = () => {
    if (!!dateFrom !== !!dateTo) {
      alert(t("please_choose_both_dates"));
      return;
    }
    if (!!min !== !!max) {
      alert(t("please_choose_both_balances"));
      return;
    }
    setOpen(false);
    const filters: AccountReportFilters = {
      euNoneu,
      country,
      currency,
      dateFrom: dateFrom?.format("YYYY-MM-DD") ?? "",
      dateTo: dateTo?.format("YYYY-MM-DD") ?? "",
      min,
      max,
    };
    dispatch(fetchAccountReport(filters));
  };

  const columns: GridColDef[] = [
    { field: "login", headerName: t("login"), flex: 1 },
    { field: "email", headerName: t("email"), flex: 1 },
    { field: "name", headerName: t("name"), flex: 1 },
    { field: "country", headerName: t("country"), flex: 1 },
    { field: "group", headerName: t("group"), flex: 1 },
    { field: "currency", headerName: t("currency"), flex: 1 },
    { field: "balance", headerName: t("balance"), type: "number", flex: 1 },
    { field: "campaign", headerName: t("campaign"), flex: 1 },
    {
      field: "partnership",
      headerName: t("partnership"),
      flex: 1,
      renderCell: (p) => (
        <span dangerouslySetInnerHTML={{ __html: (p.value as string) || "" }} />
      ),
    },
    { field: "sales", headerName: t("sales"), flex: 1 },
  ];

  // ─── mobile two-column snapshot ────────────────────────────
  const mobileColumns: GridColDef[] = useMemo(() => {
    if (columns.length < 4) return [];
    const [c0, c1, c2, c3] = columns;
    return [
      {
        field: "login",
        headerName: t("info"),
        flex: 2,
        sortable: false,
        renderCell: (params) => (
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {params.row[c0.field]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {params.row[c1.field]}
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
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {params.row[c2.field]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {params.row[c3.field]}
            </Typography>
          </Box>
        ),
      },
    ];
  }, [columns, t]);

  // ─── mobile detail dialog state ───────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState<any>(null);
  const openDialog = (row: any) => {
    setDialogRow(row);
    setDialogOpen(true);
  };

  // ➡️ New: export all filtered rows
  // …inside AccountReportPage…

  // ➡️ Fixed: export all filtered rows
  const handleExportAll = async () => {
    const stored = localStorage.getItem("user") || "";
    const admin = stored ? JSON.parse(stored) : null;
    if (!admin?.uid) {
      console.error("No admin_id");
      return;
    }

    // build form exactly as your PHP expects
    const form = new URLSearchParams();
    form.append("action", "report-accounts");
    form.append("admin_id", admin.uid);
    form.append("type", "export");

    form.append("eu_noneu", euNoneu);
    form.append("country", country);
    form.append("currency", currency);
    form.append("date_from", dateFrom?.format("YYYY-MM-DD") ?? "");
    form.append("date_to", dateTo?.format("YYYY-MM-DD") ?? "");
    form.append("min", min);
    form.append("max", max);

    // request every row
    form.append("start", "0");
    // form.append("length", String(total));

    try {
      const resp = await axiosInstance.post("/accountsreport", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // unwrap DataTables‐style wrapper
      const envelope = resp.data;
      const payload =
        typeof envelope.data === "string"
          ? JSON.parse(envelope.data)
          : envelope.data;

      // here, payload.rows is already an array of objects
      const allRows = payload.rows as Array<Record<string, any>>;

      // now build & download the workbook
      const ws = XLSX.utils.json_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Accounts");
      XLSX.writeFile(
        wb,
        `account_report_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`
      );
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          startIcon={<i className="fa fa-filter" />} // ✨ automatic gap
        >
          {t("filter")}
        </Button>

        <Button
          variant="contained"
          onClick={handleExportAll}
          disabled={status !== "succeeded"}
          startIcon={<i className="fa fa-download" />} // ✨ automatic gap
        >
          {t("export_to_excel")}
        </Button>
      </Stack>

      {status === "loading" ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          autoHeight
          rows={rows.map((r, i) => ({ ...r, id: i }))}
          columns={isMobile ? mobileColumns : columns}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          onRowClick={isMobile ? (p) => openDialog(p.row) : undefined}
        />
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("filter_accounts")}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">{t("eu_non_eu")}</FormLabel>
              <RadioGroup
                row
                value={euNoneu}
                onChange={(e) => setEuNoneu(e.target.value as any)}
              >
                <FormControlLabel value="EU" control={<Radio />} label="EU" />
                <FormControlLabel
                  value="NonEU"
                  control={<Radio />}
                  label="Non-EU"
                />
              </RadioGroup>
            </FormControl>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <FormLabel>{t("country")}</FormLabel>
                <Select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <MenuItem value="">
                    <em>{t("All")}</em>
                  </MenuItem>
                  {countryOptions.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <FormLabel>{t("currency")}</FormLabel>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <MenuItem value="">
                    <em>{t("all")}</em>
                  </MenuItem>
                  {currencyOptions.map((code) => (
                    <MenuItem key={code} value={code}>
                      {code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("min_balance")}
                value={min}
                onChange={(e) => setMin(e.target.value)}
                fullWidth
              />
              <TextField
                label={t("max_balance")}
                value={max}
                onChange={(e) => setMax(e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t("cancel")}</Button>
          <Button variant="contained" onClick={applyFilters}>
            {t("apply")}
          </Button>
        </DialogActions>
      </Dialog>

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
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {dialogRow &&
            // show fields beyond the first 4
            columns.slice(4).map((col) => {
              let val = dialogRow[col.field];
              if (val == null || val=="") val = "<br/>"; 
              return (
                <Box key={col.field} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{col.headerName}</Typography>
                  <Typography variant="body2">
                    {
                      <span
                        dangerouslySetInnerHTML={{ __html: String(val) || "" }}
                      />
                    }
                  </Typography>
                </Box>
              );
            })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("close")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
