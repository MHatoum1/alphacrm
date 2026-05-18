// src/pages/SalesLeadsPage.tsx
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridColDef } from "@mui/x-data-grid";
import { useOutlet } from "react-router-dom";

/* date-pickers */
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchLeadDropdowns, fetchLeads } from "@/redux/slices/salesLeadSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import LinkRenderer from "@/components/ui/LinkRenderer";
import EntityNoTabPage from "@/components/ui/EntityNoTabPage";

/* ── backend column indexes (array → object) ───────────────── */
const backendCols: Record<string, number> = {
  assigned: 0,
  name: 1,
  email: 2,
  status: 3,
  source: 4,
  country: 5,
  phone: 6,
  created: 7,
};
/* map array → typed row (id is local index) */
const mapRow = (raw: any[], idx: number) => ({
  id: idx,
  assigned: raw[0],
  name: raw[1],
  email: raw[2],
  status: raw[3],
  source: raw[4],
  country: raw[5],
  phone: raw[6],
  created: raw[7],
});

export default function SalesLeadsPage() {
  const child = useOutlet();
  if (child) return <Paper sx={{ p: 3 }}>{child}</Paper>;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { dropdowns, ddStatus } = useAppSelector((s) => s.salesLead);
  const uid = JSON.parse(localStorage.getItem("user") ?? "{}")?.userID as
    | string
    | undefined;
  const theme = useTheme();

  const statusChip = (
    field: "status" | "processed" | "platform"
  ): GridColDef => ({
    field,
    headerName: t(field[0].toUpperCase() + field.slice(1)),
    flex: 1,
    renderCell: (params) => {
      const el = document.createElement("div");
      el.innerHTML = params.value;
      const txt = (el.textContent || el.innerText || "").toUpperCase();
      const txtStyle = txt.toLowerCase().replace(/\s+/g, "_");
      const bg =
        theme.palette.status[txtStyle]?.bg || theme.palette.status.default.bg;
      const color =
        theme.palette.status[txtStyle]?.color ||
        theme.palette.status.default.color;
      return (
        <Box
          sx={{
            backgroundColor: bg,
            color,
            borderRadius: 1,
            px: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {txt}
          </Typography>
        </Box>
      );
    },
  });
  /* columns */
  const buildCols = ({
    isMobile,
    theme,
  }: {
    isMobile: boolean;
    theme: any;
  }): GridColDef<any>[] =>
    isMobile
      ? [
          {
            field: "assigned",
            headerName: t("info"),
            flex: 2,
            sortable: false,
            renderCell: (params) => (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  <LinkRenderer
                    htmlString={params.row.name}
                    openInNewTab={false}
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {params.row.email}
                </Typography>
              </Box>
            ),
          },
          {
            field: "details",
            headerName: t("details"),
            flex: 1,
            sortable: false,
            renderCell: (params) => {
              const temp = document.createElement("div");
              temp.innerHTML = params.row.status;

              const statusText = (
                temp.textContent ||
                temp.innerText ||
                ""
              ).toUpperCase();
              const statusKey = statusText.toLowerCase().replace(/\s/g, "_");
              const backgroundColor =
                theme.palette.status[statusKey]?.bg ||
                theme.palette.status.default.bg;
              const textColor =
                theme.palette.status[statusKey]?.color ||
                theme.palette.status.default.color;
              return (
                <Box display="flex" flexDirection="column">
                  <Box
                    sx={{
                      backgroundColor,
                      color: textColor,
                      borderRadius: "8px",
                      padding: "4px 8px",
                      textAlign: "center",
                      minWidth: "90px",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {statusText}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {dayjs(params.row.created).format("YYYY-MM-DD HH:mm")}
                  </Typography>
                </Box>
              );
            },
          },
        ]
      : [
          { field: "assigned", headerName: t("assigned"), width: 160 },
          {
            field: "name",
            headerName: t("name"),
            flex: 1,
            renderCell: (p) => (
              <LinkRenderer htmlString={p.value} openInNewTab={false} />
            ),
          },
          { field: "email", headerName: t("email"), flex: 1 },
          statusChip("status"),
          { field: "source", headerName: t("source"), width: 140 },
          { field: "country", headerName: t("country"), width: 120 },
          { field: "phone", headerName: t("phone"), flex: 1 },
          { field: "created", headerName: t("created"), width: 160 },
        ];

  /* filters */
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    country: "",
    source: "",
    status: "",
  });
  const onChange = (k: keyof typeof filters) => (e: any) =>
    setFilters((o) => ({ ...o, [k]: e.target.value }));

  /* date-picker helpers – convert Dayjs → "YYYY-MM-DD" (or empty string) */
  const onDateFrom = (val: dayjs.Dayjs | null) =>
    setFilters((o) => ({
      ...o,
      date_from: val ? val.format("YYYY-MM-DD") : "",
    }));

  const onDateTo = (val: dayjs.Dayjs | null) =>
    setFilters((o) => ({
      ...o,
      date_to: val ? val.format("YYYY-MM-DD") : "",
    }));

  const [open, setOpen] = useState(false);
  const [gridKey, setGridKey] = useState(0);

  /* dropdowns once */
  useEffect(() => {
    dispatch(fetchLeadDropdowns());
  }, [dispatch]);

  /* build fetch arg */
  const buildFetchArg = useMemo(
    () =>
      ({ grid }: { grid: GridState }) => ({
        user_id: uid!,
        gridState: grid,
        filters,
      }),
    [uid, filters]
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* header */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">{t("leads")}</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={() => (window.location.href = "/clients/create")}
          >
            {t("create_lead")}
          </Button>
          <IconButton onClick={() => setOpen(true)}>
            <FilterListIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* table */}
      {uid && (
        <EntityNoTabPage<
          { user_id: string; gridState: GridState; filters: typeof filters },
          any[],
          any
        >
          title={t("leads")}
          key={gridKey}
          fetchThunk={fetchLeads}
          selectSlice={(s: RootState) => ({
            data: s.salesLead.rows,
            recordsTotal: s.salesLead.total,
            status: s.salesLead.status,
            recordsFiltered: s.salesLead.recordsFiltered,
          })}
          mapRow={mapRow}
          buildColumns={buildCols}
          getBackendColumns={() => backendCols}
          buildFetchArg={buildFetchArg}
          initialGrid={{
            page: 0,
            pageSize: 10,
            sortModel: [{ field: "created", sort: "desc" }],
            filterValue: "",
            columns: [],
            backendColumns: backendCols,
            draw: 1,
            order: backendCols.created,
          }}
        />
      )}

      {/* filter dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("filter_title")}</DialogTitle>
        <DialogContent dividers>
          {ddStatus !== "succeeded" ? (
            <CircularProgress />
          ) : (
            <Stack spacing={2} mt={1}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                  <DatePicker
                    label={t("from")}
                    value={filters.date_from ? dayjs(filters.date_from) : null}
                    onChange={(val) => onDateFrom(val as dayjs.Dayjs | null)}
                    slotProps={{
                      textField: { size: "small", fullWidth: false },
                    }}
                  />
                  <DatePicker
                    label={t("to")}
                    value={filters.date_to ? dayjs(filters.date_to) : null}
                    onChange={(val) => onDateTo(val as dayjs.Dayjs | null)}
                    slotProps={{
                      textField: { size: "small", fullWidth: false },
                    }}
                  />
                </Stack>
              </LocalizationProvider>
              <TextField
                select
                label={t("country")}
                value={filters.country}
                onChange={onChange("country")}
              >
                {dropdowns.countries.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.text}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={t("source")}
                value={filters.source}
                onChange={onChange("source")}
              >
                {dropdowns.sources.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.text}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={t("status")}
                value={filters.status}
                onChange={onChange("status")}
              >
                {dropdowns.statuses.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.text}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setFilters({
                date_from: "",
                date_to: "",
                country: "",
                source: "",
                status: "",
              });
            }}
          >
            {t("clear")}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpen(false);
              setGridKey((k) => k + 1);
            }}
          >
            {t("apply")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
