// src/pages/SalesClientCreatePage.tsx
import {
  Box,
  Button,
  CircularProgress,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import { createClient, reset } from "@/redux/slices/salesClientCreateSlice";
import md5 from "crypto-js/md5";
import { countriesList, phoneCodesList } from "@/assets/constants/countryCodes";

import CustomNotification from "@/components/ui/CustomNotification"; // NEW
import CustomError from "@/components/ui/CustomError"; // NEW
import { useTranslation } from "react-i18next";

const SOURCE_OPTIONS = ["Sale Instagram", "Sale Facebook", "Other"] as const;

export default function SalesClientCreatePage() {
  const { t } = useTranslation(); // <-- Add this
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.salesClientCreate);

  /* ─── toast flags ─────────────────────────────────────────── */
  const [ok, setOk] = useState<string | false>(false);
  const [err, setErr] = useState<string | false>(false);

  /* ─── the logged-in user (for “sales” ACL) ─────────────────────── */
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isSales = user?.acl === "sales";
  const salesLink = isSales
    ? `${window.location.protocol}//${window.location.host}/pp/${md5(user.uid)}`
    : "";

  // ─── 1. blank form helper ────────────────────────────────────────────
  const BLANK_FORM = {
    name: "",
    email: "",
    country: "",
    phone: "",
    status: "new",
    source: "",
    specify: "",
  } as const;

  /* reset slice on unmount ----------------------------------- */
  useEffect(
    () => () => {
      dispatch(reset());
    },
    [dispatch]
  );

  /* ─── snack-bar + clear-form logic ─────────────────────────────────── */
  useEffect(() => {
    if (status === "succeeded") {
      setOk(t("sales_client_create_success"));
      setErr(false);
      setF({ ...BLANK_FORM }); // ← CLEAR THE FIELDS
    } else if (status === "failed") {
      setErr(error || t("sales_client_create_error"));
      setOk(false);
    }
  }, [status, error]);

  /* ─── form state & helpers ────────────────────────────────── */
  /* ─── form state ───────────────────────────────────────────────────── */
  const [f, setF] = useState({
    name: "",
    email: "",
    country: "",
    phone: "",
    status: "new",
    source: "",
    specify: "",
  });

  /* ISO-2 ➜ phone code map ------------------------------------ */
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

  const onCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    const newPrefix = phoneCodeMap[iso] ? `+${phoneCodeMap[iso]} ` : "";
    setF((p) => ({
      ...p,
      country: iso,
      phone: newPrefix + p.phone.replace(/^\+\d+\s*/, ""),
    }));
  };

  const on = (k: keyof typeof f) => (e: any) =>
    setF((o) => ({ ...o, [k]: e.target.value }));

  const specifyDisabled = f.source !== "Other";

  const valid =
    f.name.trim() !== "" &&
    /\S+@\S+\.\S+/.test(f.email) &&
    f.country !== "" &&
    f.phone.trim().length >= 4 &&
    f.status !== "" &&
    f.source !== "";

  const submit = () => {
    if (valid) dispatch(createClient(f));
  };

  /* ─── render ──────────────────────────────────────────────── */
  return (
    <Box sx={{ p: 3 }}>
      {/* toast banners */}
      {ok && <CustomNotification message={ok} onClose={() => setOk(false)} />}
      {err && <CustomError errorMessage={err} onClose={() => setErr(false)} />}

      {/* header ------------------------------------------------ */}
      <Typography variant="h5" gutterBottom>
        {t("create_client")}
      </Typography>

      {/* success link instead of form when done ---------------- */}

      <>
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
            onChange={onCountryChange}
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

          {/* ───────── Partnership link (sales ACL only) ───────── */}
          {isSales && (
            <Box mt={4}>
              <Typography variant="subtitle1" gutterBottom>
                {t("partnership_link")}
              </Typography>
              <Link
                href={`whatsapp://send?text=${encodeURIComponent(salesLink)}`}
                underline="hover"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `whatsapp://send?text=${encodeURIComponent(salesLink)}`,
                    "",
                    "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600"
                  );
                }}
              >
                {salesLink}
              </Link>
            </Box>
          )}
        </Stack>

        <Button
          sx={{ mt: 2 }}
          variant="contained"
          disabled={!valid || status === "loading"}
          onClick={submit}
        >
          {status === "loading" ? <CircularProgress size={18} /> : t("save")}
        </Button>
      </>
    </Box>
  );
}
