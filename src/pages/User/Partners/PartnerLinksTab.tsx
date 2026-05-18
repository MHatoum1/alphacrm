// src/pages/User/Partners/PartnerLinksTab.tsx
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchPartnerLinks,
  addPartnerLink,
} from "@/redux/slices/partnerLinksSlice";
import { useTranslation } from "react-i18next";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function PartnerLinksTab() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { primary, campaigns } = useAppSelector((s) => s.partnerLinks);
  const uid = JSON.parse(localStorage.getItem("user") || "{}").userID as string;

  const [open, setOpen] = useState(false);
  const [camp, setCamp] = useState("");
  const [url, setUrl] = useState("");
  const [copiedOpen, setCopiedOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (uid) dispatch(fetchPartnerLinks(uid));
  }, [dispatch, uid]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedOpen(true);
    });
  };

  const handleCreate = () => {
    dispatch(
      addPartnerLink({
        user_id: uid,
        campaign: camp,
        bannerLink: url,
      })
    )
      .unwrap()
      .then(() => {
        setSuccessMsg(t("createSuccess"));
        dispatch(fetchPartnerLinks(uid));
        setOpen(false);
        setCamp("");
        setUrl("");
      })
      .catch((err: any) => {
        setErrorMsg(err || t("createError"));
      });
  };

  return (
    <Box>
      <Typography variant="h6">{t("primaryRegistration")}</Typography>
      <TextField
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
        value={primary}
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
        <Typography variant="h6">{t("campaigns")}</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          {t("addNewLink")}
        </Button>
      </Box>

      {successMsg && (
        <CustomNotification
          message={successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}
      {errorMsg && (
        <CustomError errorMessage={errorMsg} onClose={() => setErrorMsg("")} />
      )}

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>{t("campaignCode")}</TableCell>
              <TableCell>{t("redirectLink")}</TableCell>
              <TableCell>{t("trackingLink")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((c, i) => {
              const trackingUrl = `${window.location.origin}/pp/${c.uid}`;
              return (
                <TableRow key={c.uid}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{c.campaign}</TableCell>
                  <TableCell>{c.target_url}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {trackingUrl}
                    </Box>
                    <Tooltip title={t("copyToClipboard")}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        onClick={() => handleCopy(trackingUrl)}
                        sx={{ minWidth: 0, px: 1 }}
                      >
                        {t("copy")}
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#3887BE", color: "#fff" }}>
          {t("createNewCustomLink")}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("campaignCode")}
              value={camp}
              onChange={(e) => setCamp(e.target.value)}
              inputProps={{ maxLength: 64 }}
              helperText={t("maxSymbolsHelper")}
            />
            <TextField
              label={t("optionalRedirect")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t("cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!camp.trim()}
          >
            {t("create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copiedOpen}
        autoHideDuration={2000}
        onClose={() => setCopiedOpen(false)}
        message={t("copiedToClipboard")}
      />
    </Box>
  );
}
