// src/pages/Admin/Types/TypeEditorPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchReportServers,
  fetchType,
  createType,
  updateType,
  clearCurrent,
} from "@/redux/slices/adminTypesSlice";
import {
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  FormLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

interface FormValues {
  type: string;
  shortval: string;
  initial: string;
  spread: string;
  commission: string;
  leverage: string;
  hosting: string;
  strategy: string;
  iseuropean: "1" | "0";
  islive: "1" | "0";
  enabled: "1" | "0";
  server: "mt4" | "mt5";
  reportserver: string;
}

export default function TypeEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { current, reportServers, loading } = useAppSelector(
    (s) => s.adminTypes
  );

  // local form state
  const [form, setForm] = useState<FormValues>({
    type: "",
    shortval: "",
    initial: "",
    spread: "",
    commission: "",
    leverage: "",
    hosting: "",
    strategy: "",
    iseuropean: "0",
    islive: "1",
    enabled: "1",
    server: "mt5",
    reportserver: "",
  });

  // for toasts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // load dropdown & (if editing) the existing record
  useEffect(() => {
    dispatch(fetchReportServers());
    if (isEdit) dispatch(fetchType(Number(id)));
    else dispatch(clearCurrent());
  }, [dispatch, isEdit, id]);

  // when the record arrives, populate
  useEffect(() => {
    if (isEdit && current) {
      setForm({
        type: current.type,
        shortval: current.shortval,
        initial: String(current.initial),
        spread: current.spread,
        commission: String(current.commission),
        leverage: String(current.leverage),
        hosting: String(current.hosting),
        strategy: current.strategy,
        iseuropean: current.iseuropean,
        islive: current.islive,
        enabled: current.enabled,
        server: current.server,
        reportserver: current.server_name,
      });
    }
  }, [isEdit, current]);

  const handleChange = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload: any = {
      ...form,
      reportserver: form.reportserver,
      ...(isEdit && { id: Number(id) }),
    };
    const action = isEdit
      ? updateType(payload as any)
      : createType(payload as any);

    try {
      await dispatch(action).unwrap();
      setSuccessMsg(
        isEdit
          ? t("type_updated", "Type updated successfully")
          : t("type_created", "Type created successfully")
      );
    } catch (err: any) {
      setErrorMsg(err || t("save_failed", "Save failed"));
    }
  };

  // while fetching the existing record
  if (loading && isEdit && !current) {
    return <CircularProgress />;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        mx: "auto",
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
        {isEdit ? t("edit_type", "Edit Type") : t("create_type", "Create Type")}
      </Typography>

      {successMsg && (
        <CustomNotification
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
      {errorMsg && (
        <CustomError
          errorMessage={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <Box
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Grid container spacing={2}>
          {/* Type */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("type", "Type")}
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              required
              size="small"
            />
          </Grid>

          {/* Short Value */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required size="small">
              <InputLabel>{t("short_value", "Short Value")}</InputLabel>
              <Select
                value={form.shortval}
                label={t("short_value", "Short Value")}
                onChange={(e) =>
                  handleChange("shortval", e.target.value as string)
                }
              >
                {/* TODO: replace with real list */}
                {["ibs", "all", "vip", "promo"].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Initial Deposit */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("initial_deposit", "Initial Deposit")}
              type="number"
              value={form.initial}
              onChange={(e) => handleChange("initial", e.target.value)}
              required
              size="small"
            />
          </Grid>

          {/* Spread */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("spread", "Spread")}
              value={form.spread}
              onChange={(e) => handleChange("spread", e.target.value)}
              required
              size="small"
            />
          </Grid>

          {/* Commission */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("commission", "Commission")}
              type="number"
              value={form.commission}
              onChange={(e) => handleChange("commission", e.target.value)}
              required
              size="small"
            />
          </Grid>

          {/* Max. Leverage */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("max_leverage", "Max. Leverage")}
              type="number"
              value={form.leverage}
              onChange={(e) => handleChange("leverage", e.target.value)}
              required
              size="small"
            />
          </Grid>

          {/* Hosting */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("hosting", "Hosting")}
              type="number"
              value={form.hosting}
              onChange={(e) => handleChange("hosting", e.target.value)}
              required
              size="small"
            />
          </Grid>

          {/* 9) Report Server */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required size="small">
              <InputLabel>{t("report_server", "Report Server")}</InputLabel>
              <Select
                value={form.reportserver}
                label={t("report_server", "Report Server")}
                onChange={(e) =>
                  handleChange("reportserver", e.target.value as string)
                }
              >
                {reportServers.map((srv) => (
                  <MenuItem key={srv.id} value={srv.server_name}>
                    {srv.server_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/** European / Live‐Demo / Enabled all in one row **/}
          <Grid item xs={12} md={4}>
            <FormControl component="fieldset" fullWidth size="small">
              <FormLabel component="legend">
                {t("european", "European")}
              </FormLabel>
              <RadioGroup
                row
                value={form.iseuropean}
                onChange={(e) =>
                  handleChange("iseuropean", e.target.value as "1" | "0")
                }
              >
                <FormControlLabel
                  value="1"
                  control={<Radio size="small" />}
                  label={t("yes", "Yes")}
                />
                <FormControlLabel
                  value="0"
                  control={<Radio size="small" />}
                  label={t("no", "No")}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl component="fieldset" fullWidth size="small">
              <FormLabel component="legend">
                {t("live_or_demo", "Live/Demo")}
              </FormLabel>
              <RadioGroup
                row
                value={form.islive}
                onChange={(e) =>
                  handleChange("islive", e.target.value as "1" | "0")
                }
              >
                <FormControlLabel
                  value="1"
                  control={<Radio size="small" />}
                  label={t("live", "Live")}
                />
                <FormControlLabel
                  value="0"
                  control={<Radio size="small" />}
                  label={t("demo", "Demo")}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl component="fieldset" fullWidth size="small">
              <FormLabel component="legend">
                {t("enabled", "Enabled")}
              </FormLabel>
              <RadioGroup
                row
                value={form.enabled}
                onChange={(e) =>
                  handleChange("enabled", e.target.value as "1" | "0")
                }
              >
                <FormControlLabel
                  value="1"
                  control={<Radio size="small" />}
                  label={t("yes", "Yes")}
                />
                <FormControlLabel
                  value="0"
                  control={<Radio size="small" />}
                  label={t("no", "No")}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/** Submit button on its own row, right‐aligned **/}
          <Grid item xs={12}>
            <Box sx={{ textAlign: isMobile ? "left" : "right", mt: 2 }}>
              <Button type="submit" variant="contained">
                {isEdit
                  ? t("save_changes", "Save Changes")
                  : t("create_type", "Create Type")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
