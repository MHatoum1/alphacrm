// src/components/Admin/ProfileSidebar.tsx
import {
  Box,
  Avatar,
  Typography,
  Button,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import StatusLabel from "../ui/StatusLabel";
import PrintApproval from "./PrintApproval";
import { useTranslation } from "react-i18next";
import axiosInstance from "@/api/axiosInstance";

interface Props {
  user: any;
  files?: any[];
  approvalDate?: string;
  accountsCount: number;
  pursesCount: number;
  messagesCount: number;
  documentsCount: number;
}

export default function ProfileSidebar({
  user,
  files,
  approvalDate,
  accountsCount,
  pursesCount,
  messagesCount,
  documentsCount,
}: Props) {
  const handleKycDownload = async () => {
    try {
      const form = new URLSearchParams({
        action: "downloadKycPdf",
        user_id: String(user.id),
      });
      const { data } = await axiosInstance.post("/admindetails", form, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `KYC_${user.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();

  const avatarFile = files?.find((f) => f.doc_type === 0 && f.status !== 12355);
  const avatarUrl = avatarFile
    ? `/document/preview/${avatarFile.file_name}`
    : "/dist/avatars/profile-pic.jpg";

  const Counter = ({
    count,
    label,
    statusKey,
  }: {
    count: number;
    label: string;
    statusKey: string;
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        textAlign: "center",
        flex: 1,
        backgroundColor: theme.palette.status[statusKey]?.bg,
        color: theme.palette.status[statusKey]?.color,
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
        {count}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.9 }}>
        {label}
      </Typography>
    </Paper>
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Box textAlign="center">
        <Avatar
          src={avatarUrl}
          sx={{
            width: isSm ? 80 : 128,
            height: isSm ? 80 : 128,
            mx: "auto",
          }}
        />
        <Box
          mt={1}
          display="flex"
          justifyContent="center"
          flexWrap="wrap"
          gap={1}
        >
          <StatusLabel user={user} />
          {user.affiliate && (
            <StatusLabel label="Introducing Broker" statusKey="info" />
          )}
          {user.deleted && <StatusLabel label="ARCHIVED" statusKey="error" />}
        </Box>
      </Box>

      <Grid container spacing={1} mt={3}>
        <Grid item xs={6} sm={3}>
          <Counter
            count={accountsCount}
            label={t("accounts")}
            statusKey="unverified"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Counter count={pursesCount} label={t("purses")} statusKey="green" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Counter
            count={messagesCount}
            label={t("messages")}
            statusKey="pending"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Counter
            count={documentsCount}
            label={t("documents")}
            statusKey="success"
          />
        </Grid>
      </Grid>

      <Box mt={3} display="flex" flexDirection="column" gap={1}>
        <Button
          fullWidth
          href={`/detailed/messenger/${user.id}`}
          variant="outlined"
        >
          {t("send_a_message")}
        </Button>
        <Button fullWidth onClick={handleKycDownload} variant="outlined">
          {t("kyc_pdf_download")}
        </Button>
        {/* approval controls */}
        {user.approved ? (
          /* ✅ already approved → show the printable letter button */
          <PrintApproval user={user} approvalDate={approvalDate ?? ""} />
        ) : (
          /* ❌ not yet approved → show the red “pending approval” tag */
          <StatusLabel label={t("pending_approval")} statusKey="error" />
        )}
      </Box>
    </Paper>
  );
}
