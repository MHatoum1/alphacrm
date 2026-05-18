/*  src/pages/Admin/System/AdminQueuePage.tsx  */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridColDef } from "@mui/x-data-grid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import QueueTablePage from "@/components/ui/QueueTablePage";
import type { RootState } from "@/redux/store";
import {
  fetchQueueList,
  fetchQueueDetails,
  QueueRow,
  reopenQueueTask,
} from "@/redux/slices/queueSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
/* ---- backend cols map (needed by thunk) ---- */
const backendCols = {
  task: 0,
  status: 1,
  processed: 2,
  created: 3,
  modified: 4,
};

/* ---- row mapper ---- */
const mapRow = (r: QueueRow) => ({
  ...r,
  id: r.RowId,
  statusTxt: r.status < 0 ? "Error" : r.status > 0 ? "Success" : "",
  processedTxt: r.processed == 1 ? "Processed" : "Not Processed",
});

/* ---- component ---- */
export default function AdminQueuePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const detail = useAppSelector((s) => s.queue.detail);

  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = (id: number) => {
    dispatch(fetchQueueDetails(id)).then(() => setDialogOpen(true));
  };

  /* reopen handler */
  const reopen = (id: number) => {
    dispatch(reopenQueueTask(id));
  };

  /* ---- columns factory (mobile  desktop) ---- */
  const makeCols =
    (_: (id: number) => void, reopen: (id: number) => void) =>
    ({
      isMobile,
      theme,
    }: {
      isMobile: boolean;
      theme: any;
    }): GridColDef<QueueRow>[] => {
      // Mobile: two-column Info/Details
      if (isMobile) {
        return [
          {
            field: "info",
            headerName: t("info"),
            flex: 2,
            sortable: false,
            renderCell: (params) => {
              const temp = document.createElement("div");
              temp.innerHTML =
                params.row.processed == 1 ? t("processed") : t("not processed");
              const statusText = (
                temp.textContent ||
                temp.innerText ||
                ""
              ).toUpperCase();
              const statusTextStyle = statusText
                .toLowerCase()
                .replace(/\s+/g, "_");
              const backgroundColor =
                theme.palette.status[statusTextStyle]?.bg ||
                theme.palette.status.default.bg;
              const textColor =
                theme.palette.status[statusTextStyle]?.color ||
                theme.palette.status.default.color;

              return (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
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
                      {params.row.created}
                    </Typography>
                  </Box>
                </Box>
              );
            },
          },
          {
            field: "details",
            headerName: t("details"),
            flex: 1,
            sortable: false,
            renderCell: (params) => {
              const txt = params.row.status == 1 ? t("success") : t("failed");
              const key = txt.toLowerCase().replace(/\s/g, "_");
              const bg =
                theme.palette.status[key]?.bg ||
                theme.palette.status.default.bg;
              const fg =
                theme.palette.status[key]?.color ||
                theme.palette.status.default.color;
              return (
                <Box display="flex" flexDirection="column">
                  <Box
                    sx={{
                      backgroundColor: bg,
                      color: fg,
                      borderRadius: 1,
                      px: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {txt}
                    </Typography>
                  </Box>

                  {/* action buttons on mobile */}
                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => openDialog(params.row.RowId)}
                    >
                      <InfoOutlinedIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => reopen(params.row.RowId)}
                    >
                      <ReplayIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </Box>
              );
            },
          },
        ];
      }

      // Desktop: full set
      return [
        { field: "task", headerName: t("task"), flex: 1, sortable: false },
        {
          field: "statusTxt",
          headerName: t("status"),
          flex: 1,
          sortable: false,
          renderCell: (params) => {
            const el = document.createElement("div");
            el.innerHTML = params.value;
            const txt = (el.textContent || el.innerText || "").toUpperCase();
            const key = txt.toLowerCase().replace(/\s/g, "_");
            const bg =
              theme.palette.status[key]?.bg || theme.palette.status.default.bg;
            const fg =
              theme.palette.status[key]?.color ||
              theme.palette.status.default.color;
            return (
              <Box
                sx={{
                  backgroundColor: bg,
                  color: fg,
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
        },
        {
          field: "processedTxt",
          headerName: t("processed"),
          flex: 1,
          sortable: false,
          renderCell: (params) => {
            const el = document.createElement("div");
            el.innerHTML = params.value;
            const txt = (el.textContent || el.innerText || "").toUpperCase();
            const key = txt.toLowerCase().replace(/\s/g, "_");
            const bg =
              theme.palette.status[key]?.bg || theme.palette.status.default.bg;
            const fg =
              theme.palette.status[key]?.color ||
              theme.palette.status.default.color;
            return (
              <Box
                sx={{
                  backgroundColor: bg,
                  color: fg,
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
        },
        { field: "created", headerName: t("created"), flex: 1 },
        { field: "modified", headerName: t("modified"), flex: 1 },
        {
          field: "actions",
          headerName: t("details"),
          flex: 1,
          sortable: false,
          renderCell: ({ row }) => (
            <>
              <IconButton size="small" onClick={() => openDialog(row.RowId)}>
                <InfoOutlinedIcon fontSize="inherit" />
              </IconButton>
              <IconButton size="small" onClick={() => reopen(row.RowId)}>
                <ReplayIcon fontSize="inherit" />
              </IconButton>
            </>
          ),
        },
      ];
    };

  const buildColumns = useMemo(
    () => makeCols(openDialog, reopen),
    [openDialog, reopen]
  );

  return (
    <>
      <QueueTablePage<
        {
          task: string | null;
          page: number;
          rows: number;
          sort: string;
          order: "asc" | "desc";
        },
        QueueRow,
        ReturnType<typeof mapRow>
      >
        title={t("queue")}
        fetchThunk={fetchQueueList}
        selectSlice={(s: RootState) => ({
          data: s.queue.rows,
          recordsTotal: s.queue.total,
          recordsFiltered: s.queue.total,
          status: s.queue.status,
        })}
        mapRow={mapRow}
        buildColumns={buildColumns}
        getBackendColumns={() => backendCols}
        buildFetchArg={({ grid }) => {
          const sort = grid.sortModel?.[0] ?? {
            field: "created",
            sort: "desc",
          };
          return {
            task: "mail",
            page: grid.page + 1,
            rows: grid.pageSize,
            sort: sort.field,
            order: sort.sort as "asc" | "desc",
          };
        }}
        initialGrid={{
          page: 0,
          pageSize: 10,
          sortModel: [{ field: "created", sort: "desc" }],
          filterValue: "",
          columns: [],
          backendColumns: {},
          draw: 1,
          order: 0,
        }}
      />

      {/* ---------- details dialog ---------- */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("details")}
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={() => setDialogOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {detail ? (
            <>
              {/* helper: if params contains serialized `email_html` extract & decode */}
              {(() => {
                const extractHtml = (src?: string) => {
                  if (!src) return null;
                  const m = src.match(/email_html";s:\d+:"([\s\S]*?)";/);
                  if (!m) return null;
                  return m[1]
                    .replace(/\\"/g, '"') // un-escape quotes
                    .replace(/\\r\\n?/g, "") // strip CR/LF escapes
                    .replace(/\\\//g, "/"); // un-escape /
                };
                const emailHtml = extractHtml(detail.params || undefined);

                return (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: 3,
                    }}
                  >
                    {/* ── left column ─────────────────────────────── */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t("input_parameters")}
                      </Typography>

                      {emailHtml ? (
                        /* show the e-mail itself */
                        <Box
                          sx={{
                            p: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            maxHeight: 500,
                            overflow: "auto",
                            background: "#fff",
                          }}
                          dangerouslySetInnerHTML={{ __html: emailHtml }}
                        />
                      ) : (
                        /* fallback – raw params string */
                        <Box
                          component="pre"
                          sx={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            p: 1,
                            bgcolor: "background.default",
                            borderRadius: 1,
                            fontSize: 12,
                          }}
                        >
                          {detail.params || "N/A"}
                        </Box>
                      )}

                      {/* keep OUTPUT params exactly as before */}
                      <Typography
                        variant="subtitle1"
                        sx={{ mt: 2 }}
                        gutterBottom
                      >
                        {t("output_parameters")}
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          p: 1,
                          bgcolor: "background.default",
                          borderRadius: 1,
                          fontSize: 12,
                        }}
                      >
                        {detail.out_params || "N/A"}
                      </Box>
                    </Box>

                    {/* ── right column : meta info ───────────────── */}
                    <Box sx={{ flex: 1, minWidth: 240 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t("meta")}
                      </Typography>
                      <dl style={{ margin: 0 }}>
                        <dt>{t("task")}</dt>
                        <dd>{detail.task}</dd>

                        <dt>{t("status")}</dt>
                        <dd>
                          {detail.status == null
                            ? "Pending"
                            : detail.status > 0
                            ? "Success"
                            : "Error"}
                        </dd>

                        <dt>{t("processed")}</dt>
                        <dd>{detail.processed ? t("yes") : t("no")}</dd>

                        <dt>{t("created")}</dt>
                        <dd>{detail.created}</dd>

                        <dt>{t("modified")}</dt>
                        <dd>{detail.modified}</dd>

                        <dt>{t("object_name")}</dt>
                        <dd>{detail.owner || "N/A"}</dd>

                        <dt>{t("object_id")}</dt>
                        <dd>{detail.owner_id || "N/A"}</dd>
                      </dl>

                      {detail.ownerInfo && (
                        <>
                          <Typography
                            variant="subtitle1"
                            sx={{ mt: 2 }}
                            gutterBottom
                          >
                            {t("owner_info")}
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-all",
                              p: 1,
                              bgcolor: "background.default",
                              borderRadius: 1,
                              fontSize: 12,
                            }}
                          >
                            {JSON.stringify(detail.ownerInfo, null, 2)}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                );
              })()}
            </>
          ) : (
            "Loading…"
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
