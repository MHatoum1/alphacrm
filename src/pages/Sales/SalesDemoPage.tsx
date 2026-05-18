// src/pages/SalesDemoPage.tsx
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Stack,
  Paper,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOutlet } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { fetchDemos } from "@/redux/slices/salesDemoSlice";
import { RootState } from "@/redux/store";
import EntityNoTabNoSearchPage from "@/components/ui/EntityNoTabNoSearchPage";
import { GridState } from "@/components/ui/DataTablesMapper";
import { GridColDef } from "@mui/x-data-grid";
import LinkRenderer from "@/components/ui/LinkRenderer";
import dayjs from "dayjs";

/* column→index map */
const backendCols: Record<string, number> = {
  date: 0,
  name: 1,
  email: 2,
  phone: 3,
  country: 4,
  status: 5,
  type: 6,
};

/* raw→row mapper */
const mapRow = (raw: any[], idx: number) => ({
  id: idx,
  date: raw[0],
  name: raw[1],
  email: raw[2],
  phone: raw[3],
  country: raw[4],
  status: raw[5],
  type: raw[6],
});

export default function SalesDemoPage() {
  const child = useOutlet();
  if (child) return <Paper sx={{ p: 3 }}>{child}</Paper>;

  const { t } = useTranslation();
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
            field: "date",
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
                  <LinkRenderer
                    htmlString={params.row.email}
                    openInNewTab={false}
                  />
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
          { field: "date", headerName: t("date"), flex: 1 },
          {
            field: "name",
            headerName: t("name"),
            flex: 1,
            renderCell: (p) => (
              <LinkRenderer htmlString={p.value} openInNewTab={false} />
            ),
          },
          {
            field: "email",
            headerName: t("email"),
            flex: 1,
            renderCell: (p) => (
              <LinkRenderer htmlString={p.value} openInNewTab={false} />
            ),
          },
          { field: "phone", headerName: t("phone"), flex: 1 },
          { field: "country", headerName: t("country"), width: 120 },
          statusChip("status"),
          { field: "type", headerName: t("type"), width: 100, sortable: false },
        ];

  const [search, setSearch] = useState("");
  const [gridKey, setGridKey] = useState(0);

  const buildFetchArg = useMemo(
    () =>
      ({ grid }: { grid: GridState }) => ({
        user_id: uid,
        gridState: { ...grid, filterValue: search },
      }),
    [uid, search]
  );

  const { rows, total, recordsFiltered, status } = useAppSelector(
    (s: RootState) => s.salesDemo
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">{t("demo_accounts")}</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setGridKey((k) => k + 1);
            }}
          />
          <IconButton onClick={() => setGridKey((k) => k + 1)}>
            <SearchIcon />
          </IconButton>
        </Stack>
      </Stack>

      {uid && (
        <EntityNoTabNoSearchPage<
          { user_id: string; gridState: GridState },
          any[],
          any
        >
          key={gridKey}
          fetchThunk={fetchDemos}
          selectSlice={() => ({
            data: rows,
            recordsTotal: total,
            status,
            recordsFiltered,
          })}
          mapRow={mapRow}
          buildColumns={buildCols}
          getBackendColumns={() => backendCols}
          buildFetchArg={buildFetchArg}
          initialGrid={{
            page: 0,
            pageSize: 10,
            sortModel: [{ field: "date", sort: "desc" }],
            filterValue: "",
            columns: [],
            backendColumns: backendCols,
            draw: 1,
            order: backendCols.date,
          }}
        />
      )}
    </Box>
  );
}
