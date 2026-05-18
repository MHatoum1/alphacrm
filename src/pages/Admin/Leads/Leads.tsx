// src/pages/Leads.tsx

import { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import EntitySalesTablePage from "@/components/ui/EntitySalesTablePage";
import {
  fetchLeadDropdowns,
  fetchLeads,
  fetchSalesUsers,
} from "@/redux/slices/adminLeadsSlice";
import { RootState } from "@/redux/store";
import {
  mapGridStateToDataTablesParams,
  GridState,
} from "@/components/ui/DataTablesMapper";
import { useTranslation } from "react-i18next";
import LinkRenderer from "@/components/ui/LinkRenderer";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";

import { useParams } from "react-router-dom";

import { useOutlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import AssignToolbar from "@/components/ui/AssignToolbar";

import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import LeadSwitcher, { leadsTabs, TabKey } from "@/components/ui/LeadSwitcher";

/* ───────────────────────────── tabs ───────────────────────────── */

const tabAction: Record<TabKey, string> = {
  clients: "select",
  leads: "select-leads",
  reverted: "reverted-clients",
  cold: "cold-leads",
  demo: "demo-leads",
  create: "create",
  import: "import",
  deposit: "deposit-report",
  redepo: "redeposit-report",
};

/* ──────────────── raw array ‑→ row object mapper ─────────────── */

/* ──────────────── raw array -→ row object mapper ─────────────── */

const mapRow =
  (activeTab: TabKey) =>
  (row: any[], idx: number): Record<string, any> => {
    switch (activeTab) {
      /* Clients (default) */
      case "clients":
        return {
          id: row[0],
          fullName: row[1],
          email: row[2],
          phoneNumber: row[3],
          country: row[4],
          phase: row[5],
          source: row[6],
          partnership: row[7],
          campaign: row[8],
          status: row[9],
          created: row[10],
          funded: row[11],
          sales: row[12],
        };

      /* Leads */
      case "leads":
        return {
          id: row[0],
          fullName: row[1],
          email: row[2],
          phoneNumber: row[3],
          country: row[4],
          source: row[5],
          status: row[6],
          sales: row[7],
          created: row[8],
        };

      case "reverted":
        return {
          id: row[0],
          fullName: row[1],
          email: row[2],
          phoneNumber: row[3],
          country: row[4],
          status: row[5],
          sales: row[6],
          campaign: row[7],
          created: row[8],
        };

      case "cold":
        return {
          id: idx,
          fullName: row[1],
          email: row[2],
          phoneNumber: row[3],
          country: row[4],
          source: row[5],
          sales: row[6],
          created: row[7],
          funded: row[8],
          partner: row[9],
          status: row[10],
        };

      /* Demo */
      case "demo":
        return {
          id: idx,
          fullName: row[1],
          email: row[2],
          phoneNumber: row[3],
          country: row[4],
          source: row[5],
          sales: row[6],
          created: row[7],
          funded: row[8],
          partner: row[9],
          status: row[10],
        };

      case "deposit":
        return {
          id: idx,
          fullName: row[1],
          nbClients: row[2],
          USD: row[3],
          EUR: row[4],
          LBP: row[5],
          checksUSD: row[6],
          checksEUR: row[7],
          checksLBP: row[8],
        };
      case "redepo":
        return {
          id: idx,
          fullName: row[1],
          USD: row[2],
          EUR: row[3],
          LBP: row[4],
          checksUSD: row[5],
          checksEUR: row[6],
          checksLBP: row[7],
        };
      /* Any other tab – fall back to Clients */
      default:
        return {
          id: idx,
          fullName: row[1],
          email: row[2],
          phoneNumber: row[3],
          country: row[4],
          phase: row[5],
          source: row[6],
          partnership: row[7],
          campaign: row[8],
          status: row[9],
          created: row[10],
          funded: row[11],
          sales: row[12],
        };
    }
  };

/* ───────────────────── backend column map ────────────────────── */

/* ───────────────────── backend column map ────────────────────── */

const backendColsByTab: Record<TabKey, Record<string, number>> = {
  /* Clients (default) */
  clients: {
    fullName: 1,
    email: 2,
    phoneNumber: 3,
    country: 4,
    phase: 5,
    source: 6,
    partnership: 7,
    campaign: 8,
    status: 9,
    created: 10,
    funded: 11,
    sales: 12,
  },

  /* Leads */
  leads: {
    fullName: 1,
    email: 2,
    phoneNumber: 3,
    country: 4,
    source: 5,
    status: 6,
    sales: 7,
    created: 8,
  },
  reverted: {
    fullName: 0,
    email: 1,
    phoneNumber: 2,
    country: 3,
    status: 4,
    sales: 5,
    campaign: 6,
    created: 7,
  },

  cold: {
    fullName: 0,
    email: 1,
    phoneNumber: 2,
    country: 3,
    source: 4,
    sales: 5,
    created: 6,
    funded: 7,
    partner: 8,
    status: 9,
  },

  /* Demo */
  demo: {
    fullName: 0,
    email: 1,
    phoneNumber: 2,
    country: 3,
    source: 4,
    sales: 5,
    created: 6,
    funded: 7,
    partner: 8,
    status: 9,
  },

  deposit: {
    fullName: 0,
    nbClients: 1,
    USD: 2,
    EUR: 3,
    LBP: 4,
    checksUSD: 5,
    checksEUR: 6,
    checksLBP: 7,
  },
  redepo: {
    fullName: 0,
    USD: 1,
    EUR: 2,
    LBP: 3,
    checksUSD: 4,
    checksEUR: 5,
    checksLBP: 6,
  },

  /* Tabs that don't need special handling reuse Clients */

  create: {},
  import: {},
};

const getBackendColumns = (activeTab: TabKey) => {
  const cols = backendColsByTab[activeTab];
  return Object.keys(cols).length ? cols : backendColsByTab.clients;
};

export default function LeadsPage() {
  const child = useOutlet();

  const dispatch = useAppDispatch();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ─── if a child route is active just show it ────────────── */
  if (child) {
    return <Paper sx={{ p: 3 }}>{child}</Paper>;
  }

  const { t } = useTranslation();

  const { "*": subRoute = "" } = useParams();

  // Extract tab from current pathname, e.g. /potential/cold → "cold"
  const pathSegments = location.pathname.split("/");
  const tab = (pathSegments[2] || "clients") as TabKey;

  // ① derive activeTab
  const activeTab = useMemo<TabKey>(() => {
    return (
      leadsTabs(t).find((tb) => subRoute.includes(tb.key)) ?? leadsTabs(t)[0]
    ).key as TabKey;
  }, [subRoute, t]);

  // ② derive defaultSortField
  const defaultSortField = useMemo<string>(() => {
    if (activeTab === "redepo") return "USD";
    if (activeTab === "deposit") return "nbClients";
    return "created";
  }, [activeTab]);

  // ③ derive backendColumns
  const defaultBackendCols = useMemo(
    () => getBackendColumns(activeTab),
    [activeTab]
  );

  // ❹ force remount on tab switch
  const [gridKey, setGridKey] = useState(0);
  useEffect(() => {
    setGridKey((k) => k + 1);
  }, [activeTab]);

  /* ────────────────────────── page itself ─────────────────────── */

  /* ─────────────────────── columns builder ─────────────────────── */

  const buildColumns = ({
    activeTab,
    isMobile,
    theme,
  }: {
    activeTab: TabKey;
    isMobile: boolean;
    theme: any;
  }): GridColDef[] => {
    if (isMobile) {
      return [
        {
          field: "info",
          headerName: t("info"),
          flex: 2,
          renderCell: (params) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                <LinkRenderer htmlString={params.row.fullName} />
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
            activeTab === "clients"
              ? (temp.innerHTML = params.row.phase)
              : activeTab === "deposit"
              ? (temp.innerHTML = params.row.nbClients)
              : activeTab === "redepo"
              ? (temp.innerHTML = params.row.USD)
              : (temp.innerHTML = params.row.status);
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
      ];
    }

    /* ───────── desktop layout ───────── */

    /* — base single-source definitions — */
    const colDefs: Record<string, GridColDef> = {
      id: {
        field: "id",
        headerName: t("id"),
        flex: 1,
      },
      fullName: {
        field: "fullName",
        headerName: t("name"),
        flex: 2,
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      email: {
        field: "email",
        headerName: t("email"),
        flex: 2,
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      phoneNumber: { field: "phoneNumber", headerName: t("phone"), flex: 1 },
      country: { field: "country", headerName: t("country"), flex: 1 },
      phase: {
        field: "phase",
        headerName: t("phase"),
        flex: 1,
        renderCell: (params) => {
          const temp = document.createElement("div");
          temp.innerHTML = params.value;
          const text = (temp.textContent || temp.innerText || "").toUpperCase();
          const textStyle = text.toLowerCase().replace(/\s+/g, "_");
          const backgroundColor =
            theme.palette.status[textStyle]?.bg ||
            theme.palette.status.default.bg;
          const textColor =
            theme.palette.status[textStyle]?.color ||
            theme.palette.status.default.color;
          return (
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
                {text}
              </Typography>
            </Box>
          );
        },
      },
      source: {
        field: "source",
        headerName: t("source"),
        flex: 1,
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      partnership: {
        field: "partnership",
        headerName: t("partnership"),
        flex: 2,
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      campaign: {
        field: "campaign",
        headerName: t("campaign"),
        flex: 1,
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      status: {
        field: "status",
        headerName: t("status"),
        flex: 1,
        renderCell: (params) => {
          const temp = document.createElement("div");
          temp.innerHTML = params.value;
          const text = (temp.textContent || temp.innerText || "").toUpperCase();
          const textStyle = text.toLowerCase().replace(/\s+/g, "_");
          const backgroundColor =
            theme.palette.status[textStyle]?.bg ||
            theme.palette.status.default.bg;
          const textColor =
            theme.palette.status[textStyle]?.color ||
            theme.palette.status.default.color;
          return (
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
                {text}
              </Typography>
            </Box>
          );
        },
      },
      created: { field: "created", headerName: t("created"), flex: 1 },
      funded: {
        field: "funded",
        headerName: t("funded"),
        flex: 1,
        sortable: false,
      },
      sales: { field: "sales", headerName: t("sales"), flex: 1 },
      nbClients: { field: "nbClients", headerName: t("new_clients"), flex: 1 },
      USD: { field: "USD", headerName: t("cash_deposit_usd"), flex: 1 },
      EUR: { field: "EUR", headerName: t("cash_deposit_eur"), flex: 1 },
      LBP: { field: "LBP", headerName: t("cash_deposit_lbp"), flex: 1 },
      checksUSD: { field: "checksUSD", headerName: t("checks_usd"), flex: 1 },
      checksEUR: { field: "checksEUR", headerName: t("checks_eur"), flex: 1 },
      checksLBP: { field: "checksLBP", headerName: t("checks_lbp"), flex: 1 },
    };

    /* — small helper to pick only what each tab needs — */
    const pick = (fields: string[]) =>
      fields.map((f) => colDefs[f]).filter(Boolean);

    /* — tab-specific column sets — */
    switch (activeTab) {
      /* Clients: already correct, so return full list */
      case "clients":
        return pick([
          "fullName",
          "email",
          "phoneNumber",
          "country",
          "phase",
          "source",
          "partnership",
          "campaign",
          "status",
          "created",
          "funded",
          "sales",
        ]);

      /* Leads tab */
      case "leads":
        return pick([
          "fullName",
          "email",
          "phoneNumber",
          "country",
          "source",
          "status",
          "sales",
          "created",
        ]);

      case "reverted":
        return pick([
          "fullName",
          "email",
          "phoneNumber",
          "country",
          "status",
          "sales",
          "campaign",
          "created",
        ]);

      case "cold":
        return pick([
          "fullName",
          "email",
          "phoneNumber",
          "country",
          "source",
          "sales",
          "created",
          "funded",
          "partner",
          "status",
        ]);

      /* Demo tab */
      case "demo":
        return pick([
          "fullName",
          "email",
          "phoneNumber",
          "country",
          "source",
          "sales",
          "created",
          "funded",
          "partner",
          "status",
        ]);

      case "deposit":
        return pick([
          "fullName",
          "nbClients",
          "USD",
          "EUR",
          "LBP",
          "checksUSD",
          "checksEUR",
          "checksLBP",
        ]);

      case "redepo":
        return pick([
          "fullName",
          "USD",
          "EUR",
          "LBP",
          "checksUSD",
          "checksEUR",
          "checksLBP",
        ]);

      /* Any other tab keeps the previous (clients) layout */
      default:
        return pick([
          "fullName",
          "email",
          "phoneNumber",
          "country",
          "phase",
          "source",
          "partnership",
          "campaign",
          "status",
          "created",
          "funded",
          "sales",
        ]);
    }
  };

  // ⑤ memoized initialGrid
  const initialGrid = useMemo<GridState>(
    () => ({
      page: 0,
      pageSize: 10,
      sortModel: isMobile ? [] : [{ field: defaultSortField, sort: "desc" }],
      filterValue: "",
      columns: [],
      backendColumns: defaultBackendCols,
      draw: 1,
      ...(isMobile ? {} : { order: defaultBackendCols[defaultSortField] }),
    }),
    [isMobile, defaultSortField, defaultBackendCols]
  );

  /* ❶  Load sales list on first render */
  const salesUsers = useAppSelector((s) => s.leads.salesUsers);
  const { filterLists, filtersStatus } = useAppSelector((s) => s.leads);
  useEffect(() => {
    dispatch(fetchSalesUsers());
    dispatch(fetchLeadDropdowns());
  }, [dispatch]);

  /* ❷  Local state – selected rows + chosen salesman */
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [salesId, setSalesId] = useState<number | "">("");

  /* toast helpers ------------------------------------------------ */
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // compute defaults once
  const today = dayjs();
  const threeMonthsAgo = today.subtract(3, "month");

  // ❸ add:
  // then in your hook…
  const [filters, setFilters] = useState({
    date_from: threeMonthsAgo.format("YYYY-MM-DD"),
    date_to: today.format("YYYY-MM-DD"),
    country: "",
    source: "",
    status: "",
    partnership: "",
    campaign: "",
    phase: "",
    funded: "",
    sales: "", // ← NEW
  });
  const handleFilterChange =
    (k: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilters((f) => ({ ...f, [k]: e.target.value }));

  const handleDateFrom = (val: dayjs.Dayjs | null) =>
    setFilters((o) => ({
      ...o,
      date_from: val ? val.format("YYYY-MM-DD") : "",
    }));

  const handleDateTo = (val: dayjs.Dayjs | null) =>
    setFilters((o) => ({
      ...o,
      date_to: val ? val.format("YYYY-MM-DD") : "",
    }));

  /* ─────────────── build argument for thunk fetch ──────────────── */
  const buildFetchArg = useMemo(
    () =>
      ({
        urlPart,
        searchParams,
        grid,
      }: {
        urlPart: string;
        searchParams: URLSearchParams;
        grid: GridState;
      }) => ({
        urlPart,
        action: tabAction[urlPart as TabKey],
        campaign: searchParams.get("campaign") ?? "",
        filters,
        gridState: grid,
      }),
    [filters]
  );

  const [filterOpen, setFilterOpen] = useState(false);

  const storedAdmin = localStorage.getItem("user") || "";
  const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
  if (!admin || !admin.uid) {
    throw new Error("User not found in localStorage");
  }

  const refreshGridState: GridState = {
    page: 0,
    pageSize: 10,
    sortModel: [{ field: defaultSortField, sort: "desc" }],
    filterValue: "",
    columns: [], // let the slice fill these again
    backendColumns: defaultBackendCols,
    draw: Date.now(), // ensure a new draw each refresh
    order: defaultBackendCols[defaultSortField],
  };

  /* ❸  Callback fired by the Assign button */
  const handleAssign = async () => {
    /* ① validate ------------------------------------------------- */
    if (!selectedIds.length) {
      setToastError(t("select_at_least_one_lead")); // 🔴 show error toast
      return;
    }
    if (salesId === "") {
      setToastError(t("assign_to_required")); // 🔴 “Un-assign” not allowed
      return;
    }

    const action =
      activeTab == "clients"
        ? "assign-client-to-sales"
        : "assign-leads-to-sales";
    try {
      const { data } = await axiosInstance.post(
        "/adminleads",
        {
          action,
          admin_id: admin.uid,
          users_id: selectedIds,
          sales_id: salesId,
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      /* ② success  → green toast -------------------------------- */
      const msgKey =
        data?.message ||
        (activeTab === "clients" ? "clients_assigned" : "lead_assigned");
      setToastMsg(t(msgKey));
    } catch (e: any) {
      /* ③ failure → red toast ----------------------------------- */
      setToastError(t(e.response?.data?.message || "failed_to_assign_leads"));
      return; // don't refresh grid on hard-error
    }

    // refresh grid
    dispatch(
      fetchLeads({
        urlPart: activeTab,
        action: tabAction[activeTab],
        campaign: "",
        filters,
        gridState: {
          ...initialGrid,
          page: 0,
          draw: Date.now(),
        },
      })
    );
    setSelectedIds([]);
    setSalesId("");
  };

  // pull raw backend rows from Redux
  const { recordsFiltered: totalFiltered } = useAppSelector((s: RootState) => ({
    data: s.leads.data,
    recordsFiltered: s.leads.recordsFiltered,
  }));
  const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "");
  const cleanString = (str: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = stripHtml(str);
    return txt.value;
  };
  const cleanObjectStrings = (obj: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        typeof v === "string" ? cleanString(v) : v,
      ])
    );
  /** Export the entire filtered data set to Excel */

  const handleExportAll = async () => {
    try {
      // 1) Build a GridState that requests *all* filtered rows:
      const exportGrid: GridState = {
        ...refreshGridState,
        page: 0,
        pageSize: totalFiltered,
      };

      // 2) Get URLSearchParams
      const form = mapGridStateToDataTablesParams(exportGrid, {
        urlPart: tab,
        campaign: "",
        action: tabAction[tab],
      });

      // 3) Append filters
      Object.entries(filters).forEach(([k, v]) => v && form.append(k, v));

      // 4) Fire the request
      const resp = await axiosInstance.post("/adminleads", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // 5) Unwrap
      const envelope = resp.data;
      const payload = envelope.data;
      const dt = typeof payload === "string" ? JSON.parse(payload) : payload; // { draw, recordsTotal, recordsFiltered, data }

      // 6) Map to objects using your existing row mapper, then clean strings
      const objectRows = (dt.data as any[][]).map((rowArr, i) =>
        mapRow(activeTab)(rowArr, i)
      );
      const cleanedRows = objectRows.map(cleanObjectStrings);

      // 7) Get visible columns + translated headers from your column builder
      //    (we want the desktop set for export)
      const cols = buildColumns({ activeTab, isMobile: false, theme });
      const fields = cols.map((c) => c.field);
      const headers = cols.map((c) => c.headerName);

      // 8) Build an AOA: header row + data rows in field order
      const aoa = [
        headers,
        ...cleanedRows.map((r) => fields.map((f) => r[f] ?? "")),
      ];

      // 9) Export via SheetJS
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      const ts = dayjs().format("YYYYMMDD_HHmmss");
      XLSX.writeFile(wb, `leads_${activeTab}_${ts}.xlsx`);
    } catch (e: any) {
      console.error("Export failed:", e);
      setToastError(t("failed_to_export"));
    }
  };

  const headerActions = (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="flex-end"
      flexWrap="nowrap"
      sx={{ width: "100%" }}
    >
      {!isMobile && (
        <AssignToolbar
          salesUsers={salesUsers}
          salesId={salesId}
          onSalesChange={setSalesId}
          onAssign={handleAssign}
        />
      )}

      {/* Desktop: full button with label */}
      {!isMobile ? (
        <Button variant="contained" onClick={handleExportAll}>
          {t("export_to_excel")}
        </Button>
      ) : (
        // Mobile: compact icon button + tooltip

        <IconButton
          onClick={handleExportAll}
          size="small"
          aria-label={t("export_to_excel")}
        >
          <DownloadOutlinedIcon />
        </IconButton>
      )}

      {activeTab !== "demo" && (
        <IconButton
          onClick={() => setFilterOpen(true)}
          size={isMobile ? "small" : "medium"}
        >
          <FilterListIcon />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <>
      {/* ① Tabs */}
      <LeadSwitcher>
        {/* global toasts (always keep on top) ----------------------- */}
        {toastMsg && (
          <CustomNotification
            message={toastMsg}
            onClose={() => setToastMsg(null)}
          />
        )}
        {toastError && (
          <CustomError
            errorMessage={toastError}
            onClose={() => setToastError(null)}
          />
        )}

        <Dialog
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          fullScreen={isMobile}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{t("filter_title")}</DialogTitle>
          <DialogContent dividers>
            {filtersStatus !== "succeeded" ? (
              <CircularProgress />
            ) : (
              <Stack spacing={2} mt={1}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                    <DatePicker
                      label={t("from")}
                      value={
                        filters.date_from ? dayjs(filters.date_from) : null
                      }
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
                    {filterLists.countries.map((o) => (
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
                    {filterLists.sources.map((o) => (
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
                    {filterLists.statuses.map((o) => (
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
                    {filterLists.partnerships.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.text}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <TextField
                  select
                  fullWidth
                  label={t("sales")}
                  value={filters.sales}
                  onChange={handleFilterChange("sales")}
                >
                  <MenuItem value="">{t("any")}</MenuItem>
                  {salesUsers.map((u) => (
                    <MenuItem key={u.value} value={String(u.value)}>
                      {u.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label={t("campaign")}
                  value={filters.campaign}
                  onChange={handleFilterChange("campaign")}
                >
                  {filterLists.campaigns.map((o) => (
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
                    <MenuItem value="notactivated">
                      {t("not_activated")}
                    </MenuItem>
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
                  country: "",
                  source: "",
                  status: "",
                  partnership: "",
                  campaign: "",
                  phase: "",
                  funded: "",
                  sales: "",
                })
              }
            >
              {t("clear")}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setFilterOpen(false);
                setGridKey((k) => k + 1);
              }}
            >
              {t("apply")}
            </Button>
          </DialogActions>
        </Dialog>

        <EntitySalesTablePage
          key={gridKey}
          showTabs={false}
          basePath="/potential"
          tabs={leadsTabs(t)}
          fetchThunk={fetchLeads}
          selectSlice={(s: RootState) => s.leads}
          mapRow={(row, idx, tab) => mapRow(tab as TabKey)(row, idx)}
          buildColumns={buildColumns}
          buildFetchArg={buildFetchArg}
          getBackendColumns={(tab) => getBackendColumns(tab as TabKey)}
          getTitle={(tab) => leadsTabs(t).find((x) => x.key === tab)!.label}
          initialGrid={{
            page: 0,
            pageSize: 10,
            sortModel: isMobile
              ? []
              : [{ field: defaultSortField, sort: "desc" }],
            filterValue: "",
            columns: [], // ← empty on first render
            backendColumns: defaultBackendCols,
            draw: 1,
            order: defaultBackendCols[defaultSortField],
          }}
          gridExtraProps={{
            checkboxSelection: true,
            rowSelectionModel: selectedIds,
            onRowSelectionModelChange: (m: GridRowSelectionModel) =>
              setSelectedIds(m as number[]),
          }}
          headerActions={headerActions} // <—— NEW: buttons live inside the container
        />
      </LeadSwitcher>
    </>
  );
}
