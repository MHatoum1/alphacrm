import { Box, Typography, Link, Switch } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import EntityNoTabPage from "@/components/ui/EntityNoTabPage";
import LinkRenderer from "@/components/ui/LinkRenderer";
import {
  fetchCampaignsArchived,
  toggleCampaignStatus,
} from "@/redux/slices/adminMarketingSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import dayjs from "dayjs";

/* ─────── 1) backend index map ─────── */
const backendCols: Record<string, number> = {
  id: 0,
  code: 1,
  type: 2,
  placement: 3,
  link: 4,
  clicks: 5,
  first: 6,
  last: 7,
  status: 8,
};

/* ─────── 2) raw → row mapper ─────── */
const mapRow = (r: any[]) => ({
  id: r[0],
  code: r[1],
  type: r[2],
  placement: r[3],
  link: r[4],
  clicks: r[5],
  first: r[6],
  last: r[7],
  statusHtml: r[8],
  enabled: /checked/i.test(r[8]),
});

/* ─────── 4) page component ─────── */
export default function MarketingArchivedPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  /* ─────── 3) column factory (captures dispatch) ─────── */
  const makeColumns =
    (dispatch: AppDispatch) =>
    ({ isMobile, theme }: { isMobile: boolean; theme: any }): GridColDef[] => {
      const badge = (txt: string) => {
        const key = txt.toLowerCase().replace(/\s+/g, "_");
        const bg =
          theme.palette.status[key]?.bg ?? theme.palette.status.default.bg;
        const col =
          theme.palette.status[key]?.color ??
          theme.palette.status.default.color;
        return (
          <Box
            sx={{
              bgcolor: bg,
              color: col,
              px: 1,
              borderRadius: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {txt}
            </Typography>
          </Box>
        );
      };

      if (isMobile) {
        return [
          {
            field: "code",
            headerName: t("info"),
            flex: 2,
            renderCell: (params) => (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  <LinkRenderer htmlString={params.row.code} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {params.row.placement}
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
              <Box display="flex" flexDirection="column">
                {badge(
                  params.row.enabled
                    ? t("enabled").toUpperCase()
                    : t("disabled").toUpperCase()
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {params.row.last != null
                    ? dayjs(params.row.last).format("YYYY-MM-DD HH:mm")
                    : t("not_used")}
                </Typography>
              </Box>
            ),
          },
        ];
      }

      return [
        { field: "id", headerName: t("id"), flex: 1 },
        {
          field: "code",
          headerName: t("campaign_code"),
          flex: 2,
          renderCell: (p) => (
            <LinkRenderer htmlString={p.value} openInNewTab={false} />
          ),
        },
        { field: "type", headerName: t("type"), flex: 1, sortable: false },
        {
          field: "placement",
          headerName: t("channel"),
          flex: 1,
          sortable: false,
        },
        {
          field: "link",
          headerName: t("redirect_link"),
          flex: 2,
          renderCell: (p) =>
            p.value ? (
              <Link href={p.value} target="_blank" rel="noreferrer">
                {p.value}
              </Link>
            ) : (
              "—"
            ),
          sortable: false,
        },
        { field: "clicks", headerName: t("clicks"), flex: 1, sortable: false },
        { field: "first", headerName: t("first_activity"), flex: 1 },
        { field: "last", headerName: t("last_activity"), flex: 1 },
        {
          field: "enabled",
          headerName: t("status"),
          flex: 1,
          sortable: false,
          renderCell: (p) => (
            <Switch
              size="small"
              checked={Boolean(p.value)}
              onChange={(_, checked) => {
                p.api.setEditCellValue({
                  id: p.id,
                  field: "enabled",
                  value: checked,
                });
                dispatch(
                  toggleCampaignStatus({ id: p.row.id, enabled: checked })
                );
              }}
            />
          ),
        },
      ];
    };

  /* build columns once per dispatch */
  const buildColumns = useMemo(() => makeColumns(dispatch), [dispatch]);

  return (
    <EntityNoTabPage<
      { urlPart: string; gridState: GridState },
      any[],
      ReturnType<typeof mapRow>
    >
      PaperProps={{ sx: { p: 0, boxShadow: "none" } }}
      fetchThunk={fetchCampaignsArchived}
      selectSlice={(s: RootState) => s.marketing}
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      buildFetchArg={({ grid }) => ({ urlPart: "active", gridState: grid })}
      title={t("archived_campaigns")}
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "id", sort: "desc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: 0,
      }}
    />
  );
}
