// src/pages/SalesClientsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  MenuItem,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchDropdowns,
  fetchClients,
  ClientRow,
} from "@/redux/slices/salesClientSlice";
import { useOutlet } from "react-router-dom";
import { GridState } from "@/components/ui/DataTablesMapper";
import { RootState } from "@/redux/store";
import { GridColDef } from "@mui/x-data-grid";
import LinkRenderer from "@/components/ui/LinkRenderer";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import EntityNoTabPage from "@/components/ui/EntityNoTabPage";

// ── backend column map ────────────────────────────────────────
const backendCols: Record<string, number> = {
  name: 0,
  email: 1,
  phone: 2,
  country: 3,
  phase: 4,
  source: 5,
  partnership: 6,
  campaign: 7,
  status: 8,
  created: 9,
  funded: 10,
};

// ── raw → typed row mapper ────────────────────────────────────
export interface Row extends ClientRow {}
const mapRow = (raw: any[], idx: number): Row => ({
  id: idx,
  name: raw[1],
  email: raw[2],
  phone: raw[3],
  country: raw[4],
  phase: raw[5],
  source: raw[6],
  partnership: raw[7],
  campaign: raw[8],
  status: raw[9],
  created: raw[10],
  funded: raw[11],
});

export default function SalesClientsPage() {
  // ─── 1️⃣ All hooks at top ───────────────────────────────────
  const outlet = useOutlet();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { dropdowns, ddStatus } = useAppSelector((s) => s.salesClient);
  const uid = JSON.parse(localStorage.getItem("user") || "{}")
    ?.userID as string;
  const theme = useTheme();

  const statusChip = (field: "status" | "phase"): GridColDef => ({
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

  // ── desktop/mobile column factory ─────────────────────────────
  const buildColumns = ({
    isMobile,
    theme,
  }: {
    isMobile: boolean;
    theme: any;
  }): GridColDef<Row>[] =>
    isMobile
      ? [
          {
            field: "name",
            headerName: t("info"),
            flex: 2,
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
              temp.innerHTML = params.row.phase;

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
          {
            field: "name",
            headerName: t("name"),
            flex: 1,
            renderCell: (p) => (
              <LinkRenderer htmlString={p.value} openInNewTab={false} />
            ),
          },
          { field: "email", headerName: t("email"), flex: 1 },
          { field: "phone", headerName: t("phone"), flex: 1 },
          { field: "country", headerName: t("country"), width: 120 },
          statusChip("phase"),
          { field: "source", headerName: t("source"), width: 120 },
          {
            field: "partnership",
            headerName: t("partnership"),
            flex: 2,
            minWidth: 200,
            renderCell: (p) => (
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                  lineHeight: 1.3,
                }}
              >
                {(p.value ?? "").replace(/</g, "\n<")}
              </Typography>
            ),
          },
          {
            field: "campaign",
            headerName: t("campaign"),
            flex: 2,
            minWidth: 200,
            renderCell: (p) => (
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                  lineHeight: 1.3,
                }}
              >
                {p.value ?? ""}
              </Typography>
            ),
          },
          statusChip("status"),
          { field: "created", headerName: t("created"), width: 160 },
          { field: "funded", headerName: t("funded"), width: 100 },
        ];

  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    phase: "",
    funded: "",
    country: "",
    source: "",
    status: "",
    partnership: "",
    campaign: "",
  });
  const handleFilterChange =
    (k: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilters((o) => ({ ...o, [k]: e.target.value }));
  const handleDateFrom = (v: dayjs.Dayjs | null) =>
    setFilters((o) => ({ ...o, date_from: v?.format("YYYY-MM-DD") || "" }));
  const handleDateTo = (v: dayjs.Dayjs | null) =>
    setFilters((o) => ({ ...o, date_to: v?.format("YYYY-MM-DD") || "" }));

  const [open, setOpen] = useState(false);
  const [gridKey, setGridKey] = useState(0);

  // ─── 2️⃣ Side‐effects ───────────────────────────────────────
  // load dropdowns once
  useEffect(() => {
    dispatch(fetchDropdowns());
  }, [dispatch]);

  // ─── 3️⃣ Memoize fetch arg ─────────────────────────────────
  const buildFetchArg = useMemo(
    () =>
      ({ grid }: { grid: GridState }) => ({
        user_id: uid,
        gridState: grid,
        filters,
      }),
    [uid, filters]
  );

  // ─── 4️⃣ Early return for nested pages ─────────────────────
  if (outlet) {
    return <Paper sx={{ p: 3 }}>{outlet}</Paper>;
  }

  // ─── 5️⃣ Render table + filter dialog ─────────────────────
  return (
    <Box sx={{ p: 3 }}>
      {/* header */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">{t("clients")}</Typography>
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

      {/* unified table */}
      {uid && (
        <EntityNoTabPage<
          { user_id: string; gridState: GridState; filters: typeof filters },
          any[],
          Row
        >
          title={t("clients")}
          key={gridKey}
          fetchThunk={fetchClients}
          selectSlice={(s: RootState) => ({
            data: s.salesClient.rows,
            recordsTotal: s.salesClient.total,
            status: s.salesClient.status,
            recordsFiltered: s.salesClient.recordsFiltered,
          })}
          mapRow={mapRow}
          buildColumns={buildColumns}
          buildFetchArg={buildFetchArg}
          getBackendColumns={() => backendCols}
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

      {/* filter dialog (unchanged) */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("filter_title")}</DialogTitle>
        <DialogContent dividers>
          {ddStatus !== "succeeded" ? (
            <CircularProgress />
          ) : (
            <Stack spacing={2} mt={1}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label={t("from")}
                    value={filters.date_from ? dayjs(filters.date_from) : null}
                    onChange={(v) => handleDateFrom(v as dayjs.Dayjs | null)}
                    slotProps={{ textField: { size: "small" } }}
                  />
                  <DatePicker
                    label={t("to")}
                    value={filters.date_to ? dayjs(filters.date_to) : null}
                    onChange={(v) => handleDateTo(v as dayjs.Dayjs | null)}
                    slotProps={{ textField: { size: "small" } }}
                  />
                </Stack>
              </LocalizationProvider>

              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  fullWidth
                  label={t("country")}
                  value={filters.country}
                  onChange={handleFilterChange("country")}
                >
                  {dropdowns.countries.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.text}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  label={t("source")}
                  value={filters.source}
                  onChange={handleFilterChange("source")}
                >
                  {dropdowns.sources.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.text}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  fullWidth
                  label={t("status")}
                  value={filters.status}
                  onChange={handleFilterChange("status")}
                >
                  {dropdowns.statuses.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.text}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  label={t("partnership")}
                  value={filters.partnership}
                  onChange={handleFilterChange("partnership")}
                >
                  {dropdowns.partnerships.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.text}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <TextField
                select
                fullWidth
                label={t("campaign")}
                value={filters.campaign}
                onChange={handleFilterChange("campaign")}
              >
                {dropdowns.campaigns.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.text}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={4}>
                <TextField
                  select
                  label={t("phase")}
                  value={filters.phase}
                  onChange={handleFilterChange("phase")}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">{t("any")}</MenuItem>
                  <MenuItem value="verified">{t("verified")}</MenuItem>
                  <MenuItem value="activated">{t("activated")}</MenuItem>
                  <MenuItem value="notactivated">{t("not_activated")}</MenuItem>
                </TextField>

                <TextField
                  select
                  label={t("funded")}
                  value={filters.funded}
                  onChange={handleFilterChange("funded")}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">{t("any")}</MenuItem>
                  <MenuItem value="yes">{t("yes")}</MenuItem>
                  <MenuItem value="no">{t("no")}</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setFilters({
                date_from: "",
                date_to: "",
                phase: "",
                funded: "",
                country: "",
                source: "",
                status: "",
                partnership: "",
                campaign: "",
              })
            }
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
