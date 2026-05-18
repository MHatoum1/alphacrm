// src/pages/Admin/ProfilesReview/tabs/ClientTradingTab.tsx
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Checkbox,
  FormGroup,
  Button,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { Controller, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks";
import { Profile } from "@/redux/slices/adminProfileReviewSlice";
import type { RootState } from "@/redux/store";
import { useEffect, useMemo, useState } from "react";
import appearance from "@/assets/constants/appearance.json";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";
import { updateClientProfile } from "@/redux/slices/clientProfileSlice";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

/* ───────────────── helpers ───────────────────────────── */
const opts = <K extends keyof typeof appearance>(k: K): [string, string][] => {
  // pull all entries out
  const entries = Object.entries(appearance[k] as Record<string, string>);
  // find & remove any existing empty‐key placeholder
  const emptyEntry = entries.find(([key]) => key === "");
  const others = entries.filter(([key]) => key !== "");
  // take the JSON label if present, otherwise fall back
  const emptyLabel = emptyEntry?.[1] ?? "Please Select";
  // always put it first
  return [["", emptyLabel], ...others];
};

const averageVolumeOpts = opts("average_volume");
const cfdsRiskOpts = opts("cfds_risk");
const investmentLengthOpts = opts("investment_length");
const regularFinancialOpts = opts("regular_financial");
const tradingPurposeOpts = opts("main_trading_purpose");
const marginTestOpts = opts("margin_test_list");
const highLevTestOpts = opts("high_lev_test_list");
const actionsTestOpts = opts("actions_test_list");
const forexCfdTestOpts = opts("forex_cfd_test_list");
const tradingExperienceOpts = opts("trading_experience");

function RenderSelect<T extends string>(
  t: (k: string) => string,
  control: any,
  name: T,
  items: [string, string][],
  required = false
) {
  const labelId = `${name}-label`;
  const label = t(name);

  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: true } : undefined}
      render={({ field, fieldState }) => (
        <FormControl fullWidth size="small" error={!!fieldState.error}>
          <InputLabel id={labelId} shrink>
            {label}
          </InputLabel>
          <Select
            {...field}
            labelId={labelId}
            label={label}
            displayEmpty
            renderValue={(val) =>
               val && t(name + "." + val) ? (
                  t(name + "." + val)
                ) : (
                <em style={{ color: "#888" }}>{t("choose")}</em>
              )
            }
          >
            {items.map(([v]) => (
                <MenuItem key={v} value={v}>
                   {v!="" ? t(name + "." + v) : t("choose")}
                </MenuItem>
              ))}
          </Select>
          {fieldState.error && (
            <Typography
              variant="caption"
              color="error"
              sx={{ ml: 2, mt: 0.5, display: "block" }}
            >
              {t("required")}
            </Typography>
          )}
        </FormControl>
      )}
    />
  );
}

interface TradingForm {
  experience: "1" | "0" | ""; // yes/no
  trading_experience: string;
  average_volume: string;
  no_exp: string[]; // checkbox array
  nature_of_risk: "1" | "0" | ""; // yes/no
  cfds_risk: string;
  investment_length: string;
  regular_financial: string;
  main_trading_purpose: string;
  margin_test: string;
  high_lev_test: string;
  actions_test: string;
  forex_cfd_test: string;
}

export default function ClientTradingTab() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const authUser = useSelector((s: RootState) => s.auth.user);
  const dispatch = useAppDispatch();
  const raw = useSelector(
    (s: RootState) => s.clientProfile.data
  ) as Partial<Profile>;
  const navigate = useNavigate();

  const { reloadProfile } = useOutletContext<{ reloadProfile: () => void }>();

  /* ─── toasts ─── */
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* ─── warning dialog ─── */
  const [warnOpen, setWarnOpen] = useState(false);
  const [pendingVals, setPendingVals] = useState<TradingForm | null>(null);

  /* ─── defaults ─── */
  const defaults = useMemo<TradingForm>(
    () => ({
      experience: raw.experience ?? "",
      trading_experience: raw.trading_experience ?? "",
      average_volume: raw.average_volume ?? "",
      no_exp: (raw.no_exp as string[]) ?? [],
      nature_of_risk: raw.nature_of_risk ?? "",
      cfds_risk: raw.cfds_risk ?? "",
      investment_length: raw.investment_length ?? "",
      regular_financial: raw.regular_financial ?? "",
      main_trading_purpose: raw.main_trading_purpose ?? "",
      margin_test: raw.margin_test ?? "",
      high_lev_test: raw.high_lev_test ?? "",
      actions_test: raw.actions_test ?? "",
      forex_cfd_test: raw.forex_cfd_test ?? "",
    }),
    [raw]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TradingForm>({ defaultValues: defaults, mode: "onChange" });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  /* ─── watch experience with defaultValue ─── */
  const exp = useWatch({
    control,
    name: "experience",
    defaultValue: defaults.experience,
  });

  /* ─── save logic ─── */
  const doSave = async (vals: TradingForm) => {
    if (!authUser?.userID) return;
    try {
      await dispatch(
        updateClientProfile({
          user_id: authUser.userID,
          section: "trading",
          fields: vals,
        })
      ).unwrap();
      setSuccessMsg(t("trading_saved"));
      setOpenSuccess(true);
      reloadProfile(); // ✅ ensure ClientMenu gets fresh profile

      const next = authUser?.affiliate
        ? "/userprofile"
        : "/userprofile/documents";
      setTimeout(() => navigate(next, { replace: true }), 1000);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
    }
  };

  /* ─── onSubmit with warning ─── */
  const onSubmit = (vals: TradingForm) => {
    const failsKnowledge =
      vals.margin_test !== "1000" ||
      vals.actions_test !== "stoploss" ||
      vals.high_lev_test !== "largest" ||
      vals.forex_cfd_test === "non_risky" ||
      vals.experience === "0" ||
      vals.nature_of_risk === "0";

    if (failsKnowledge) {
      setPendingVals(vals);
      setWarnOpen(true);
    } else {
      doSave(vals);
    }
  };

  const handleAcceptWarning = async () => {
    if (!pendingVals) return;
    setWarnOpen(false);
    await doSave(pendingVals);
    setPendingVals(null);
  };

  /* ─── no_exp checkboxes ─── */
  const renderNoExpCheckboxes = ({ fieldState }: any) => {
    const checks: [string, string][] = [
      ["professional_qualification", t("no_exp_professional_qualification")],
      ["worked", t("no_exp_worked")],
      ["monitor", t("no_exp_monitor")],
      ["all", t("no_exp_all")],
    ];
    return (
      <>
        <Controller
          name="no_exp"
          control={control}
          render={({ field }) => (
            <FormGroup>
              {checks.map(([v, label]) => (
                <FormControlLabel
                  key={v}
                  control={
                    <Checkbox
                      checked={field.value?.includes(v)}
                      onChange={(_, checked) => {
                        const set = new Set(field.value || []);
                        checked ? set.add(v) : set.delete(v);
                        field.onChange(Array.from(set));
                      }}
                    />
                  }
                  label={label}
                />
              ))}
            </FormGroup>
          )}
        />
        {fieldState.error && (
          <Typography variant="caption" color="error">
            {fieldState.error.message as string}
          </Typography>
        )}
      </>
    );
  };

  return (
    <Box>
      {/* Success & error toasts */}
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

      {/* Knowledge / risk warning dialog */}
      <Dialog
        open={warnOpen}
        onClose={() => setWarnOpen(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ bgcolor: "#3887BE", color: "#fff" }}>
          {t("warning")}
        </DialogTitle>
        <DialogContent dividers>
          <div
            className="scroll"
            dangerouslySetInnerHTML={{ __html: t("trading_warning_html") }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleAcceptWarning}
          >
            {t("accept")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main form */}
      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          {isMobile ? t("trading_short") : t("trading_tab_title")}
        </Typography>

        <Grid container rowSpacing={2} columnSpacing={4}>
          {/* 1️⃣ Experience yes/no */}
          <Grid item xs={12}>
            <FormLabel required>{t("experience")}</FormLabel>
            <Controller
              name="experience"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <RadioGroup
                  row
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <FormControlLabel
                    value="1"
                    control={<Radio />}
                    label={t("yes")}
                  />
                  <FormControlLabel
                    value="0"
                    control={<Radio />}
                    label={t("no")}
                  />
                </RadioGroup>
              )}
            />
          </Grid>

          {/* 1a ✅ If YES */}
          {exp == "1" && (
            <>
              <Grid item xs={12} md={6}>
                {RenderSelect(
                  t,
                  control,
                  "trading_experience",
                  tradingExperienceOpts,
                  true
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {RenderSelect(
                  t,
                  control,
                  "average_volume",
                  averageVolumeOpts,
                  true
                )}
              </Grid>
            </>
          )}

          {/* 1b 🚫 If NO */}
          {exp == "0" && (
            <Grid item xs={12}>
              <FormLabel>{t("experience_no_exp")}</FormLabel>
              <Controller
                name="no_exp"
                control={control}
                rules={{
                  validate: (arr) =>
                    exp === "0" ? (arr.length ? true : t("required")) : true,
                }}
                render={renderNoExpCheckboxes}
              />
            </Grid>
          )}

          {/* 2️⃣ Nature of risk */}
          <Grid item xs={12}>
            <FormLabel required>{t("nature_of_risk")}</FormLabel>
            <Controller
              name="nature_of_risk"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <RadioGroup
                  row
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <FormControlLabel
                    value="1"
                    control={<Radio />}
                    label={t("yes")}
                  />
                  <FormControlLabel
                    value="0"
                    control={<Radio />}
                    label={t("no")}
                  />
                </RadioGroup>
              )}
            />
          </Grid>

          {/* 3️⃣ Suitability selects */}
          <Grid item xs={12} md={6}>
            {RenderSelect(t, control, "cfds_risk", cfdsRiskOpts, true)}
          </Grid>
          <Grid item xs={12} md={6}>
            {RenderSelect(
              t,
              control,
              "investment_length",
              investmentLengthOpts,
              true
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {RenderSelect(
              t,
              control,
              "regular_financial",
              regularFinancialOpts,
              true
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {RenderSelect(
              t,
              control,
              "main_trading_purpose",
              tradingPurposeOpts,
              true
            )}
          </Grid>

          {/* 4️⃣ Knowledge tests */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              {t("knowledge")}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            {RenderSelect(t, control, "margin_test", marginTestOpts, true)}
          </Grid>
          <Grid item xs={12} md={6}>
            {RenderSelect(t, control, "high_lev_test", highLevTestOpts, true)}
          </Grid>
          <Grid item xs={12} md={6}>
            {RenderSelect(t, control, "actions_test", actionsTestOpts, true)}
          </Grid>
          <Grid item xs={12} md={6}>
            {RenderSelect(t, control, "forex_cfd_test", forexCfdTestOpts, true)}
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "start", mt: 4 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t("save")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
