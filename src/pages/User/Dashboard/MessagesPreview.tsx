import { useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchMessages } from "@/redux/slices/messengerSlice";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface Props {
  limit?: number;
}

export default function MessagesPreview({ limit = 5 }: Props) {
  const dispatch = useAppDispatch();
  // pull user_id from localStorage (or however you store it)
  const stored = localStorage.getItem("user");
  const uid = stored ? JSON.parse(stored).userID : undefined;

  const { messages, listStatus } = useAppSelector((s) => s.messenger);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (uid) dispatch(fetchMessages({ user_id: uid, limit: limit }));
  }, [dispatch, limit]);

  if (listStatus === "loading") {
    return (
      <Box textAlign="center" py={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }



  return (
    <Paper elevation={2} sx={{
    p: 2,
          borderRadius: "12px",
   backgroundColor: theme.palette.background.paper,
   color: theme.palette.text.primary,
   height: '100%',
   display: 'flex',
   flexDirection: 'column',
      }}>
      <Typography variant="h6" gutterBottom>
        {t("messages")}
      </Typography>
      <List disablePadding>
        {messages.map((m, i) => (
          <ListItem key={i} divider>
            <ListItemText
              primary={<Typography variant="body2">{m.message}</Typography>}
              secondary={
                <Typography
                  variant="caption"
                  color={theme.palette.text.secondary}
                >
                  {dayjs(m.created).format("DD MMM")}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
