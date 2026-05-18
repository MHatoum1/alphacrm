/* -------------- imports --------------- */
import {
  Box,
  Paper,
  TableContainer,
  useMediaQuery,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  Chip,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Autocomplete,
  Link,
  Divider,
  Tooltip,
  IconButton,
  useTheme,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LaunchIcon from "@mui/icons-material/Launch";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
/* 👉 community DatePicker */
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "@/redux/hooks";
import { useSelector } from "react-redux";
import {
  fetchCampaignStats,
  saveCampaignParams,
} from "@/redux/slices/adminMarketingSlice";
import type { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

/* use the list you already exported from asset/constants */
import { countriesList as countries } from "@/assets/constants/countryCodes";
import { WEBSITE_URL } from "@/constants";

export default function CampaignDetailsPage() {
  const { id: campaign_id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const details = useSelector((s: RootState) => s.marketing.details);

  /* ───────── filters state ───────── */
  const [from, setFrom] = useState(moment().subtract(1, "year"));
  const [to, setTo] = useState(moment());
  const [country, setCountry] = useState<string[]>([]);

  /* ───────── local UI state ───────── */
  const [link, setLink] = useState("");
  const [script, setScript] = useState("");
  const [enabled, setEnabled] = useState(false);

  const [ok, setOk] = useState(""); // ✔ snackbar
  const [err, setErr] = useState(""); // ✖ snackbar

  function fetchStats() {
    if (!campaign_id) return;
    dispatch(
      fetchCampaignStats({
        campaign_id,
        from: from.format("YYYY-MM-DD"),
        to: to.format("YYYY-MM-DD"),
        country,
      })
    );
  }

  /* 2️⃣  initial load: run exactly once when <id> changes.        */
  useEffect(() => {
    if (campaign_id) fetchStats(); // ← only id in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign_id]); // ← NOT from/to/country

  /* put-params effect stays as it was */
  useEffect(() => {
    if (details.status === "idle" && details.data?.params) {
      const p = details.data.params;
      setLink(p.link ?? "");
      setScript(p.script ?? "");
      setEnabled(Boolean(p.enabled));
    }
  }, [details.status, details.data]);

  const s = details.data?.stats ?? {};
  const money = (obj?: Record<string, number>) =>
    obj
      ? Object.entries(obj).map(([c, v]) => (
          <div key={c}>
            {c}: {v}
          </div>
        ))
      : "—";

  /* PHP-style profile link */
  const campaignName = details.data?.params?.campaign_name ?? ""; // new field from API
  const encoded = encodeURIComponent(campaignName);

  /* owner (optional) & b.php redirect link */
  const ownerEmail = details.data?.params?.owner_email ?? null;

  const redirectUrl = link
    ? `${WEBSITE_URL}/?cid=${encoded}` + `&l=${encodeURIComponent(btoa(link))}`
    : null;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (details.status === "loading")
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  const handleSave = async () => {
    try {
      if (!campaign_id) return; // <-- runtime guard

      await dispatch(
        saveCampaignParams({
          campaign_id: campaign_id!, // <-- non-null assertion
          link,
          script,
          enabled,
        })
      ).unwrap();
      setOk(t("campaing_saved"));
    } catch (e: any) {
      setErr(e.message || "Error");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* snackbars */}
      {ok && <CustomNotification message={ok} onClose={() => setOk("")} />}
      {err && <CustomError errorMessage={err} onClose={() => setErr("")} />}

      {/* ─── Campaign details header ───────────────────── */}

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        {/* title row */}
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {t("campaign_details")}
        </Typography>

        {/* name + owner in one horizontal Stack */}

        {ownerEmail && (
          <>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t("campaign_owner")}
              </Typography>
              <Typography variant="body1">{ownerEmail}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </>
        )}
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {t("campaign_name")}
          </Typography>
          <Typography variant="body1">{campaignName}</Typography>
        </Box>

        {redirectUrl && (
          <>
            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                rowGap: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mr: 1 }}
              >
                {t("campaign_link")}
              </Typography>

              {/* open in new tab */}
              <Link
                href={redirectUrl}
                target="_blank"
                underline="hover"
                sx={{ wordBreak: "break-all", mr: 1 }}
              >
                {redirectUrl}
                <LaunchIcon fontSize="inherit" sx={{ ml: 0.5 }} />
              </Link>

              {/* copy-to-clipboard */}
              <Tooltip title={t("copy")}>
                <IconButton
                  size="small"
                  onClick={() => navigator.clipboard.writeText(redirectUrl)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}
      </Paper>

      {/* ─── filters panel ─────────────────────────────── */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <DatePicker
                    label={t("from")}
                    value={from}
                    maxDate={to}
                    onChange={(d) => {
                      if (moment.isMoment(d)) {
                        setFrom(d);
                      }
                    }}
                    slotProps={{
                      textField: { fullWidth: true, size: "small" },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label={t("to")}
                    value={to}
                    minDate={from}
                    onChange={(d) => {
                      if (moment.isMoment(d)) {
                        setTo(d);
                      }
                    }}
                    slotProps={{
                      textField: { fullWidth: true, size: "small" },
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              options={countries}
              getOptionLabel={(o) => o.name}
              value={countries.filter((c) => country.includes(c.code))}
              onChange={(_, v) => setCountry(v.map((c) => c.code))}
              renderTags={(v, getTagProps) =>
                v.map((o, i) => (
                  <Chip label={o.code} {...getTagProps({ index: i })} />
                ))
              }
              renderInput={(p) => (
                <TextField {...p} size="small" label={t("country")} />
              )}
            />
          </Grid>

          {/* 👉 Calculate button */}
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={fetchStats}>
              {t("calculate")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ─── statistics table ───────────────────────────── */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("campaign_statistics")} {from.format("YYYY-MM-DD")} –{" "}
          {to.format("YYYY-MM-DD")}
        </Typography>

        {isMobile ? (
          // stacked key/value list on phones
          <Box>
            {[
              "clicks",
              "registered",
              "activated",
              "limited",
              "dormant",
              "verified",
              "funded",
              "demo",
              "live",
              "deposited",
              "withdrawn",
              "net",
            ].map((key) => {
              // pull the correct value, accounting for clicks vs links
              let val: React.ReactNode = s[key];
              if (
                ["registered", "limited", "dormant", "verified"].includes(key)
              ) {
                const url = `/profiles/${key === "registered" ? "all" : key}?campaign=${campaignName}`;
                val = (
                  <Link href={url} target="_blank" underline="hover">
                    {s[key] ?? 0}
                  </Link>
                );
              } else if (key === "deposited" || key === "withdrawn") {
                val = money(s[key as "deposited" | "withdrawn"]);
              } else if (key === "net") {
                val = `${s.net ?? 0} USD`;
              }

              return (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                    borderBottom: (theme) =>
                      `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t(key)}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {val}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          // desktop: classic table wrapped scrollable
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    "clicks",
                    "registered",
                    "activated",
                    "limited",
                    "dormant",
                    "verified",
                    "funded",
                    "demo",
                    "live",
                    "deposited",
                    "withdrawn",
                    "net",
                  ].map((h) => (
                    <TableCell key={h}>{t(h)}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{s.clicks}</TableCell>
                  {(
                    [
                      "registered",
                      "activated",
                      "limited",
                      "dormant",
                      "verified",
                    ] as const
                  ).map((k) => (
                    <TableCell key={k}>
                      {k !== "activated" && (
                        <Link
                          href={`/profiles/${k === "registered" ? "all" : k}?campaign=${campaignName}`}
                          target="_blank"
                          underline="hover"
                        >
                          {s[k] ?? 0}
                        </Link>
                      )}
                      {k === "activated" && (s[k] ?? 0)}
                    </TableCell>
                  ))}
                  <TableCell>{s.funded ?? 0}</TableCell>
                  <TableCell>{s.demo ?? 0}</TableCell>
                  <TableCell>{s.live ?? 0}</TableCell>
                  <TableCell>{money(s.deposited)}</TableCell>
                  <TableCell>{money(s.withdrawn)}</TableCell>
                  <TableCell>{s.net ?? 0} USD</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* parameters (visible when one id) */}
      {!campaign_id?.includes(",") && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Redirect link */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label={t("redirect_link")}
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </Grid>

            {/* Enabled / Disabled */}
            <Grid item xs={12} md={3}>
              <Select
                fullWidth
                size="small"
                value={enabled ? 1 : 0}
                onChange={(e) => setEnabled(Boolean(Number(e.target.value)))}
              >
                <MenuItem value={0}>{t("disabled")}</MenuItem>
                <MenuItem value={1}>{t("enabled")}</MenuItem>
              </Select>
            </Grid>

            {/* Save button — same row */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              <Button
                fullWidth={false} // mobile keeps natural width; change to true if you prefer
                variant="contained"
                onClick={handleSave}
              >
                {t("save")}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
