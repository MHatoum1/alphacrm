// src\pages\User\Dashboard\ReferAFriendPreview.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchReferStats,
  generateReferLink,
  resetRefer,
} from "@/redux/slices/referFriendSlice";
import { useTranslation } from "react-i18next";

export default function ReferAFriendPreview() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { link, friends, status, verified, limited, dormant } = useAppSelector(
    (s) => s.refer
  );
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user_id) dispatch(fetchReferStats(user_id));
    return () => {
      dispatch(resetRefer());
    };
  }, [dispatch, user_id]);

  if (status === "loading") {
    return (
      <Box textAlign="center" py={2}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  // Not yet eligible
  if (!verified && !limited && !dormant) {
    return (
      <Paper variant="outlined" sx={{ p: 2, background: "#fff6f6" }}>
        <Typography color="error" gutterBottom>
          {t("refer_need_verification")}
        </Typography>
        <Button
          size="small"
          variant="contained"
          href="/userprofile/personal"
          sx={{ mr: 1 }}
        >
          {t("complete_profile")}
        </Button>
        <Button
          size="small"
          variant="outlined"
          href="/accounts/create_selection/demo"
        >
          {t("create_demo")}
        </Button>
      </Paper>
    );
  }

  // Already have a link: show it + count
  if (link) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={link}
          InputProps={{ readOnly: true }}
          onClick={() => {
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          helperText={copied ? t("link_copied") : ""}
        />
        <Box textAlign="center" mt={1}>
          <Typography component="span" sx={{ mx: 1, fontWeight: 700 }}>
            {friends}
          </Typography>
          <Typography component="span">{t("referred_friends")}</Typography>
        </Box>
      </Paper>
    );
  }

  // else: show “Generate Link”
  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
      <Button
        variant="contained"
        onClick={() => user_id && dispatch(generateReferLink(user_id))}
      >
        {t("generate_link")}
      </Button>
    </Paper>
  );
}
