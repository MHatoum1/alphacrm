// src/pages/Cards.tsx
import { GridColDef } from "@mui/x-data-grid";
import EntityTablePage from "@/components/ui/EntityTablePage";
import { fetchCards } from "@/redux/slices/adminTransactionsSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import { useTranslation } from "react-i18next";
import LinkRenderer from "@/components/ui/LinkRenderer";
import { Box, Typography } from "@mui/material";
import { defineTabs } from "@/utils/defineTabs";

/* ───────────────────────────── tabs ───────────────────────────── */

type TabKey = "all_cards" | "new" | "approved" | "declined";

const cardsTabs = (t: any) =>
  defineTabs<TabKey>([
    {
      key: "all_cards",
      label: t("all_cards"),
      path: "/transactions/all_cards",
    },
    { key: "new", label: t("new"), path: "/cards/new" },
    { key: "approved", label: t("approved"), path: "/cards/approved" },
    { key: "declined", label: t("declined"), path: "/cards/declined" },
  ]);

/* ──────────────── raw array ‑→ row object mapper ─────────────── */

const mapRow = (r: any[], idx: number): Record<string, any> => ({
  id: idx, // ← every row now has a unique id
  title: r[0],
  payment_provider: r[1],
  created: r[2],
  valid: r[3],
  disabled: r[4],
  status: r[5],
  profile: r[6],
});

/* ───────────────────── backend column map ────────────────────── */

const backendCols: Record<string, number> = {
  title: 0,
  payment_provider: 1,
  created: 2,
  valid: 3,
  disabled: 4,
  status: 5,
  profile: 6,
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

export default function cardsPage() {
  const { t } = useTranslation();

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
          field: "title",
          headerName: t("info"),
          flex: 2,
          renderCell: (params) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                <LinkRenderer
                  htmlString={params.row.title}
                  openInNewTab={false}
                />
                ,
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <LinkRenderer
                  htmlString={params.row.profile}
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
            const processedText = (
              temp.textContent ||
              temp.innerText ||
              ""
            ).toUpperCase();
            const processedTextStyle = processedText
              .toLowerCase()
              .replace(/\s+/g, "_");
            const backgroundColor =
              theme.palette.status[processedTextStyle]?.bg ||
              theme.palette.status.default.bg;
            const textColor =
              theme.palette.status[processedTextStyle]?.color ||
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
                      {processedText}
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
      ];
    }

    const statusChip = (
      field: "status" | "valid" | "disabled"
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
        field: "title",
        headerName: t("title"),
        flex: 2,
        renderCell: (p) => (
          <LinkRenderer htmlString={p.value} openInNewTab={false} />
        ),
      },
      { field: "payment_provider", headerName: t("payment_provider"), flex: 1 },
      { field: "created", headerName: t("created"), flex: 1 },

      statusChip("valid"),
      statusChip("disabled"),
      statusChip("status"),
      {
        field: "profile",
        headerName: t("profile"),
        flex: 2,
        renderCell: (p) => (
          <LinkRenderer htmlString={p.value} openInNewTab={false} />
        ),
      },
    ];
  };

  return (
    <EntityTablePage
      basePath="/transactions"
      tabs={cardsTabs(t)}
      fetchThunk={fetchCards}
      selectSlice={(s: RootState) => s.transactions}
      mapRow={(raw, i) => mapRow(raw, i)}
      buildColumns={buildColumns}
      buildFetchArg={buildFetchArg}
      getBackendColumns={getBackendColumns}
      getTitle={(tab) => cardsTabs(t).find((x) => x.key === tab)!.label}
      /* optional: override initial sort */
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "created", sort: "desc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: 2,
      }}
    />
  );
}
