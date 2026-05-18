import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useTranslation } from "react-i18next";
import { importLeadsCSV } from "@/redux/slices/leadsImportSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import LeadSwitcher from "@/components/ui/LeadSwitcher";

export default function LeadsImportPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, error, summary } = useAppSelector((s) => s.leadsImport);

  const [file, setFile] = useState<File | null>(null);
  const [ok, setOk] = useState<string | false>(false);
  const [err, setErr] = useState<string | false>(false);
  const storedAdmin = localStorage.getItem("user") || "";
  const admin = storedAdmin ? JSON.parse(storedAdmin) : null;

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) {
      setErr(t("only_csv_allowed"));
      setFile(null);
      return;
    }
    setFile(f);
  };

  const onSubmit = async () => {
    if (!file) return;
    console.log();
    if (!admin.uid) {
      setErr(t("missing_admin_id"));
      setOk(false);
      return;
    }
    if (!admin || !admin.uid) {
      throw new Error("User not found in localStorage");
    }

    const adminId = admin.uid;
    const res = await dispatch(
      importLeadsCSV({ file, adminId /* msoffice */ })
    );
    if (importLeadsCSV.fulfilled.match(res)) {
      const { total, success, error } = res.payload;
      setOk(
        t("import_done") +
          ` — ${t("total")}: ${total}, ${t("success")}: ${success}, ${t(
            "error"
          )}: ${error}`
      );
      setErr(false);
      setFile(null);
    } else {
      setErr((res.payload as string) || error || t("failed_to_import"));
      setOk(false);
    }
  };

  const disabled = !file || status === "loading";

  return (
    <LeadSwitcher>
      <Paper sx={{ p: 3 }}>
        {ok && <CustomNotification message={ok} onClose={() => setOk(false)} />}
        {err && (
          <CustomError errorMessage={err} onClose={() => setErr(false)} />
        )}

        <Typography variant="h5" gutterBottom>
          {t("import_csv_file")}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {t("import_leads_by_uploading")}{" "}
          <Link href="/csv/leadsTemplate.csv" underline="hover">
            {t("empty_template")}
          </Link>
          .
        </Typography>

        <Stack spacing={2}>
          <Box>
            <input
              id="csv-input"
              type="file"
              accept=".csv,text/csv"
              onChange={onPick}
              style={{ display: "none" }}
            />
            <label htmlFor="csv-input">
              <Button variant="outlined" component="span">
                {file ? file.name : t("choose_csv")}
              </Button>
            </label>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {t("csv_wont_update_existing")}
            </Typography>
          </Box>

          <Box>
            <Button
              startIcon={<CloudUploadIcon />}
              variant="contained"
              disabled={disabled}
              onClick={onSubmit}
            >
              {status === "loading" ? (
                <CircularProgress size={18} />
              ) : (
                t("import")
              )}
            </Button>
          </Box>

          {/* Optional: show summary again if you want a persistent line */}
          {summary && (
            <Typography variant="body2" color="text.secondary">
              {t("total")}: {summary.total} • {t("success")}: {summary.success}{" "}
              • {t("error")}: {summary.error}
            </Typography>
          )}
        </Stack>
      </Paper>
    </LeadSwitcher>
  );
}
