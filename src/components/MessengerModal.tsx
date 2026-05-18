// src/components/MessengerModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchMessages,
  closeNotifications,
  clearMessages,
} from "@/redux/slices/messengerSlice";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MessengerModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  /* ⓐ pull the counter as well */
  const { messages, listStatus, count } = useAppSelector((s) => s.messenger);
  const uid: string | undefined = JSON.parse(
    localStorage.getItem("user") ?? "{}"
  )?.userID;

  /* ⓑ fetch messages on open */
  useEffect(() => {
    if (open && uid) dispatch(fetchMessages({ user_id: uid }));
  }, [open, uid, dispatch]);

  /* ⓒ after “mark as read”, clear list + badge */
  const handleRead = () => {
    if (!uid) return;
    dispatch(closeNotifications({ user_id: uid }))
      .unwrap()
      .then(() => dispatch(clearMessages()));
  };

  /* ⓓ decide what to render */
  let body: React.ReactNode;
  if (listStatus === "loading") {
    body = <CircularProgress />;
  } else if (count === 0) {
    body = t("messenger_no_notifications");
  } else {
    body = (
      <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
        {messages.map((r) => (
          <li key={r.id}>{r.message}</li>
        ))}
      </ul>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: "#3887BE", color: "#fff" }}>
        {t("messages")}
      </DialogTitle>

      <DialogContent dividers>{body}</DialogContent>

      <DialogActions>
        <Button onClick={handleRead} disabled={count === 0}>
          {t("messenger_mark_as_read")}
        </Button>
        <Button onClick={onClose}>{t("close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
