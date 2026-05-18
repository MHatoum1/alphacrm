// src/components/ContactFloatingBar.tsx
import { Badge, Box, IconButton, Tooltip, styled } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import MessageIcon from "@mui/icons-material/Message";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import CallbackModal from "@/components/CallbackModal";
import LiveChatModal from "@/components/LiveChatModal";
import MessengerModal from "@/components/MessengerModal";
import { fetchUnreadCount } from "@/redux/slices/messengerSlice";
import { useTranslation } from "react-i18next";

const Bar = styled(Box)({
  position: "fixed",
  right: 0,
  top: "35%",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  paddingRight: 4,
});

export default function ContactFloatingBar() {
  const { t } = useTranslation();
  const [open, set] = useState<"callback" | "chat" | "msg" | null>(null);
  const dispatch = useAppDispatch();
  const unread = useAppSelector((s) => s.messenger.count);

  const cached = localStorage.getItem("user");
  const user = cached ? JSON.parse(cached) : null;
  const isSecureUser = user?.acl === "secure";

  useEffect(() => {
    if (!isSecureUser) return;
    const uid = user?.userID as string | undefined;
    if (uid) dispatch(fetchUnreadCount({ user_id: uid }));
  }, [dispatch, isSecureUser, user]);

  if (!isSecureUser) return null;

  return (
    <>
      <Bar>
        {user?.noneuropean === 0 &&
        <Tooltip title={t("live_chat")} placement="left">
          <IconButton
            size="large"
            sx={{
              bgcolor: "#ee222b",
              color: "#fff",
              "&:hover": { bgcolor: "#d51e26" },
            }}
            onClick={() => set("chat")}
          >
            <ChatIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
}

        <Tooltip title={t("callback")} placement="left">
          <IconButton
            size="large"
            sx={{
              bgcolor: "#21a538",
              color: "#fff",
              "&:hover": { bgcolor: "#1b8a2f" },
            }}
            onClick={() => set("callback")}
          >
            <PhoneIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t("messenger")} placement="left">
          <IconButton
            size="large"
            sx={{
              bgcolor: "#3887BE",
              color: "#fff",
              "&:hover": { bgcolor: "#2e6d96" },
            }}
            onClick={() => set("msg")}
          >
            <Badge badgeContent={unread} color="error">
              <MessageIcon fontSize="inherit" />
            </Badge>
          </IconButton>
        </Tooltip>
      </Bar>

      <CallbackModal open={open === "callback"} onClose={() => set(null)} />
      <LiveChatModal open={open === "chat"} onClose={() => set(null)} />
      <MessengerModal open={open === "msg"} onClose={() => set(null)} />
    </>
  );
}
