import {
  Box,
  Button,
  Divider,
  FormControl,
  FormGroup,
  FormLabel,
  Grid,
  MenuItem,
  Paper,
  RadioGroup,
  Select,
  Typography,
  useTheme,
} from "@mui/material";

import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserStatuses,
  saveUserStatuses,
} from "@/redux/slices/userStatusesSlice";
import type { RootState, AppDispatch } from "@/redux/store";

import Flag from "@/components/ui/Flag";
import RadioItem from "@/components/ui/RadioItem";

const RESTRICTED_EMAILS = new Set([
  "info@alphatrust.ai"
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


export default function StatusesPage() {
  const { id: user_id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((s: RootState) => s.userStatuses);
  const theme = useTheme();
  const { t } = useTranslation();

  const restricted = isRestrictedUser();

  const cached = localStorage.getItem("user");
  const admin = cached ? JSON.parse(cached) : null;

  if (!admin?.uid) throw new Error("No admin user in storage");

  // Extract user (from Redux store)
  const user = store.data;

  const [flags, setFlags] = useState({
    test: false,
    archived: false,
    affiliate: false,
    ib: false,
    noneuropean: false,
    approved: false,
    completed: false,
  });
  const [legal, setLegal] = useState<
    "unverified" | "limited" | "dormant" | "verified"
  >("unverified");
  const [risk, setRisk] = useState<"low" | "medium" | "high">("low");
  const [completion, setCompletion] = useState<any>({});
  const [servers, setServers] = useState<string[]>([]);
  const [server, setServer] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user_id)
      dispatch(fetchUserStatuses({ admin_id: admin.uid, user_id: user_id }));
  }, [dispatch, user_id]);

  useEffect(() => {
    if (store.status === "idle" && store.data?.flags) {
      const d = store.data;
      setFlags(d.flags);
      setLegal(d.legal);
      setRisk(d.risk);
      setCompletion(d.completion);
      const list = d.report.servers ?? [];
      setServers(list);
      setServer(d.report.current || list[0] || "");
    }
  }, [store.status, store.data]);

  useEffect(() => {
    if (!server && servers.length) {
      setServer(servers[0]);
    }
  }, [servers, server]);

  const handleSave = async () => {
    try {
      if (!user?.userId) throw new Error("No user loaded");

      const updated = await dispatch(
        saveUserStatuses({
          admin_id: admin.uid,
          id: user.userId,
          flags,
          legal,
          risk,
          completion,
          server,
        })
      ).unwrap();

      const d = updated.data;
      setFlags(d.flags);
      setLegal(d.legal);
      setRisk(d.risk);
      setCompletion(d.completion);
      setServer(d.report.current);
      setServers(d.report.servers ?? []);

      setSuccessMsg(t("statuses_saved"));
      setOpenSuccess(true);
      setTimeout(() => setOpenSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
      setTimeout(() => setOpenError(false), 3000);
    }
  };

  if (!user) return null;

  return (
    <Box component="form" noValidate autoComplete="off">
      {openSuccess && (
        <CustomNotification
          message={successMsg}
          onClose={() => setOpenSuccess(false)}
        />
      )}
      {openError && (
        <CustomError
          errorMessage={errorMsg}
          onClose={() => setOpenError(false)}
        />
      )}

      <Grid container spacing={3}>
        {/* LEFT */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ mt: 1, p: 2 }}>
            <Typography variant="h5">{t("profile_status")}</Typography>

            <FormGroup sx={{ mt: 1 }}>
              <Flag
                label={t("testing_purpose")}
                checked={flags.test}
                onChange={(v) => setFlags({ ...flags, test: v })}
              />
              <Flag
                label={t("profile_archived")}
                checked={flags.archived}
                onChange={(v) => setFlags({ ...flags, archived: v })}
              />
              <Flag
                label={t("affiliate")}
                checked={flags.affiliate}
                onChange={(v) => setFlags({ ...flags, affiliate: v })}
              />
              <Flag
                label={t("introducing_broker")}
                checked={flags.ib}
                onChange={(v) => setFlags({ ...flags, ib: v })}
              />
              {!restricted && (
                <Flag
                  label={t("non_european")}
                  checked={flags.noneuropean}
                  onChange={(v) => setFlags({ ...flags, noneuropean: v })}
                />
              )}
             
              {restricted && (
              <Flag
                label={t("approved")}
                checked={flags.approved}
                onChange={(v) => setFlags({ ...flags, approved: v })}
              />
              )}
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            <FormControl component="fieldset" variant="standard">
              <FormLabel sx={{ fontWeight: 700, mb: 1 }}>
                <Typography variant="h5">{t("legal_status")}</Typography>
              </FormLabel>
              <RadioGroup
                value={legal}
                onChange={(e) => setLegal(e.target.value as any)}
              >
                <RadioItem
                  value="unverified"
                  label={t("unverified")}
                  paletteKey="error"
                />
                <RadioItem
                  value="limited"
                  label={t("limited")}
                  paletteKey="warning"
                />
                <RadioItem
                  value="dormant"
                  label={t("dormant")}
                  paletteKey="error"
                />
                <RadioItem
                  value="verified"
                  label={t("verified")}
                  paletteKey="success"
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        {/* RIGHT */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h5">{t("profile_completion")}</Typography>

            <FormGroup sx={{ mt: 1 }}>
              <Flag
                label={t("all_information_completed")}
                checked={flags.completed}
                onChange={(v) => setFlags({ ...flags, completed: v })}
              />
              <Flag
                label={t("personal_details")}
                checked={completion.personal}
                onChange={(v) => setCompletion({ ...completion, personal: v })}
              />
              <Flag
                label={t("employment_details")}
                checked={completion.employment}
                onChange={(v) =>
                  setCompletion({ ...completion, employment: v })
                }
              />
              <Flag
                label={t("trading_details")}
                checked={completion.trading}
                onChange={(v) => setCompletion({ ...completion, trading: v })}
              />
              <Flag
                label={t("agreements_details")}
                checked={completion.agreements}
                onChange={(v) =>
                  setCompletion({ ...completion, agreements: v })
                }
              />
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            <FormControl component="fieldset" variant="standard">
              <FormLabel sx={{ fontWeight: 700, mb: 1 }}>
                <Typography variant="h5">{t("risk_level")}</Typography>
              </FormLabel>
              <RadioGroup
                value={risk}
                onChange={(e) => setRisk(e.target.value as any)}
              >
                <RadioItem
                  value="low"
                  label={t("risk_low")}
                  paletteKey="success"
                />
                <RadioItem
                  value="medium"
                  label={t("risk_medium")}
                  paletteKey="warning"
                />
                <RadioItem
                  value="high"
                  label={t("risk_high")}
                  paletteKey="error"
                />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 2 }} />
            {!restricted && (
              <FormControl fullWidth size="small">
                <FormLabel sx={{ fontWeight: 700, mb: 0.5 }}>
                  {t("report_server")}
                </FormLabel>
                <Select
                value={server}
                onChange={(e) => setServer(e.target.value as string)}
                displayEmpty
              >
                {servers.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
             )}
          </Paper>
        </Grid>
      </Grid>

      {/* SAVE BUTTON */}
      {/* add a check to only view this paper of the acl is admin */}
      {(admin?.acl?.includes("admin") || admin?.acl?.includes("backoffice")) && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2,
            textAlign: "right",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Button variant="contained" onClick={handleSave}>
            {t("save_changes")}
          </Button>
        </Paper>
      )}
    </Box>
  );
}
