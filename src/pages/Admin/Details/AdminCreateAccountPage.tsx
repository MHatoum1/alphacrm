import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAccountTemplates,
  type Template,
} from "@/redux/slices/accountTemplatesSlice";
import {
  fetchCreateOptions,
  createAccount,
  resetAccountCreate,
} from "@/redux/slices/accountCreateSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function AdminCreateAccountPage() {
  const { id } = useParams<{ id: string }>(); // target user id (required)
    const nav = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // ─────────────────────────────────────────────────────────────
  // 1) Load all templates for this user (admin chooses one)
  // ─────────────────────────────────────────────────────────────
  const {
    live = [],
    demo = [],
    status: tplStatus,
    error: tplError,
  } = useAppSelector((s) => s.accountTemplates ?? {});

  useEffect(() => {
    if (!id) return;
    dispatch(fetchAccountTemplates({ user_id: id }));
  }, [dispatch, id]);

  // ─────────────────────────────────────────────────────────────
  // 2) Local selection state (which template is picked?)
  // ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Template | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 3) When a template is selected, fetch create options for it
  // ─────────────────────────────────────────────────────────────
  const {
    options,
    status: createStatus,
    error: createError,
  } = useAppSelector((s) => s.accountCreate);

  // derive booleans to keep UI snappy and clear
  const optionsLoading = createStatus === "loading" && !options;
  const creatingNow = createStatus === "loading" && !!options;

  useEffect(() => {
    if (!id || !selected) return;
    dispatch(
      fetchCreateOptions({
        user_id: id,
        type: selected.type,
        shortval: selected.shortval,
        className: selected.className,
        platform: selected.platform,
      })
    );
    return () => {
      dispatch(resetAccountCreate());
    };
  }, [dispatch, id, selected]);

  // ─────────────────────────────────────────────────────────────
  // 4) Form state that depends on the fetched options
  // ─────────────────────────────────────────────────────────────
  const [currency, setCurrency] = useState("");
  const [leverage, setLeverage] = useState<number | "">("");
  const [demoFund, setDemoFund] = useState<number>(0);

  useEffect(() => {
    if (!options) return;
    setCurrency(options.defaultCurrency);
    setLeverage(options.defaultLeverage);
    if (options.showDemoFund) setDemoFund(options.demoFunds[0]);
  }, [options]);

  // ─────────────────────────────────────────────────────────────
  // 5) Notifications
  // ─────────────────────────────────────────────────────────────
  const [okMsg, setOkMsg] = useState<string | false>(false);
  const [errMsg, setErrMsg] = useState<string | false>(false);

  useEffect(() => {
    if (tplStatus === "failed" && tplError) setErrMsg(tplError);
  }, [tplStatus, tplError]);

  useEffect(() => {
    if (createStatus === "failed" && createError) setErrMsg(createError);
  }, [createStatus, createError]);

  // ─────────────────────────────────────────────────────────────
  // 6) Submit create account
  // ─────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selected || !options) return;
    try {
      const res = await dispatch(
        createAccount({
          params: {
            user_id: id,
            type: selected.type,
            shortval: selected.shortval,
            className: selected.className,
            platform: selected.platform,
          },
          currency,
          leverage: Number(leverage),
          demoFund: selected.type === "demo" ? demoFund : undefined,
        })
      ).unwrap();

      if (!res) {
        throw new Error(t("unexpected_response", "Unexpected response"));
      }

      setOkMsg(t("account_created_successfully"));
      // Optional: navigate somewhere useful in admin after a short pause
      setTimeout(() => nav(`/detailed/accounts/${id}`), 1200);
    } catch (err: any) {
      setErrMsg(err?.message || t("save_failed"));
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Small UI helpers
  // ─────────────────────────────────────────────────────────────
  const allLive = live ?? [];
  const allDemo = demo ?? [];
  const hasAnyTemplates = allLive.length + allDemo.length > 0;

  const Section = ({ title, children }: any) => (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6" align="center">
        {title}
      </Typography>
      {children}
    </Paper>
  );

  const TemplateCard = ({ tpl }: { tpl: Template }) => {
    const isSel =
      selected?.className === tpl.className &&
      selected?.platform === tpl.platform &&
      selected?.type === tpl.type;
    return (
      <Paper
        onClick={() => setSelected(tpl)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" ? setSelected(tpl) : null)}
        sx={{
          p: 2,
          height: "100%",
          cursor: "pointer",
          outline: "none",
          border: isSel ? "2px solid" : "1px solid",
          borderColor: isSel ? "primary.main" : "divider",
          boxShadow: isSel ? 3 : 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          "&:hover": { boxShadow: 2 },
        }}
      >
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" textTransform="uppercase">
              {tpl.className}
            </Typography>
            <Chip
              size="small"
              label={
                tpl.type === "demo"
                  ? t("demo_accounts", "Demo")
                  : t("live_accounts", "Live")
              }
              color={tpl.type === "demo" ? "default" : "primary"}
              variant={tpl.type === "demo" ? "outlined" : "filled"}
            />
          </Box>

          <Typography variant="body2" mt={0.5}>
            {t("initial_deposit_from", "Initial deposit from")} {tpl.initial}
          </Typography>

          <ul style={{ marginLeft: 16, marginTop: 8, paddingLeft: 0 }}>
            <li>
              {t("spreads_from", "Spreads from")} {tpl.spread}
            </li>
            <li>
              {t("commission_from", "Commission from")} {tpl.commission}$
            </li>
            <li>
              {t("leverage_up_to", "Leverage up to")} {tpl.leverage}:1
            </li>
            <li>
              {t("mt5_vps_hosting", "MT5 VPS hosting")} {tpl.hosting}/{" "}
              {t("month", "month")}
            </li>
            <li>{t("no_limitations_strategies", "No strategy limitations")}</li>
          </ul>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={1}>
          <Chip size="small" label={tpl.platform.toUpperCase()} />
          <Chip size="small" label={tpl.shortval} variant="outlined" />
        </Box>
      </Paper>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // Guards & spinners
  // ─────────────────────────────────────────────────────────────
  if (!id) {
    return (
      <CustomError
        errorMessage={t("missing_user_id", "Missing user id in the URL")}
        onClose={() => {}}
      />
    );
  }

  if (tplStatus === "loading") {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (tplStatus === "failed") {
    return (
      <CustomError errorMessage={tplError || "Error"} onClose={() => {}} />
    );
  }

  if (!hasAnyTemplates) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography align="center">
          {t("no_templates_available", "No templates available for this user.")}
        </Typography>
      </Paper>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {okMsg && (
        <CustomNotification message={okMsg} onClose={() => setOkMsg(false)} />
      )}
      {errMsg && (
        <CustomError errorMessage={errMsg} onClose={() => setErrMsg(false)} />
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {t("choose_your_trading_account", "Choose your trading account")}
          </Typography>
          <Button
            component={RouterLink}
            to={`/detailed/accounts/${id}`}
            variant="text"
          >
            {t("back_to_user", "Back to user")}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {/* Left: template picker */}
        <Grid item xs={12} md={7}>
          <Section title={t("live_accounts", "Live Accounts")}>
            <Grid container spacing={2}>
              {allLive.map((tpl) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  key={`live-${tpl.className}-${tpl.platform}`}
                >
                  <TemplateCard tpl={tpl} />
                </Grid>
              ))}
            </Grid>
          </Section>
        </Grid>

        {/* Right: create form (populated when a template is chosen) */}
        <Grid item xs={12} md={5}>
          <Section title={t("create_account", "Create account")}>
            {!selected ? (
              <Typography align="center" color="text.secondary">
                {t(
                  "pick_a_template_first",
                  "Pick a template on the left to continue."
                )}
              </Typography>
            ) : optionsLoading ? (
              <Box textAlign="center" mt={2}>
                <CircularProgress />
              </Box>
            ) : options ? (
              <Box component="form" onSubmit={handleCreate}>
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t("selected_template", "Selected template")}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={selected.className} />
                    <Chip label={selected.type.toUpperCase()} />
                    <Chip label={selected.platform.toUpperCase()} />
                    <Chip label={selected.shortval} variant="outlined" />
                  </Stack>
                </Box>

                <Stack spacing={2} sx={{ maxWidth: 600 }}>
                  {/* Currency */}
                  <FormControl fullWidth>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t("currency", "Currency")}
                    </Typography>
                    <Select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as string)}
                    >
                      {options.currencies.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Leverage */}
                  <FormControl fullWidth>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t("leverage", "Leverage")}
                    </Typography>
                    <Select
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                    >
                      {options.leverages.map((l) => (
                        <MenuItem key={l} value={l}>{`1:${l}`}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Demo Fund */}
                  {options.showDemoFund && (
                    <FormControl fullWidth>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {t("initial_amount", "Initial amount")}
                      </Typography>
                      <Select
                        value={demoFund}
                        onChange={(e) => setDemoFund(Number(e.target.value))}
                      >
                        {options.demoFunds.map((f) => (
                          <MenuItem key={f} value={f}>
                            {f}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={creatingNow}
                    >
                      {creatingNow
                        ? t("creating", "Creating…")
                        : t("btn_open_account", "Open Account")}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <CustomError
                errorMessage={t(
                  "failed_to_load_options",
                  "Failed to load options"
                )}
                onClose={() => dispatch(resetAccountCreate())}
              />
            )}
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
}
