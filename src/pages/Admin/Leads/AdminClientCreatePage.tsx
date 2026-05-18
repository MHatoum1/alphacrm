// src/pages/AdminClientCreatePage.tsx
import {
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useTranslation } from "react-i18next";

import { createClient, reset } from "@/redux/slices/salesClientCreateSlice";
import { countriesList, phoneCodesList } from "@/assets/constants/countryCodes";

import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { fetchDropdowns } from "@/redux/slices/salesClientSlice";
import LeadSwitcher from "@/components/ui/LeadSwitcher";

const SOURCE_OPTIONS = ["Sale Instagram", "Sale Facebook", "Other"] as const;

export default function AdminClientCreatePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { dropdowns } = useAppSelector((s) => s.salesClient);
  const { status, error } = useAppSelector((s) => s.salesClientCreate);

  /* ───────── notifications ───────────────────────────────── */
  const [ok, setOk] = useState<string | false>(false);
  const [err, setErr] = useState<string | false>(false);

  /* ───────── blank form helper ───────────────────────────── */
  const BLANK = {
    name: "",
    email: "",
    country: "",
    phone: "",
    status: "new",
    source: "",
    specify: "",
    sales: "",
  } as const;

  /* ───────── slice reset on unmount ──────────────────────── */
  useEffect(() => {
    dispatch(fetchDropdowns());
  }, [dispatch]);
  useEffect(() => () => void dispatch(reset()), [dispatch]);

  /* ───────── clear form & show snackbars on status change ── */
  const [f, setF] = useState({
    name: "",
    email: "",
    country: "",
    phone: "",
    status: "new",
    source: "",
    specify: "",
    sales: "",
  });
  useEffect(() => {
    if (status === "succeeded") {
      setOk(t("sales_client_create_success"));
      setErr(false);
      setF({ ...BLANK });
    } else if (status === "failed") {
      setErr(error || t("sales_client_create_error"));
      setOk(false);
    }
  }, [status, error, t]);

  /* ───────── helpers ─────────────────────────────────────── */
  const phoneCodeMap = useMemo(
    () =>
      phoneCodesList.reduce<Record<string, string>>(
        (a, { iso2, phoneCode }) => {
          a[iso2.toUpperCase()] = phoneCode;
          return a;
        },
        {}
      ),
    []
  );

  const onCountry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    const prefix = phoneCodeMap[iso] ? `+${phoneCodeMap[iso]} ` : "";
    setF((p) => ({
      ...p,
      country: iso,
      phone: prefix + p.phone.replace(/^\+\d+\s*/, ""),
    }));
  };

  const on = (k: keyof typeof f) => (e: any) =>
    setF((o) => ({ ...o, [k]: e.target.value }));

  const specifyDisabled = f.source !== "Other";

  const valid =
    f.name.trim() &&
    /\S+@\S+\.\S+/.test(f.email) &&
    f.country &&
    f.phone.trim().length >= 4 &&
    f.source;

  const submit = () => valid && dispatch(createClient(f));

  /* ───────── render ──────────────────────────────────────── */
  return (
    <>
      <LeadSwitcher>
        <Paper sx={{ p: 3 }}>
          {ok && (
            <CustomNotification message={ok} onClose={() => setOk(false)} />
          )}
          {err && (
            <CustomError errorMessage={err} onClose={() => setErr(false)} />
          )}

          <Typography variant="h5" gutterBottom>
            {t("create_client")}
          </Typography>

          <Stack spacing={2}>
            <TextField
              label={t("name")}
              fullWidth
              value={f.name}
              onChange={on("name")}
              required
            />
            <TextField
              label={t("email")}
              type="email"
              value={f.email}
              onChange={on("email")}
              required
            />

            <TextField
              select
              label={t("country")}
              value={f.country}
              onChange={onCountry}
              required
            >
              {countriesList.map(({ code, name }) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("phone")}
              value={f.phone}
              onChange={on("phone")}
              required
            />

            <TextField
              select
              label={t("status")}
              value={f.status}
              onChange={on("status")}
              required
            >
              <MenuItem value="new">{t("status_new")}</MenuItem>
            </TextField>

            <TextField
              select
              label={t("source")}
              value={f.source}
              onChange={on("source")}
              required
            >
              {SOURCE_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {t(`source_${opt.replace(" ", "_").toLowerCase()}`)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("specify")}
              value={f.specify}
              onChange={on("specify")}
              disabled={specifyDisabled}
            />

            <TextField
              select
              label="Sales"
              value={f.sales}
              onChange={on("sales")}
            >
              {dropdowns.partnerships.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.text}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            disabled={!valid || status === "loading"}
            onClick={submit}
          >
            {status === "loading" ? <CircularProgress size={18} /> : t("save")}
          </Button>
        </Paper>
      </LeadSwitcher>
    </>
  );
}
