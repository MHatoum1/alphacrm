import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Paper, Typography, Link, CircularProgress, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import CustomError from "@/components/ui/CustomError";
import { fetchReferral } from "@/redux/slices/adminDetailsSlice";

export default function ReferralsPage() {
  const { id: user_id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        if (!user_id) return;
        const data = await fetchReferral(user_id);
        setLink(data.link);
        setCount(data.registrations);
      } catch (e: any) {
        setError(e.message ?? "Load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [user_id]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {error && (
        <CustomError errorMessage={error} onClose={() => setError(null)} />
      )}

      <Typography variant="h5" gutterBottom>
        {t("refer_a_friend")}
      </Typography>

      {link ? (
        <>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <b>{t("link")}:</b>&nbsp;
            <Link href={link} target="_blank" rel="noopener">
              {link}
            </Link>
          </Typography>
          <Typography variant="body1">
            <b>{t("number_of_registrations")}:</b>&nbsp;{count}
          </Typography>
        </>
      ) : (
        <Typography variant="body1">{t("not_participating")}</Typography>
      )}
    </Paper>
  );
}
