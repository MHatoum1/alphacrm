import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchReferStats,
  generateReferLink,
  resetRefer,
} from "@/redux/slices/referFriendSlice";
import SocialShare from "@/components/SocialShare";
export default function ReferAFriendPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const uid = user?.userID as string | undefined;

  const { link, friends, status, verified, limited, dormant } = useAppSelector(
    (s) => s.refer
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (uid) dispatch(fetchReferStats(uid));
    return () => {
      dispatch(resetRefer());
    };
  }, [uid, dispatch]);

  if (status === "loading")
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const notEligible = !verified && !limited && !dormant;

  return (
    <Box sx={{ p: { xs: 2 } }}>
      <Paper
        sx={{
          p: 3,
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box flex={1}>
          <Typography variant="h5" color="error" gutterBottom>
            {t("refer_title")}
          </Typography>

          <Typography paragraph>{t("refer_p1")}</Typography>

          {notEligible && (
            <Paper
              sx={{ p: 2, background: "#FFE8E8", border: "1px solid #f00" }}
            >
              <Typography color="error" fontWeight={700}>
                {t("refer_need_verification")}
              </Typography>
              <Button
                variant="contained"
                href="/userprofile/personal"
                sx={{ mr: 1 }}
              >
                {t("complete_profile")}
              </Button>
              <Button variant="outlined" href="/accounts/create_selection/demo">
                {t("create_demo")}
              </Button>
            </Paper>
          )}

          {!notEligible && link && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap", // ↳ stacks nicely on narrow screens
                  my: 2,
                }}
              >
                <TextField
                  //   fullWidth
                  value={link}
                  size="small"
                  sx={{
                    flexGrow: 1,
                    mr: { xs: 0, sm: 2 }, // 16 px space on desktop – none when stacked
                    mb: { xs: 1, sm: 0 }, // small gap below when stacked
                  }}
                  InputProps={{ readOnly: true }}
                />

                <Button
                  variant="contained"
                  onClick={handleCopy}
                  sx={{ px: 3 /* a bit wider */, minWidth: 120 }}
                >
                  {copied ? t("link_copied") : t("copy_link")}
                </Button>
              </Box>

              <Paper
                sx={{
                  p: 2,
                  textAlign: "start",
                  mb: 2,
                  maxWidth: "calc(100% - 140px)",
                }}
              >
                <Typography component="span" sx={{ mx: 1, fontWeight: 700 }}>
                  {friends}
                </Typography>
                <Typography component="span">
                  {t("referred_friends")}
                </Typography>
              </Paper>
              {/* ─────── SHARE ON SOCIAL MEDIA ───────────────── */}
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mt: 3, mb: 1, textAlign: "start" }}
              >
                {t("share_on_social")}
              </Typography>
              <SocialShare link={link} />
            </>
          )}

          {!notEligible && !link && (
            <Button
              variant="contained"
              onClick={() =>
                uid &&
                dispatch(generateReferLink(uid)).then(() => {
                  dispatch(fetchReferStats(uid!));
                })
              }
            >
              {t("generate_link")}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
