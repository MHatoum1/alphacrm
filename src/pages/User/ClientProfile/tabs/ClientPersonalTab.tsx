// src/pages/User/ClientProfile/tabs/ClientPersonalTab.tsx
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Controller, useForm, useWatch } from "react-hook-form";
import moment, { Moment } from "moment";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks";
import { Profile } from "@/redux/slices/adminProfileReviewSlice";
import type { RootState } from "@/redux/store";
import { useEffect, useMemo, useState } from "react";
import { countriesList, phoneCodesList } from "@/assets/constants/countryCodes";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";
import { updateClientProfile } from "@/redux/slices/clientProfileSlice";
import { useNavigate, useOutletContext } from "react-router-dom";

/* ---------- local form model ---------- */
interface PersonalForm {
  title: string;
  name: string;
  passport: string;
  birth_date: Moment | null;
  birth_place: string;
  country: string;
  phone_number: string;
  city: string;
  zip: string;
  region: string;
  address: string;
  address2: string;
  phone_home: string;
  phone_fax: string;
}

/* ---------- helpers ---------- */
const titles = ["Mr.", "Mrs.", "Ms.", "Dr."];
const findDial = (iso2: string) =>
  phoneCodesList.find((p) => p.iso2 === iso2.toLowerCase())?.phoneCode ?? "";

export default function ClientPersonalTab() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { reloadProfile } = useOutletContext<{ reloadProfile: () => void }>();

  const profile = useSelector(
    (s: RootState) => s.clientProfile.data
  ) as Partial<Profile>;

  // Snackbars
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* split phone into [code, number] */
  const dialFromProfile = findDial(profile.country ?? "");
  const phoneNumberFromProfile = profile.phone
    ? String(profile.phone).replace(dialFromProfile, "")
    : "";

  /* ---------- default values ---------- */
  const defaults = useMemo<PersonalForm>(
    () => ({
      title: profile.title ?? "",
      name: profile.name ?? "",
      passport: String(profile.passport ?? ""),
      birth_date: profile.birth_date
        ? moment(profile.birth_date, "DD/MM/YYYY")
        : null,
      birth_place: profile.birth_place ?? "",
      country: profile.country ?? "",
      phone_number: phoneNumberFromProfile,
      city: profile.city ?? "",
      zip: profile.zip ?? "",
      region: profile.region ?? "",
      address: profile.address ?? "",
      address2: profile.address2 ?? "",
      phone_home: profile.phone_home ?? "",
      phone_fax: profile.phone_fax ?? "",
    }),
    [profile, phoneNumberFromProfile]
  );

  /* ---------- RHF ---------- */
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PersonalForm>({
    defaultValues: defaults,
    mode: "onTouched",
  });
  useEffect(() => reset(defaults), [defaults, reset]);

  /* Need the current country inside render → useWatch */
  const watchedCountry = useWatch({ control, name: "country" });
  const currentDial = findDial(watchedCountry);

  /* ---------- submit ---------- */
  const onSubmit = async (vals: PersonalForm) => {
    if (!authUser?.userID) return;
    const fullPhone = currentDial + vals.phone_number;

    try {
      await dispatch(
        updateClientProfile({
          user_id: authUser.userID,
          section: "personal",
          fields: {
            ...vals,
            phone: fullPhone,
            birth_date: vals.birth_date?.format("DD/MM/YYYY") ?? "",
          },
        })
      ).unwrap();

      setSuccessMsg(t("personal_details_saved"));
      setOpenSuccess(true);
      reloadProfile();
      setTimeout(() => setOpenSuccess(false), 2000);

      const next = authUser?.affiliate
        ? "/userprofile/documents"
        : "/userprofile/employment";
      setTimeout(() => navigate(next, { replace: true }), 1000);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
      setTimeout(() => setOpenError(false), 3000);
    }
  };

  /* ---------- UI ---------- */
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
        {isMobile ? t("personal_mobile") : t("personal_details")}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* SNACKBARS */}
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
          {/* Row 1 */}
          <Grid item xs={12} md={6}>
            <Controller
              name="title"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label={t("title")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                >
                  <MenuItem value="">
                    <em>{t("title_placeholder")}</em>
                  </MenuItem>
                  {titles.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("full_name")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                />
              )}
            />
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} md={6}>
            <Controller
              name="country"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <Autocomplete
                  options={countriesList}
                  getOptionLabel={(o) => o.name}
                  value={
                    countriesList.find((c) => c.code === field.value) ?? null
                  }
                  onChange={(_, v) => field.onChange(v?.code ?? "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label={t("country")}
                      error={!!fieldState.error}
                      helperText={fieldState.error ? t("required") : ""}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="phone_number"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("mobile_phone")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        {currentDial}
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Row 3 */}
          <Grid item xs={12} md={4}>
            <Controller
              name="passport"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("passport")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Controller
                name="birth_date"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <DatePicker
                    {...field}
                    label={t("birth_date")}
                    format="DD/MM/YYYY"
                    maxDate={moment().subtract(18, "years")}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error ? t("required") : "",
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="birth_place"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("birth_place")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                />
              )}
            />
          </Grid>

          {/* Row 4 */}
          <Grid item xs={12} md={4}>
            <Controller
              name="city"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("city")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="zip"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("postal_code")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("region")}
                />
              )}
            />
          </Grid>

          {/* Row 5 */}
          <Grid item xs={12} md={6}>
            <Controller
              name="address"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("address")}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? t("required") : ""}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="address2"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("address2")}
                />
              )}
            />
          </Grid>

          {/* Row 6 */}
          <Grid item xs={12} md={6}>
            <Controller
              name="phone_home"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("home_phone")}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="phone_fax"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t("fax_number")}
                />
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "start", mt: 4 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t("save")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
