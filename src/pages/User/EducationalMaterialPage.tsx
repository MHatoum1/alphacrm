/*  EducationalMaterialPage.tsx  */
import { Box, Button, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function EducationalMaterialPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const theme = useTheme();
  const isRtl = i18n.dir() === "rtl";

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* top row ------------------------------------------------ */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isRtl ? "flex-end" : "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: theme.palette.error.main, flexGrow: 1 }}
        >
          {t("trading_professional")}
        </Typography>

        <Button
          variant="contained"
          color="error"
          onClick={() => nav("/deposit")}
          sx={{ minWidth: 150 }}
        >
          {t("make_a_deposit")}
        </Button>
      </Box>

      {/* description text -------------------------------------- */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          {t("key_level_educational_videos")}
        </Typography>
        <Typography variant="body1">
          {t("gain_information_rookie_to_expert")}
        </Typography>
      </Box>

      {/* video ------------------------------------------------- */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: isRtl ? "flex-end" : "flex-start",
        }}
      >
        <iframe
          src="https://player.vimeo.com/video/193590446?h=4bc9ed671a"
          style={{ border: 0 }}
          width="640"
          height="360"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Alpha Trust AI educational video"
        />
      </Box>
    </Box>
  );
}
