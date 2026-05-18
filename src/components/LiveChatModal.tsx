// src/components/LiveChatModal.tsx
import { Dialog, DialogContent } from "@mui/material";

export default function LiveChatModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        <iframe
          title="livechat"
          src="https://secure.livechatinc.com/licence/1567891/v2/open_chat.cgi?groups=1"
          width="400"
          height="450"
          style={{ border: 0 }}
        />
      </DialogContent>
    </Dialog>
  );
}
