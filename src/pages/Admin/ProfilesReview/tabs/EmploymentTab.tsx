// src/pages/Admin/ProfilesReview/tabs/EmploymentTab.tsx
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Autocomplete,
  FormControl,
  InputLabel,
  FormHelperText,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Popover,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks";
import { updateProfile, Profile } from "@/redux/slices/adminProfileReviewSlice";
import type { RootState } from "@/redux/store";
import { useEffect, useMemo, useState } from "react";
import appearance from "@/assets/constants/appearance.json";
import { countriesList } from "@/assets/constants/countryCodes";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { Trans, useTranslation } from "react-i18next";

/* ── select helpers ───────────────────────────────────────────────── */
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

const empStatus = opts("employment_status");
const sectorsOfActivity = opts("sector_of_activity");
const educations = opts("education");
const annualIncomeOpts = opts("annual_income");
const netWorthOpts = opts("net_worth");
let moneySourceOpts: [string, string][];
const sourceOfIncomeOpts = opts("source_of_income");
const reasonToOpenOpts = opts("reason_to_open");
const anticipationOpts = opts("anticipated");

/* ── RHF model ─────────────────────────────────────────────────────── */
interface EmploymentForm {
  employment_status: string;
  sector_of_activity: string;
  education: string;
  annual_income: string;
  annual_income_value: string;
  net_worth: string;
  net_worth_value: string;
  employer_name: string;
  profession: string;
  country_incorporation: string;
  business_address: string;
  income_outgoing_source: string;
  bank_account_number: string;
  bank_iban: string;
  bank_swift: string;
  bank_address: string;
  source_of_income: string;
  reason_to_open: string;
  anticipated: string;
  anticipated_value: string;
  tax_residence_country: string;
  tax_identification_number: string;
  fatca: string;
  politically_exposed: string;
}

export default function EmploymentTab() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const raw = useSelector(
    (s: RootState) => s.profileReview.data
  ) as Partial<Profile>;

  var noneuropean = raw.noneuropean ?? false;

  if (noneuropean) {
  // Non-EU: only USDT
   moneySourceOpts = opts("income_outgoing_source").filter(
    ([key]) => key === "" || key === "usdt"
  );
} else {
  // EU: Neteller, Skrill, Banktransfer
  moneySourceOpts = opts("income_outgoing_source").filter(
    ([key]) => key === "" || key === "neteller" || key === "skrill" || key === "banktransfer"
  );
}
  
  // somewhere above your component
  // inside EmploymentTab (or above it)…
  const UnderlinedPEP: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    return (
      <>
        <Box
          component="span"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "inline-block",
            textDecoration: "underline",
            fontStyle: "italic",
            cursor: "help",
          }}
        >
          {children}
        </Box>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          disableScrollLock
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            sx: {
              p: 1,
              maxWidth: 350,
              fontSize: "0.75rem",
              lineHeight: 1.4,
              bgcolor: theme.palette.grey[700], // ← dark gray
              color: theme.palette.common.white, // ← white text
              borderRadius: theme.shape.borderRadius, // ← same rounding as Tooltip
            },
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: t("pep_tooltip") }} />
        </Popover>
      </>
    );
  };

  // Snackbars
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* ── defaults ───────────────────────────────────────────────────── */
  const defaults = useMemo<EmploymentForm>(
    () => ({
      employment_status: raw.employment_status ?? "",
      sector_of_activity: raw.sector_of_activity ?? "",
      education: raw.education ?? "",
      annual_income: raw.annual_income ?? "",
      annual_income_value: raw.annual_income_value ?? "",
      net_worth: raw.net_worth ?? "",
      net_worth_value: raw.net_worth_value ?? "",
      employer_name: raw.employer_name ?? "",
      profession: raw.profession ?? "",
      country_incorporation: raw.country_incorporation ?? "",
      business_address: raw.business_address ?? "",
      income_outgoing_source: raw.income_outgoing_source ?? "",
      bank_account_number: raw.bank_account_number ?? "",
      bank_iban: raw.bank_iban ?? "",
      bank_swift: raw.bank_swift ?? "",
      bank_address: raw.bank_address ?? "",
      source_of_income: raw.source_of_income ?? "",
      reason_to_open: raw.reason_to_open ?? "",
      anticipated: raw.anticipated ?? "",
      anticipated_value: raw.anticipated_value ?? "",
      tax_residence_country: raw.tax_residence_country ?? "",
      tax_identification_number: raw.tax_identification_number ?? "",
      fatca: raw.fatca ?? "",
      politically_exposed: raw.politically_exposed ?? "",
    }),
    [raw]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EmploymentForm>({ defaultValues: defaults });
  useEffect(() => reset(defaults), [defaults, reset]);

  /* ── watched for conditionals ───────────────────────────────────── */
  const wStatus = useWatch({ control, name: "employment_status" });
  const wNetWorth = useWatch({ control, name: "net_worth" });
  const wAnnualIncome = useWatch({ control, name: "annual_income" });
  const wAnticipated = useWatch({ control, name: "anticipated" });
  const wMoneySrc = useWatch({ control, name: "income_outgoing_source" });

  const showEmpDetails = [
    "employed",
    "self-employed",
    "businessowner",
  ].includes(wStatus);
  const showWorthInput = wNetWorth === "> 100,000 (USD)";
  const showIncomeInput = wAnnualIncome === "More than 100,000";
  const showAntInput = wAnticipated === "More than $100,000";
  const showBankDetails = wMoneySrc === "banktransfer";

  /* ── reusable select with error ─────────────────────────────────── */
  function RenderSelect(
    name: keyof EmploymentForm,
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
                  {v != "" ? t(name + "." + v) : t("choose")}
                </MenuItem>
              ))}
            </Select>
            {fieldState.error && (
              <FormHelperText>{t("required")}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  /* ── submit ────────────────────────────────────────────────────── */
  const onSubmit = async (vals: EmploymentForm) => {
    if (!id) return;
    try {
      await dispatch(
        updateProfile({ id, section: "employment", fields: vals })
      ).unwrap();
      setSuccessMsg(t("employment_details_saved"));
      setOpenSuccess(true);
      setTimeout(() => setOpenSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
      setTimeout(() => setOpenError(false), 3000);
    }
  };

  return (
    <Paper
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
        {isMobile ? t("employment") : t("investor_info")}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <Grid container rowSpacing={2} columnSpacing={4}>
          {/* 1️⃣ Employment status */}
          <Grid item xs={12} md={6}>
            {RenderSelect("employment_status", empStatus, true)}
          </Grid>

          {/* 2️⃣ Education */}
          <Grid item xs={12} md={6}>
            {RenderSelect("education", educations, true)}
          </Grid>

          {/* 3️⃣ Company details */}
          {showEmpDetails && (
            <>
              <Grid item xs={12} md={4}>
                {RenderSelect("sector_of_activity", sectorsOfActivity, true)}
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="employer_name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label={t("employer_organization")}
                      error={!!fieldState.error}
                      helperText={fieldState.error ? t("required") : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="profession"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label={t("position")}
                      error={!!fieldState.error}
                      helperText={fieldState.error ? t("required") : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="business_address"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label={t("business_address")}
                      error={!!fieldState.error}
                      helperText={fieldState.error ? t("required") : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="country_incorporation"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={countriesList}
                      getOptionLabel={(o) => o.name}
                      value={
                        countriesList.find((c) => c.code === field.value) ??
                        null
                      }
                      onChange={(_, v) => field.onChange(v?.code ?? "")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label={t("country_incorporation")}
                          error={!!fieldState.error}
                          helperText={fieldState.error ? t("required") : ""}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </>
          )}

          {/* 4️⃣ Annual income & net worth */}
          <Grid item xs={12} md={4}>
            {RenderSelect("annual_income", annualIncomeOpts, true)}
          </Grid>
          {showIncomeInput && (
            <Grid item xs={12} md={4}>
              <Controller
                name="annual_income_value"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label={t("annual_income_value")}
                    type="number"
                    inputProps={{ min: 100000 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error ? t("required") : ""}
                  />
                )}
              />
            </Grid>
          )}
          <Grid item xs={12} md={4}>
            {RenderSelect("net_worth", netWorthOpts, true)}
          </Grid>
          {showWorthInput && (
            <Grid item xs={12} md={4}>
              <Controller
                name="net_worth_value"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label={t("net_worth_value")}
                    type="number"
                    inputProps={{ min: 100000 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error ? t("required") : ""}
                  />
                )}
              />
            </Grid>
          )}

          {/* 5️⃣ Money source */}
          <Grid item xs={12} md={6}>
            {RenderSelect("income_outgoing_source", moneySourceOpts, true)}
          </Grid>

          {/* 6️⃣ Bank details */}
          {showBankDetails && (
            <>
              <Grid item xs={12} md={3}>
                <Controller
                  name="bank_account_number"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label={t("account_number")}
                      error={!!fieldState.error}
                      helperText={fieldState.error ? t("required") : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="bank_iban"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label={t("iban")}
                      error={!!fieldState.error}
                      helperText={fieldState.error ? t("required") : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="bank_swift"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label={t("swift")}
                      error={!!fieldState.error}
                      helperText={fieldState.error ? t("required") : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="bank_address"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label={t("bank_address")}
                      error={!!fieldState.error}
                      helperText={fieldState.error ? t("required") : ""}
                    />
                  )}
                />
              </Grid>
            </>
          )}

          {/* 7️⃣ Purpose / Source / Anticipation */}
          <Grid item xs={12} md={6}>
            {RenderSelect("source_of_income", sourceOfIncomeOpts, true)}
          </Grid>
          <Grid item xs={12} md={6}>
            {RenderSelect("reason_to_open", reasonToOpenOpts, true)}
          </Grid>
          <Grid item xs={12} md={6}>
            {RenderSelect("anticipated", anticipationOpts, true)}
          </Grid>
          {showAntInput && (
            <Grid item xs={12} md={6}>
              <Controller
                name="anticipated_value"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label={t("anticipated_value")}
                    type="number"
                    inputProps={{ min: 100000 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error ? t("required") : ""}
                  />
                )}
              />
            </Grid>
          )}

          {/* 8️⃣ Tax info */}
          <Grid item xs={12} md={6}>
            <Controller
              name="tax_residence_country"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("tax_residence_country")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="tax_identification_number"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("tax_identification_number")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                />
              )}
            />
          </Grid>

          {/* 9️⃣ FATCA */}
          <Grid item xs={12} md={6}>
            <Controller
              name="fatca"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <FormControl
                  component="fieldset"
                  size="small"
                  error={!!fieldState.error}
                >
                  <FormLabel>{t("fatca_question")}</FormLabel>
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
                  {fieldState.error && (
                    <FormHelperText>{t("required")}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* 🔟 PEP */}
          <Grid item xs={12} md={6}>
            <Controller
              name="politically_exposed"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <FormControl
                  component="fieldset"
                  size="small"
                  error={!!fieldState.error}
                >
                  <FormLabel>
                    <Trans
                      i18nKey="pep_question"
                      components={{
                        underline: <UnderlinedPEP children={undefined} />,
                      }}
                    />
                  </FormLabel>

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

                  {fieldState.error && (
                    <FormHelperText>{t("required")}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "right", mt: 4 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t("save")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
