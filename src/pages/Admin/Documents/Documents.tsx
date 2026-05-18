// src\pages\Admin\Documents\Documents.tsx
import { GridColDef } from "@mui/x-data-grid";
import EntityTablePage from "@/components/ui/EntityTablePage";
import {
  deleteDocument,
  fetchDocuments,
} from "@/redux/slices/adminDocumentsSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import { useTranslation } from "react-i18next";
import LinkRenderer from "@/components/ui/LinkRenderer";
import { Box, IconButton, Stack, Typography } from "@mui/material";

import { defineTabs } from "@/utils/defineTabs";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link as RouterLink } from "react-router-dom";
import { useAppDispatch } from "@/redux/hooks";

import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useState } from "react";

/* ───────────────────────────── tabs ───────────────────────────── */

type TabKey = "new" | "approved" | "rejected" | "expired" | "archived";

const documentsTabs = (t: any) =>
  defineTabs<TabKey>([
    {
      key: "new",
      label: t("new"),
      path: "/documents/new",
    },
    { key: "approved", label: t("approved"), path: "/documents/approved" },
    { key: "rejected", label: t("rejected"), path: "/documents/rejected" },
    { key: "expired", label: t("expired"), path: "/documents/expired" },
    { key: "archived", label: t("archived"), path: "/documents/archived" },
  ]);

/* ──────────────── raw array ‑→ row object mapper ─────────────── */

const mapRow = (r: any[], idx: number): Record<string, any> => ({
  id: idx, // ← every row now has a unique id
  email: r[0],
  name: r[1],
  type: r[2],
  created: r[3],
  status: r[4],
  user_id: r[5], // ← pull from new column
  file_name: r[6], // ← pull from new column
});

/* ───────────────────── backend column map ────────────────────── */

const backendCols: Record<string, number> = {
  email: 0,
  name: 1,
  type: 2,
  created: 3,
  status: 4,
  user_id: 5, // ← new
  file_name: 6, // ← new
};

const getBackendColumns = () => backendCols; // same for every tab

/* ─────────────── build argument for thunk fetch ──────────────── */

const buildFetchArg = ({
  urlPart,
  grid,
}: {
  urlPart: string;
  searchParams: URLSearchParams; // not needed here but kept for signature parity
  grid: GridState;
}) => ({ urlPart, gridState: grid });

/* ────────────────────────── page itself ─────────────────────── */

export default function DocumentsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // ─── snackbars ───────────────────────────────────────────────
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async (user_id: string, file_name: string) => {
    try {
      await dispatch(deleteDocument({ user_id, file_name })).unwrap();
      setSuccessMsg(t("document_deleted"));
    } catch (e: any) {
      setErrorMsg(e.message || t("delete_failed"));
    }
  };

  /* ─────────────────────── columns builder ─────────────────────── */

  const buildColumns = ({
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
          field: "created",
          headerName: t("info"),
          flex: 2,
          renderCell: (params) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                <LinkRenderer htmlString={params.row.email} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <LinkRenderer htmlString={params.row.name} />
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
                    {dayjs(params.row.created).format("YYYY-MM-DD HH:mm")}
                  </Typography>
                </Box>
              </Box>
            );
          },
        },
      ];
    }

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

    return [
      {
        field: "email",
        headerName: t("email"),
        flex: 2,
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      {
        field: "name",
        headerName: t("name"),
        flex: 2,
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },

      { field: "type", headerName: t("type"), flex: 1 },
      { field: "created", headerName: t("created"), flex: 1 },
      statusChip("status"),
      {
        field: "action",
        headerName: t("action"),
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              component={RouterLink}
              to={`/editdocs/${params.row.user_id}/${params.row.file_name}`}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() =>
                handleDelete(params.row.user_id, params.row.file_name)
              }
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ),
      },
    ];
  };

  return (
    <Box sx={{ pt: 2 }}>
      {/* ─── Snackbars ──────────────────────────────────────────── */}
      {successMsg && (
        <CustomNotification
          message={successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}
      {errorMsg && (
        <CustomError errorMessage={errorMsg} onClose={() => setErrorMsg("")} />
      )}

      <EntityTablePage
        basePath="/documents"
        tabs={documentsTabs(t)}
        fetchThunk={fetchDocuments}
        selectSlice={(s: RootState) => s.documents}
        mapRow={mapRow}
        buildColumns={buildColumns}
        buildFetchArg={buildFetchArg}
        getBackendColumns={getBackendColumns}
        getTitle={(tab) => documentsTabs(t).find((x) => x.key === tab)!.label}
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
    </Box>
  );
}
