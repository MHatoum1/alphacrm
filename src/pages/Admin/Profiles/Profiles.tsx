// src/pages/Profiles.tsx
import { GridColDef } from "@mui/x-data-grid";
import LinkRenderer from "@/components/ui/LinkRenderer";
import EntityTableProfilePage from "@/components/ui/EntityTableProfilePage";
import { fetchProfiles } from "@/redux/slices/adminProfilesSlice";
import { RootState } from "@/redux/store";
import { useTranslation } from "react-i18next";
import { GridState } from "@/components/ui/DataTablesMapper";
import { Outlet, useMatch, useOutlet } from "react-router-dom";
import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { profilesTabs, ProfilesTabKey } from "@/pages/Admin/Profiles/config";
import { useSelector } from "react-redux"; // ⬅️ add

// restricted emails (same list you use elsewhere)
const RESTRICTED_EMAILS = new Set([
  "info+cy@fxgrow.com",
  "ademetriou+cy@fxgrow.com",
  "nmikati+1@fxgrow.com",
  "mahdim@fxgrow.com",
]);

const isRestricted = () => {
  try {
    const raw = localStorage.getItem("user");
    const email = (raw ? JSON.parse(raw)?.email : "").toLowerCase();
    return RESTRICTED_EMAILS.has(email);
  } catch {
    return false;
  }
};

export const mapRow = (row: any[], idx: number, tab: ProfilesTabKey) => {
  const restricted = isRestricted();

  // ✅ base differs for restricted vs. normal
  const base = restricted
    ? {
        id: idx,
        email: row[0],
        name: row[1],
        phone: row[2],
        country: row[3],
        created: row[4],
      }
    : {
        id: idx,
        email: row[0],
        name: row[1],
        phone: row[2],
        country: row[3],
        sales: row[4],
        created: row[5],
      };

  if (tab === "nonactivated") {
    // keep activationCode + status; hide campaign/partnership for restricted
    return restricted
      ? {
          ...base,
          activationCode: row[5],
          status: row[6],
          accounts: row[7],
        }
      : {
          ...base,
          activationCode: row[6],
          status: row[7],
          campaign: row[8],
          partnership: row[9],
          accounts: row[10],
        };
  }

  // other tabs: keep status; hide campaign/partnership for restricted
  return restricted
    ? {
        ...base,
        status: row[5],
        accounts: row[8],
      }
    : {
        ...base,
        status: row[6],
        campaign: row[7],
        partnership: row[8],
        accounts: row[9],
      };
};

// 4️⃣ build argument for the thunk
const buildFetchArg = ({
  urlPart,
  searchParams,
  grid,
}: {
  urlPart: string;
  searchParams: URLSearchParams;
  grid: GridState;
}) => ({
  urlPart,
  campaign: searchParams.get("campaign") || "",
  gridState: grid,
});
const getBackendColumns = (tab: ProfilesTabKey): Record<string, number> => {
  const base = {
    email: 0,
    name: 1,
    country: 2,
    created: 3,
    status: 4,
    campaign: 5,
    partnership: 6,
    phone: 7,
    sales: 8,
  };
  return tab === "nonactivated"
    ? { ...base, activationCode: 9, accounts: 10 }
    : base;
};

const stripHtml = (html: string) => html?.replace(/<[^>]+>/g, "") || "";
const shortenDate = (s: string) => (s ? s.slice(0, 10) : ""); // e.g. "2025-08-31"

export default function ProfilesPage() {
  const child = useOutlet();

  if (child) {
    return <Paper sx={{ p: 3 }}>{child}</Paper>;
  }

  const { t } = useTranslation();

  // 🔐 who is logged in?
  const user = useSelector((s: RootState) => s.auth.user);
  let adminEmail = (user?.email || "").toLowerCase();
  if (!adminEmail) {
    try {
      const raw = localStorage.getItem("user");
      if (raw) adminEmail = (JSON.parse(raw)?.email || "").toLowerCase();
    } catch {}
  }

  const hideOptionalCols = RESTRICTED_EMAILS.has(adminEmail);

  const truncate = (s: string, n = 5) =>
    s ? (s.length > n ? `${s.slice(0, n)}…` : s) : "";

  // 2️⃣ columns builder (mobile vs desktop)
  const buildColumns = ({
    activeTab,
    isMobile,
    theme,
  }: {
    activeTab: ProfilesTabKey;
    isMobile: boolean;
    theme: any;
  }): GridColDef[] => {
    if (isMobile) {
      return [
        {
          field: "email",
          headerName: t("info"),
          flex: 2,
          sortable: true,
          renderCell: (params) => (
            <Box sx={{ minWidth: 0, width: "100%" }}>
              <Typography variant="body1" fontWeight="bold" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                <LinkRenderer htmlString={params.row.email} />
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {params.row.name}
              </Typography>
            </Box>
          ),
        },
        {
          field: "details",
          headerName: t("details"),
          flex: 1.5,
          sortable: false,
          renderCell: (params) => {
            const rawStatus = stripHtml(params.row.status);
            const statusKey = rawStatus.toLowerCase().replace(/\s+/g, "_");
            const backgroundColor =
              theme.palette.status[statusKey]?.bg || theme.palette.status.default.bg;
            const textColor =
              theme.palette.status[statusKey]?.color || theme.palette.status.default.color;

            return (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  width: "100%",
                  minWidth: 0, // allow children to shrink/ellipsis
                }}
              >
                {/* Status chip */}
                <Box
                  sx={{
                    backgroundColor,
                    color: textColor,
                    borderRadius: "9999px",
                    px: 1,
                    py: 0.5,
                    maxWidth: "100%",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                      lineHeight: 1.2,
                    }}
                  >
                    {rawStatus}
                  </Typography>
                </Box>

                {/* Created date */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    maxWidth: "100%",
                    minWidth: 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    display: "block",
                  }}
                  title={params.row.created}
                >
                  {shortenDate(params.row.created)}
                </Typography>
              </Box>
            );
          },
        },
      ];
    }


    // desktop: build a base and conditionally add Sales/Campaign/Partnership
    const cols: GridColDef[] = [
      {
        field: "email",
        headerName: t("email"),
        flex: 2,
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      { field: "name", headerName: t("name"), flex: 2 },
      { field: "phone", headerName: t("phone"), flex: 1 },
      { field: "country", headerName: t("country"), flex: 1 },
    ];

    if (!hideOptionalCols) {
      cols.push({ field: "sales", headerName: t("sales"), flex: 1 });
    }

    cols.push({ field: "created", headerName: t("created"), flex: 1 });

    if (activeTab === "nonactivated") {
      cols.push({
        field: "activationCode",
        headerName: t("activation_code"),
        flex: 2,
        renderCell: (p) => <div>{p.value}</div>,
        sortable: false,
      });
    }

    cols.push({
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
    });

    if (!hideOptionalCols) {
      cols.push(
        {
          field: "campaign",
          headerName: t("campaign"),
          flex: 1,
          renderCell: (params) => <LinkRenderer htmlString={params.value} />,
        },
        {
          field: "partnership",
          headerName: t("partnership"),
          flex: 2,
          renderCell: (params) => <LinkRenderer htmlString={params.value} />,
        },
        {
          field: "accounts",
          headerName: t("accounts"),
          flex: 1,
          sortable: false,
          renderCell: (params) => {
            const full = typeof params.value === "string" ? params.value : "";
            const short = truncate(full, 5);
            return (
              <Tooltip title={full} arrow disableInteractive>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {short}
                </Typography>
              </Tooltip>
            );
          },
        }
      );
    }

    return cols;
  };

  // detect whether we're on the `/profiles/detailed/personal/:id` path
  const isDetail = useMatch("/profiles/detailed/personal/:id");
  const isCreate = useMatch("/profiles/create");

  if (isDetail || isCreate) {
    return <Outlet />;
  }

  return (
    <EntityTableProfilePage
      basePath="/profiles"
      tabs={profilesTabs(t)}
      fetchThunk={fetchProfiles}
      selectSlice={(s: RootState) => s.profiles}
      mapRow={mapRow}
      buildColumns={buildColumns}
      buildFetchArg={buildFetchArg}
      getBackendColumns={getBackendColumns}
      getTitle={(tab) => profilesTabs(t).find((t2) => t2.key === tab)!.label}
    />
  );
}
