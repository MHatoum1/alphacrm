// src\pages\User\ClientProfile\tabs\ClientDocumentsTab.tsx
import {
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  Badge,
  Button,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useState, ChangeEvent } from "react";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

import {
  uploadClientDocument,
  previewClientDocument,
  clearPreview,
  FileRecord,
  downloadClientDocument,
} from "@/redux/slices/clientProfileSlice";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/redux/hooks";
import { useOutletContext } from "react-router-dom";

const DOC_LABEL: Record<string, string> = {
  id: "identity",
  address: "address",
  card: "credit_card",
  other: "other",
};

const STATUS_LABEL: Record<string, string> = {
  approved: "approved",
  rejected: "rejected",
  new: "new",
  pending: "pending",
};

// Status badge colors
const STATUS_COLORS: Record<string, "success" | "error" | "warning"> = {
  approved: "success",
  rejected: "error",
  new: "warning",
  pending: "warning",
};

export default function ClientDocumentsTab() {
  const authUser = useSelector((s: RootState) => s.auth.user);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const { reloadProfile } = useOutletContext<{ reloadProfile: () => void }>();

  // State
  const [tab, setTab] = useState("id");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPreviewDoc, setCurrentPreviewDoc] = useState<FileRecord | null>(
    null
  );

  // grab preview info from Redux
  const { previewStatus, previewSrc, previewError } = useSelector(
    (s: RootState) => ({
      previewStatus: s.clientProfile.previewStatus,
      previewSrc: s.clientProfile.previewSrc,
      previewError: s.clientProfile.previewError,
    })
  );
  const [uploadLoading, setUploadLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  // Get files from Redux store
  const files = useSelector((s: RootState) => s.clientProfile.data.files || []);
  const isLoading = useSelector(
    (s: RootState) => s.clientProfile.status === "loading"
  );

  // Snackbars
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Group files by document type
  const byType: Record<string, any[]> = {};
  files?.forEach((f: { doc_type: string | number }) => {
    if (!byType[f.doc_type]) byType[f.doc_type] = [];
    byType[f.doc_type].push(f);
  });
  const types = Object.keys(DOC_LABEL);

  // Handle file upload
  const handleSelectFile = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files?.length) return;
      const file = e.target.files[0];
      setUploadLoading(true);
      await dispatch(
        uploadClientDocument({ user_id: authUser.userID, doctype: tab, file })
      ).unwrap();
      setUploadLoading(false);
      e.target.value = "";
      setSuccessMsg(t("document_uploaded"));
      setOpenSuccess(true);
      reloadProfile();
      setTimeout(() => setOpenSuccess(false), 1000);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
      setTimeout(() => setOpenError(false), 3000);
    }
  };

  // Handle document preview
  const handlePreview = (doc: FileRecord) => {
    setCurrentPreviewDoc(doc);
    dispatch(previewClientDocument(doc.file_name));
    setPreviewOpen(true);
  };

  // Close preview dialog
  const handleClosePreview = () => {
    setPreviewOpen(false);

    setCurrentPreviewDoc(null);
    // revoke & reset
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    dispatch(clearPreview());
  };
  // Generate document preview URL (using the API's preview endpoint)
  const handleDownload = (doc: FileRecord) => {
    dispatch(downloadClientDocument(doc.file_name))
      .unwrap()
      .catch((e) => {
        console.error(e);
        setErrorMsg(t("download_failed"));
        setOpenError(true);
      });
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, border: `1px solid ${theme.palette.divider}` }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {isMobile ? t("documents") : t("documents_tab_title")}
      </Typography>

      {/* Snackbars */}
      {openSuccess && (
        <CustomNotification
          message={successMsg}
          onClose={() => setOpenSuccess(false)}
        />
      )}
      {openError && (
        <CustomError
          errorMessage={errorMsg}
          onClose={() => setOpenError(false)}
        />
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {types.map((txt) => (
          <Tab
            key={txt}
            value={txt}
            label={
              <Badge color="primary" badgeContent={byType[txt]?.length || 0}>
                {t(DOC_LABEL[txt])}
              </Badge>
            }
          />
        ))}
      </Tabs>

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Document list */}
      {!isLoading && (!byType[tab] || byType[tab].length === 0) && (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {t("no_documents_found")}
          </Typography>
        </Box>
      )}

      {!isLoading && byType[tab] && byType[tab].length > 0 && (
        <List>
          {byType[tab].map((doc) => (
            <ListItem
              key={doc.id}
              // switch between row (desktop) and column (mobile)
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 2,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
              }}
            >
              {/* left side: filename + status */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <Typography variant="body1" noWrap sx={{ mr: 5 }}>
                  {doc.file_name}
                </Typography>
                {/* Check if not mobile to display it */}
                {!isMobile && (
                  <Typography variant="body1" color="text.secondary">
                    <Badge
                      badgeContent={t(STATUS_LABEL[doc.status])}
                      color={STATUS_COLORS[doc.status] || "default"}
                    />
                  </Typography>
                )}
              </Box>

              {/* right side: date/type and (on desktop) actions */}
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={1}
                alignItems="center"
                sx={{
                  mt: isMobile ? 1 : 0,
                  width: isMobile ? "100%" : "auto",
                  justifyContent: isMobile ? "space-between" : "flex-end",
                }}
              >
                {isMobile && (
                  <Typography variant="body1" color="text.secondary">
                    <Badge
                      badgeContent={t(STATUS_LABEL[doc.status])}
                      color={STATUS_COLORS[doc.status] || "default"}
                    />
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary">
                  {`${doc.created.slice(
                    0,
                    10
                  )} • ${doc.file_type.toUpperCase()}`}
                </Typography>

                {/* on desktop this will sit next to the date; on mobile it'll wrap below */}
                <Box>
                  <IconButton
                    aria-label="preview"
                    onClick={() => handlePreview(doc)}
                    size="small"
                  >
                    <VisibilityIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    aria-label="download"
                    onClick={() => handleDownload(doc)}
                    size="small"
                  >
                    <CloudDownloadIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              </Stack>
            </ListItem>
          ))}
        </List>
      )}

      {/* Upload button */}
      <Box sx={{ textAlign: "start", mt: 3 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={
            uploadLoading ? <CircularProgress size={20} /> : <CloudUploadIcon />
          }
          disabled={uploadLoading}
        >
          {uploadLoading ? t("uploading") : t("upload_document")}
          <input
            hidden
            type="file"
            onChange={handleSelectFile}
            accept="image/jpeg,image/png,image/gif,application/pdf"
          />
        </Button>
      </Box>

      {/* Document Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        fullWidth // allow it to grow to the container width
        maxWidth="xl" // "xs"|"sm"|"md"|"lg"|"xl" — pick whatever fits
        PaperProps={{
          // further tweak the paper size if you like
          sx: {
            width: "90vw", // 90% of viewport width
            maxHeight: "90vh", // 90% of viewport height
          },
        }}
      >
        <DialogTitle>{t("document_preview")}</DialogTitle>
        <DialogContent
          sx={{
            height: "85vh", // give the content most of that height
            p: 0, // remove extra padding if you want full-bleed
          }}
        >
          {previewStatus === "loading" ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : previewStatus === "failed" ? (
            <Typography color="error" sx={{ textAlign: "center", py: 4 }}>
              {previewError || t("preview_failed")}
            </Typography>
          ) : // instead, make sure previewSrc is non‐empty AND we’re in idle
          previewStatus === "idle" && previewSrc && currentPreviewDoc ? (
            currentPreviewDoc.file_type === "pdf" ? (
              <embed
                src={previewSrc}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{ border: 0 }}
              />
            ) : (
              <Box sx={{ textAlign: "center", height: "100%" }}>
                <img
                  src={previewSrc}
                  alt={currentPreviewDoc.file_name}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              </Box>
            )
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClosePreview}>{t("close")}</Button>
          {previewSrc && previewStatus === "idle" && currentPreviewDoc && (
            <Button
              component="a"
              href={previewSrc}
              download={currentPreviewDoc.file_name}
              startIcon={<CloudDownloadIcon />}
            >
              {t("download")}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification((n) => ({ ...n, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
