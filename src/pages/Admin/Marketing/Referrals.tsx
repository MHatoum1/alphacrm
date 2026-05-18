/*  src/pages/Admin/Marketing/Referrals.tsx  */
import { Box, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

import EntityNoTabPage from "@/components/ui/EntityNoTabPage";
import type { RootState } from "@/redux/store";
import { GridColDef } from "@mui/x-data-grid";
import { fetchReferralStats } from "@/redux/slices/adminReferralsSlice";
import { GridState } from "@/components/ui/DataTablesMapper";

/* ───────── backend → column index map ───────────────────── */
const backendCols = {
  email: 0, // <-- was emailHtml
  name: 1,
  registered: 2,
};

/* ───────── helper: strip & parse <a …>email</a> ─────────── */
const parseAnchor = (html: string) => {
  const m = html.match(/href="([^"]+)".*?>([^<]+)</i);
  if (!m) return { link: "", email: html, id: Date.now() };
  const link = m[1];
  const email = m[2];
  const idM = link.match(/\/(\d+)(?:$|")/); // …/12345
  return { link, email, id: idM ? Number(idM[1]) : Date.now() };
};

/* ───────── array-row → object mapper (adds unique id) ───── */
const mapRow = (raw: any[]) => {
  const { link, email, id } = parseAnchor(raw[backendCols.email] ?? "");

  return {
    id, // 🔑 REQUIRED by MUI-X
    userLink: link,
    email,
    name: String(raw[backendCols.name] ?? "").trim(),
    registered: Number(raw[backendCols.registered] ?? 0),
  };
};

export default function ReferralsPage() {
  const { t } = useTranslation();

  /* ───────── column factory (mobile + desktop) ────────────── */
  const makeColumns =
    (): ((opts: { isMobile: boolean; theme: any }) => GridColDef[]) =>
    ({ isMobile }) => {
      if (isMobile) {
        return [
          {
            field: "email",
            headerName: t("info"),
            flex: 2,
            renderCell: (params) => (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  <Link
                    href={params.row.userLink}
                    underline="hover"
                    target="_blank"
                  >
                    {params.row.email}
                  </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {params.row.name}
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
                <Typography variant="body2" fontWeight="bold">
                  {params.row.registered}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {params.row.registered > 1
                    ? t("registered_users")
                    : t("registered_user")}
                </Typography>
              </Box>
            ),
          },
        ];
      }
      return [
        {
          field: "email",
          headerName: t("email"),
          flex: 2,
          renderCell: (p) => (
            <Link href={p.row.userLink} underline="hover" target="_blank">
              {p.value}
            </Link>
          ),
        },
        { field: "name", headerName: t("name"), flex: 2, sortable: false },
        {
          field: "registered",
          headerName: t("number_registered"),
          flex: 1,
          sortable: false,
        },
      ];
    };

  const buildColumns = useMemo(makeColumns, []);

  return (
    <EntityNoTabPage<
      GridState, // thunk arg
      any[], // raw backend row
      ReturnType<typeof mapRow>
    >
      PaperProps={{ sx: { p: 0, boxShadow: "none" } }}
      fetchThunk={fetchReferralStats}
      selectSlice={(s: RootState) => s.referrals}
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      buildFetchArg={({ grid }) => grid}
      title={t("refer_a_friend_stats")}
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "email", sort: "asc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: 0,
      }}
    />
  );
}
