// src/components/Admin/ProfileInfo.tsx
import { Box, Typography, Paper, useTheme, useMediaQuery } from "@mui/material";
import { User } from "@/utils/commonData";
import { useTranslation } from "react-i18next";

interface Props {
  user: User;
  assignedSales?: { name: string; email: string };
  campaign?: string;
  ib_link?: string;
}

const RESTRICTED_EMAILS = new Set([
  "info@alphatrust.ai"
]);

const isRestrictedUser = (): boolean => {
  try {
    const raw = localStorage.getItem("user");
    const email = (raw ? JSON.parse(raw)?.email : "").toLowerCase();
    return RESTRICTED_EMAILS.has(email);
  } catch {
    return false;
  }
};

export default function ProfileInfo({ user, assignedSales, campaign, ib_link }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const infoRows: [string, string][] = [
    [t("file_number"), user.filenum],
    [t("name"), user.name],
    [t("email"), user.email],
    [
      t("location"),
      `${user.country}, ${user.zip} ${user.city}, ${user.address}`,
    ],
    [t("birth_date"), user.birth_date],
    [t("phone"), user.phone],
    [t("mobile_phone"), user.mobile_phone],
    [t("nationality"), user.nationality],
    [t("fatca"), user.fatca ? `YES (${user.fatca_number})` : "NO"],
    [t("created_date"), new Date(user.created).toLocaleDateString()],
  ];

  if (assignedSales) {
    infoRows.push([
      t("sales"),
      `${assignedSales.name} <${assignedSales.email}>`,
    ]);
  }
  const restricted = isRestrictedUser();

  if (campaign && !restricted) {
    infoRows.push([t("campaign"), campaign]);
  }

  if (ib_link && !restricted) {
    infoRows.push([t("ib_link"), ib_link]);
  }

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {infoRows.map(([label, value]) => (
        <Box
          key={label}
          display="flex"
          flexDirection={isSm ? "column" : "row"}
          mb={1}
          sx={{ width: "100%" }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              width: isSm ? "100%" : 150,
              mb: isSm ? 0.5 : 0,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              flex: 1,
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}
