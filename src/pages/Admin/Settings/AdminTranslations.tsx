// src/pages/AdminTranslations.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  loadLang,
  patchLang,
  listLanguages,
  TranslationsMap,
} from "@/api/translations";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";

const AdminTranslations: React.FC = () => {
  const { t } = useTranslation();

  const [langs, setLangs] = useState<string[]>([]);
  const [lang, setLang] = useState<string>("en");
  const [keys, setKeys] = useState<TranslationsMap>({});
  const [original, setOriginal] = useState<TranslationsMap>({});
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      const ls = await listLanguages();
      setLangs(ls);
      if (ls.length) setLang(ls.includes("en") ? "en" : ls[0]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const data = await loadLang(lang as any);
      const cloned = { ...(data || {}) };
      setKeys(cloned);
      setOriginal(cloned);
    })();
  }, [lang]);

  const filteredEntries = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const entries = Object.entries(keys);
    if (!f) return entries;
    return entries.filter(
      ([k, v]) =>
        k.toLowerCase().includes(f) || (v ?? "").toLowerCase().includes(f)
    );
  }, [keys, filter]);

  const handleChangeKey = (k: string, v: string) => {
    setKeys((prev) => ({ ...prev, [k]: v }));
  };

  const handleSave = async () => {
    const diff: TranslationsMap = {};
    for (const [k, v] of Object.entries(keys)) {
      if (original[k] !== v) diff[k] = v ?? "";
    }
    if (Object.keys(diff).length === 0) return;
    await patchLang(lang as any, diff);
    setOriginal({ ...keys });
  };

  return (
    <Container
      maxWidth={false} // ✅ full width (no max)
      disableGutters // ✅ remove left/right padding
      sx={{
        width: "100% !important", // ✅ hard override any CSS
        maxWidth: "100% !important",
        mx: "0 !important", // ✅ no auto-centering
        px: "0 !important",
        py: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start", // start
        justifyContent: "flex-start",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, textAlign: "left", width: "100%" }}>
        {t("translations_admin_title")}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          alignItems: "flex-start",
          justifyContent: "flex-start",
          width: "100%",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="lang-label">{t("language")}</InputLabel>
          <Select
            labelId="lang-label"
            value={lang}
            label={t("language")}
            onChange={(e: SelectChangeEvent) => setLang(e.target.value)}
          >
            {langs.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label={t("search_key_value")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Box sx={{ flex: 1 }} />

        <Button variant="contained" onClick={handleSave}>
          {t("save")}
        </Button>
      </Box>

      {/* keys grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) minmax(320px, 2fr)",
          gap: 1.25,
          width: "100%",
          justifyItems: "start",
          alignItems: "start",
        }}
      >
        {filteredEntries.length === 0 && (
          <Typography sx={{ gridColumn: "1 / -1" }}>
            {t("no_results")}
          </Typography>
        )}

        {filteredEntries.map(([k, v]) => (
          <React.Fragment key={k}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100%",
              }}
            >
              <Typography
                sx={{ fontFamily: "monospace", pr: 1, textAlign: "left" }}
              >
                {k}
              </Typography>
            </Box>

            <TextField
              size="small"
              value={v !== undefined && v !== null ? String(v) : ""}
              onChange={(e) => handleChangeKey(k, e.target.value)}
              fullWidth
            />
          </React.Fragment>
        ))}
      </Box>
    </Container>
  );
};

export default AdminTranslations;
