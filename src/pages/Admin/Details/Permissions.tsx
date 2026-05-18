// ────────────────────────────────────────────────────────────
// src/pages/Admin/Details/PermissionsPage.tsx
// ────────────────────────────────────────────────────────────
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  FormGroup,
  RadioGroup,
  Button,
  CircularProgress,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";

import Flag from "@/components/ui/Flag";
import RadioItem from "@/components/ui/RadioItem";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

import {
  fetchUserAccesses,
  saveUserAccesses,
} from "@/redux/slices/userAccessesSlice";

interface Slice {
  status: "idle" | "loading" | "failed";
  data: any;
  error: string | null;
}

export default function PermissionsPage() {
  /* routing / redux */
  const cached = localStorage.getItem("user");
  const admin = cached ? JSON.parse(cached) : null;
  if (!admin?.uid) throw new Error("No admin user in storage");
  const admin_id = admin.uid;
  const { id: user_id } = useParams<{ id: string }>(); //  ← rename for clarity
  const dispatch = useDispatch<AppDispatch>();
  const empty: Slice = { status: "idle", data: {}, error: null };
  const { status, data, error } = useSelector(
    (s: RootState) => s.userAccesses ?? empty //  ← fallback
  );

  /* local mirrors (become controlled inputs) */
  const [tc, setTc] = useState(false); // Trading Central
  const [bo, setBo] = useState(false); // back-office access
  const [acl, setAcl] = useState<string | null>(null);
  const [groups, setGroups] = useState<Record<string, string>>({});

  /* snackbars */
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const theme = useTheme();
  const { t } = useTranslation();

  /* ───── fetch on mount / id change ───── */
  useEffect(() => {
    if (admin_id && user_id) dispatch(fetchUserAccesses({ admin_id, user_id }));
  }, [dispatch, admin_id, user_id]);

  /* ───── push store → local mirrors ───── */
  useEffect(() => {
    if (status === "idle" && data && Object.keys(data).length) {
      setTc(!!data.tradingCentral);
      setBo(!!data.backofficeAccess);
      setAcl(data.acl ?? null);
      setGroups(data.groups ?? {});
    }
  }, [status, data]);

  /* ───── SAVE ───── */
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    try {
      if (!user_id) return;
      setSaving(true);
      await dispatch(
        saveUserAccesses({
          admin_id,
          user_id,
          tradingCentral: tc,
          backofficeAccess: bo,
          acl,
        })
      ).unwrap();
      setOk(t("profile_updated_successfully"));
    } catch (e: any) {
      setErr(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ───── UI ───── */
  return (
    <Paper sx={{ p: 2 }}>
      {ok && <CustomNotification message={ok} onClose={() => setOk("")} />}
      {(err || error) && (
        <CustomError
          errorMessage={err || error || "Error"}
          onClose={() => setErr("")}
        />
      )}

      <Grid container spacing={2}>
        {/* ───────────── SERVICES ───────────── */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              p: 1,
              background: theme.palette.info.main,
              color: theme.palette.info.contrastText,
            }}
          >
            {t("services")}
          </Typography>

          <FormGroup>
            <Flag label={t("trading_central")} checked={tc} onChange={setTc} />
          </FormGroup>
        </Grid>

        {/* ───────────── BACK-OFFICE ───────────── */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              p: 1,
              background: theme.palette.error.main,
              color: theme.palette.info.contrastText,
            }}
          >
            {t("backoffice")}
          </Typography>

          {data.canManage ? (
            <>
              {/* use Flag for the BO switch */}
              <FormGroup sx={{ mb: 2 }}>
                <Flag
                  label={t("has_access_to_backoffice")}
                  checked={bo}
                  onChange={setBo}
                />
              </FormGroup>

              {/* ACL radio set with RadioItem */}
              <RadioGroup
                value={acl ?? ""}
                onChange={(e) => setAcl(e.target.value)}
              >
                {Object.entries(groups).map(([gr, nm]) => (
                  <RadioItem
                    key={gr}
                    value={gr}
                    label={nm}
                    paletteKey="error"
                  />
                ))}
              </RadioGroup>
            </>
          ) : (
            <Typography variant="body2">{t("no_acl_permissions")}</Typography>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ textAlign: "right" }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} /> : undefined}
        >
          {t("save_changes")}
        </Button>
      </Box>
    </Paper>
  );
}
