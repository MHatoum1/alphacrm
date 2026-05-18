import { Box, Paper, Typography, Link } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Very small, static page – no API calls are required.
 */
export default function UsdtWithdrawPage() {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: { xs: 2 } }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t("withdraw_usdt_title")} {/* "USDT Withdraw" */}
        </Typography>

        <Typography variant="body1">
          {t("withdraw_usdt_contact")}{" "}
          <Link href="mailto:info@alphatrust.ai">info@alphatrust.ai</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
