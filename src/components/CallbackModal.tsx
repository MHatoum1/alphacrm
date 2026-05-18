// src/components/CallbackModal.tsx
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { sendCallback } from "@/redux/slices/messengerSlice";

import { countriesList, phoneCodesList } from "@/assets/constants/countryCodes";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CallbackModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { callbackStatus, error } = useAppSelector((s) => s.messenger);

  /* ─── current user id ─────────────────────────────────────── */
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  /* ─── local form state ────────────────────────────────────── */
  const [f, setF] = useState({
    full_name: "",
    email: "",
    country: "",
    phone: "",
    code: "",
    best: "",
  });

  /* ─── map ISO → phone code ───────────────────────────────── */
  const phoneCodeMap = useMemo(
    () =>
      phoneCodesList.reduce<Record<string, string>>(
        (acc, { iso2, phoneCode }) => {
          acc[iso2.toUpperCase()] = phoneCode;
          return acc;
        },
        {}
      ),
    []
  );

  /* ═══════════════════════════════════════════════════════════
     Detect visitor country – one network call, cached afterwards
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const detectCountryByIP = async () => {
      /* already cached? */
      const cached = localStorage.getItem("geoCountry");
      if (cached) return cached.toUpperCase();

      try {
        const res = await fetch("http://ip-api.com/json/");
        if (!res.ok) throw new Error("GeoIP request failed");
        const data = await res.json();
        if (data.countryCode) {
          const code = String(data.countryCode).toUpperCase();
          localStorage.setItem("geoCountry", code);
          return code;
        }
      } catch (_) {
        /* ignore – we'll fall back to US below */
      }
      return "";
    };

    /* run once when the component mounts so that
       the country is ready before the modal is opened */
    detectCountryByIP().then((cc) => {
      /* don’t overwrite if the user already picked something */
      setF((o) =>
        o.country ? o : { ...o, country: cc, code: phoneCodeMap[cc] ?? "" }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run exactly once

  /* ─── every time the dialog is opened, make sure we have a country ─── */
  useEffect(() => {
    if (!open) return;

    if (!f.country) {
      const cc = (localStorage.getItem("geoCountry") ?? "US").toUpperCase();
      setF((o) => ({ ...o, country: cc, code: phoneCodeMap[cc] ?? "" }));
    }
  }, [open, f.country, phoneCodeMap]);

  /* ─── helpers ────────────────────────────────────────────── */
  const onChange =
    (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setF((o) => ({ ...o, [k]: e.target.value }));

  const valid =
    f.full_name.trim() !== "" &&
    /\S+@\S+\.\S+/.test(f.email) &&
    f.phone.trim().length >= 4;

  /* ─── submit via Redux thunk ─────────────────────────────── */
  const submit = () => {
    if (!valid) return;

    dispatch(
      sendCallback({
        full_name: f.full_name,
        email: f.email,
        country_code: f.code,
        phone: f.phone,
        country: f.country,
        validation: "1234",
        Besttimetocall: f.best || undefined,
        user_id: user_id || "",
      })
    ).unwrap();
  };

  const submitting = callbackStatus === "loading";
  const sent = callbackStatus === "succeeded";

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: "#3887BE", color: "#fff" }}>
        {t("callback")}
      </DialogTitle>

      <DialogContent dividers>
        {sent ? (
          <Box textAlign="center" py={3}>
            <Typography>{t("callback_thanks")}</Typography>
          </Box>
        ) : (
          <Stack spacing={2} mt={1}>
            <TextField
              label={t("full_name")}
              value={f.full_name}
              onChange={onChange("full_name")}
              required
            />
            <TextField
              label={t("email")}
              type="email"
              value={f.email}
              onChange={onChange("email")}
              required
            />

            {/* Country selector */}
            <TextField
              select
              label={t("country")}
              value={f.country}
              onChange={(e) => {
                const v = e.target.value;
                setF((o) => ({
                  ...o,
                  country: v,
                  code: phoneCodeMap[v] ?? "",
                }));
              }}
            >
              {countriesList.map(({ code, name }) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
            </TextField>

            {/* Phone fields */}
            <Stack direction="row" spacing={1}>
              <TextField
                disabled
                value={f.code ? `+${f.code}` : ""}
                sx={{ width: 110 }}
              />
              <TextField
                label={t("phone")}
                value={f.phone}
                onChange={onChange("phone")}
                fullWidth
                required
              />
            </Stack>

            <TextField
              label={t("callback_best_time")}
              value={f.best}
              onChange={onChange("best")}
              placeholder="hh:mm (GMT+3)"
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {!sent && (
          <Button
            onClick={submit}
            disabled={!valid || submitting}
            variant="contained"
          >
            {submitting ? <CircularProgress size={18} /> : t("submit")}
          </Button>
        )}
        <Button onClick={onClose}>{t("close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
