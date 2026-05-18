// src/pages/Admin/Details/Accounts.tsx
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import EntityNoTabPage from "@/components/ui/EntityNoTabPage";
import {
  fetchDetailedAccounts,
  fetchAccountLimits,
  toggleAccountHidden,
  toggleAccountEu,
  updateAccountLimits,
} from "@/redux/slices/adminDetailsSlice";
import { RootState } from "@/redux/store";
import { GridState } from "@/components/ui/DataTablesMapper";
import { GridColDef } from "@mui/x-data-grid";
import LinkRenderer from "@/components/ui/LinkRenderer";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { useEffect, useState } from "react";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

/* ───────────────── restricted emails ───────────────── */
const RESTRICTED_EMAILS = new Set([
  "info+cy@fxgrow.com",
  "ademetriou+cy@fxgrow.com",
  "nmikati+1@fxgrow.com",
  "mahdim@fxgrow.com",
]);

const isRestrictedUser = (): boolean => {
  try {
    const raw = localStorage.getItem("user");
    const email = (raw ? JSON.parse(raw)?.email : "").toLowerCase();
    return RESTRICTED_EMAILS.has(email);
  } catch {
    return false;
  }
};

/* backend column → index */
const backendCols: Record<string, number> = {
  login: 0,
  type: 1,
  currency: 2,
  accountClass: 3,
  server: 4,
  balance: 5,
  equity: 6,
  credit: 7,
  leverage: 8,
  hidden: 9,
  eu: 10,
};

interface AccountRow {
  id: number;
  login: string;
  type: string;
  currency: string;
  accountClass: string;
  server: string;
  balance: string;
  equity: string;
  credit: string;
  leverage: string;
  hidden: string; // "0" or "1"
  eu: string; // "0" or "1"
}

/* Map raw array → typed row (unchanged) */
const mapRow = (raw: any[], idx: number): AccountRow => ({
  id: idx,
  login: raw[0],
  type: raw[1],
  currency: raw[2],
  accountClass: raw[3],
  server: raw[4],
  balance: raw[5],
  equity: raw[6],
  credit: raw[7],
  leverage: raw[8],
  hidden: raw[9],
  eu: raw[10],
});

export default function AccountsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { limits } = useSelector((s: RootState) => s.adminDetails);

  const { id } = useParams<{ id: string }>();
  const user_id = id!;

  const [liveLimit, setLiveLimit] = useState("");
  const [demoLimit, setDemoLimit] = useState("");

  const [okMsg, setOkMsg] = useState<string | false>(false);
  const [errMsg, setErrMsg] = useState<string | false>(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (limits && Object.keys(limits).length) {
      setLiveLimit(limits["live"] ?? "");
      setDemoLimit(limits["demo"] ?? "");
    }
  }, [limits]);

  useEffect(() => {
    dispatch(
      fetchDetailedAccounts({
        urlPart: "accounts",
        user_id,
        gridState: {
          page: 0,
          pageSize: 10,
          sortModel: [{ field: "login", sort: "asc" }],
          filterValue: "",
          columns: [],
          backendColumns: {},
          draw: 1,
          order: 0,
        },
      })
    );
    dispatch(fetchAccountLimits({ user_id }));
  }, [dispatch, user_id]);

  const onApplyLimits = async () => {
    setSaving(true);
    setOkMsg(false);
    setErrMsg(false);
    try {
      await dispatch(
        updateAccountLimits({
          user_id,
          limits: {
            live: liveLimit,
            demo: demoLimit,
          },
        })
      ).unwrap();
      setOkMsg(t("limits_updated", "Limits updated"));
      dispatch(fetchAccountLimits({ user_id }));
    } catch (e: any) {
      setErrMsg(e?.message || t("save_failed", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  /* Build columns; hide Hidden/EU for restricted users */
  const buildColumns = ({ isMobile }: { isMobile: boolean }): GridColDef[] => {
    const restricted = isRestrictedUser();

    if (isMobile) {
      return [
        {
          field: "login",
          headerName: t("info"),
          flex: 2,
          renderCell: (p) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                <LinkRenderer htmlString={p.row.login} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.row.server}
              </Typography>
            </Box>
          ),
        },
        {
          field: "details",
          headerName: t("details"),
          flex: 1,
          sortable: false,
          renderCell: (p) => (
            <Box display="flex" flexDirection="column">
              <Typography variant="body2">
                {p.row.balance} {p.row.currency}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {p.row.type}
              </Typography>
            </Box>
          ),
        },
      ];
    }

    const cols: GridColDef[] = [
      {
        field: "login",
        headerName: t("login"),
        flex: 1,
        renderCell: (p) => <LinkRenderer htmlString={p.value} />,
      },
      { field: "type", headerName: t("type"), flex: 1 },
      { field: "currency", headerName: t("currency"), flex: 1 },
      { field: "accountClass", headerName: t("class"), flex: 1 },
      { field: "server", headerName: t("server"), flex: 1 },
      { field: "balance", headerName: t("balance"), flex: 1 },
      { field: "equity", headerName: t("equity"), flex: 1 },
      { field: "credit", headerName: t("credit"), flex: 1 },
      { field: "leverage", headerName: t("leverage"), flex: 1 },
    ];

    if (!restricted) {
      cols.push(
        {
          field: "hidden",
          headerName: t("hidden"),
          flex: 0.5,
          sortable: false,
          renderCell: (params) => {
            const checked = params.row.hidden === "1";
            return (
              <Checkbox
                checked={checked}
                onChange={(e) =>
                  dispatch(
                    toggleAccountHidden({
                      user_id,
                      login: params.row.login,
                      type: params.row.type,
                      hidden: e.target.checked,
                    })
                  )
                }
                size="small"
              />
            );
          },
        },
        {
          field: "eu",
          headerName: t("eu"),
          flex: 0.5,
          sortable: false,
          renderCell: (params) => {
            const checked = params.row.eu === "1";
            return (
              <Checkbox
                checked={checked}
                onChange={(e) =>
                  dispatch(
                    toggleAccountEu({
                      user_id,
                      login: params.row.login,
                      type: params.row.type,
                      eu: e.target.checked,
                    })
                  )
                }
                size="small"
              />
            );
          },
        }
      );
    }

    return cols;
  };

  return (
    <>
      {/* snackbars */}
      {okMsg && (
        <CustomNotification message={okMsg} onClose={() => setOkMsg(false)} />
      )}
      {errMsg && (
        <CustomError errorMessage={errMsg} onClose={() => setErrMsg(false)} />
      )}

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onApplyLimits();
        }}
        mt={2}
        ml={2}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 1,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel htmlFor="live-limit">
            {t("live_accounts_limit")}
          </InputLabel>
          <OutlinedInput
            id="live-limit"
            label={t("live_accounts_limit")}
            value={liveLimit}
            onChange={(e) => setLiveLimit(e.target.value)}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel htmlFor="demo-limit">
            {t("demo_accounts_limit")}
          </InputLabel>
          <OutlinedInput
            id="demo-limit"
            label={t("demo_accounts_limit")}
            value={demoLimit}
            onChange={(e) => setDemoLimit(e.target.value)}
          />
        </FormControl>

        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? t("saving", "Saving…") : t("apply")}
        </Button>

        <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />

        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => navigate(`/detailed/create_account/${user_id}`)}
          sx={{
            mr: { xs: 0, sm: 2 },
            alignSelf: { xs: "stretch", sm: "center" },
          }}
        >
          {t("create_live_account")}
        </Button>
      </Box>

      <EntityNoTabPage<
        { urlPart: string; gridState: GridState; user_id: string },
        any[],
        AccountRow
      >
        fetchThunk={fetchDetailedAccounts}
        selectSlice={(s: RootState) => s.adminDetails}
        mapRow={mapRow}
        buildColumns={buildColumns}
        getBackendColumns={() => backendCols}
        buildFetchArg={({ grid }: { grid: GridState }) => ({
          urlPart: "accounts",
          user_id,
          gridState: grid,
        })}
        title={t("accounts")}
        initialGrid={{
          page: 0,
          pageSize: 10,
          sortModel: [{ field: "login", sort: "asc" }],
          filterValue: "",
          columns: [],
          backendColumns: {},
          draw: 1,
          order: backendCols.login,
        }}
      />
    </>
  );
}
