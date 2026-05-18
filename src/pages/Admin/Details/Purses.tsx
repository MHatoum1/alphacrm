import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import EntityNoTabPage from "@/components/ui/EntityNoTabPage";
import { fetchDetailedPurses } from "@/redux/slices/adminDetailsSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import { GridColDef } from "@mui/x-data-grid";
import LinkRenderer from "@/components/ui/LinkRenderer";
import { Box, Typography } from "@mui/material";

// 1) Backend column → index
const backendCols: Record<string, number> = {
  title: 0,
  payment_provider: 1,
  valid: 2,
  disabled: 3,
  status: 4,
};

// 2) Row type
interface PursesRow {
  id: number; // for DataGrid
  title: string;
  payment_provider: string;
  valid: string;
  disabled: string;
  status: string;
}

// 3) Map raw array → typed row (idx = unique id)
const mapRow = (raw: any[], idx: number): PursesRow => ({
  id: idx,
  title: raw[0],
  payment_provider: raw[1],
  valid: raw[2],
  disabled: raw[3],
  status: raw[4],
});

// 5) The page component
export default function PursesPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const user_id = id!;

  // 4) Build columns
  const buildColumns = ({
    isMobile,
    theme,
  }: {
    isMobile: boolean;
    theme: any;
  }): GridColDef[] => {
    if (isMobile) {
      return [
        {
          field: "title",
          headerName: t("info"),
          flex: 2,
          renderCell: (p) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                <LinkRenderer htmlString={p.row.title} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.row.payment_provider}
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
                </Box>
              </Box>
            );
          },
        },
      ];
    }

    // render status with colored chip like in Transactions

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
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      { field: "payment_provider", headerName: t("payment_provider"), flex: 1 },
      statusChip("valid"),
      statusChip("disabled"),
      statusChip("status"),
    ];
  };

  return (
    <EntityNoTabPage<
      { urlPart: string; gridState: GridState; user_id: string },
      any[],
      PursesRow
    >
      fetchThunk={fetchDetailedPurses}
      selectSlice={(s: RootState) => s.adminDetails}
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      buildFetchArg={({ grid }: { grid: GridState }) => ({
        urlPart: "purses",
        user_id,
        gridState: grid,
      })}
      title={t("purses")}
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "created", sort: "desc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: backendCols.created,
      }}
    />
  );
}
