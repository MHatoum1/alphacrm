// src/pages/Admin/Documents/DocumentEditorPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  // TextField,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchDocumentInfo,
  deleteDocument,
  approveDocument,
  declineDocument,
  setDocumentExpiration,
  // saveDocumentTranslation,
} from "@/redux/slices/adminDocumentsSlice";

import DocumentStatusLabel from "@/components/ui/DocumentStatusLabel";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";

// **NEW** preview logic from profileReview slice
import {
  clearPreview,
  previewDocument as previewDocumentThunk,
} from "@/redux/slices/adminProfileReviewSlice";

export default function DocumentEditorPage() {
  const { userId = "", fileName = "" } = useParams<{
    userId: string;
    fileName: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("md"));

  // local snackbars
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 1) metadata lives in documents slice
  const { editorInfo, editorStatus } = useAppSelector((s) => ({
    editorInfo: s.documents.editorInfo,
    editorStatus: s.documents.editorStatus,
  }));

  // 2) preview lives in profileReview slice
  const { previewStatus, previewSrc, previewError } = useAppSelector((s) => ({
    previewStatus: s.profileReview.previewStatus,
    previewSrc: s.profileReview.previewSrc,
    previewError: s.profileReview.previewError,
  }));

  // fetch metadata
  useEffect(() => {
    dispatch(fetchDocumentInfo({ user_id: userId, file_name: fileName }));
  }, [dispatch, userId, fileName]);

  // once we know the file type, clear old blob & fetch new one
  useEffect(() => {
    if (editorStatus === "idle" && editorInfo?.file_type) {
      dispatch(clearPreview());
      dispatch(previewDocumentThunk(fileName));
    }
  }, [dispatch, editorInfo, editorStatus, fileName]);

  // revoke blob on unmount
  useEffect(() => {
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);

  if (editorStatus === "loading" || !editorInfo) {
    return (
      <Box p={2} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  const reloadInfo = () =>
    dispatch(fetchDocumentInfo({ user_id: userId, file_name: fileName }));

  // Handlers with notifications
  const handleSetExpiration = async (v: Dayjs | null) => {
    if (!v) return;
    try {
      const d = v.format("YYYY-MM-DD");
      await dispatch(
        setDocumentExpiration({
          user_id: userId,
          file_name: fileName,
          expiration: d,
        })
      ).unwrap();
      setSuccessMsg(t("expiration_set"));
      reloadInfo(); // ← re-fetch to update status/expiration
    } catch (e: any) {
      setErrorMsg(t("expiration_failed"));
    }
  };

  const handleApprove = async () => {
    try {
      await dispatch(
        approveDocument({ user_id: userId, file_name: fileName })
      ).unwrap();
      setSuccessMsg(t("approval_success"));
      reloadInfo(); // ← re-fetch to show “approved”
    } catch (e: any) {
      setErrorMsg(t("approval_failed"));
    }
  };
  const handleDecline = async () => {
    try {
      await dispatch(
        declineDocument({ user_id: userId, file_name: fileName })
      ).unwrap();
      setSuccessMsg(t("decline_success"));
      reloadInfo(); // ← re-fetch to show “declined”
    } catch (e: any) {
      setErrorMsg(t("decline_failed"));
    }
  };
  return (
    <Box p={2}>
      {/* SNACKBARS */}
      {successMsg && (
        <CustomNotification
          message={successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}
      {errorMsg && (
        <CustomError errorMessage={errorMsg} onClose={() => setErrorMsg("")} />
      )}

      <Typography variant="h5" mb={2}>
        {t("edit_document", { fileName })}
      </Typography>

      <Paper
        elevation={1}
        sx={{
          display: "flex",
          flexDirection: isSm ? "column" : "row",
          height: isSm ? "auto" : "calc(100vh - 100px)",
          // ensure enough space on mobile for the PDF
          minHeight: isSm ? "60vh" : undefined,
          p: 2,
        }}
      >
        {/* ───── LEFT PANEL ───── */}
        <Box
          sx={{
            width: isSm ? "100%" : "30%",
            pr: isSm ? 0 : 2,
            mb: isSm ? 2 : 0,
            overflowY: "auto",
          }}
        >
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>{t("status")}</Typography>
              <DocumentStatusLabel statusKey={t(editorInfo.status)} />
            </Box>

            {editorInfo.details && (
              <Box>
                {Object.entries(editorInfo.details).map(([label, value]) => (
                  <Box key={label} sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      {t(label.toLowerCase())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <span dangerouslySetInnerHTML={{ __html: value }} />
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() =>
                dispatch(
                  deleteDocument({ user_id: userId, file_name: fileName })
                ).then(() => navigate(-1))
              }
            >
              {t("delete")}
            </Button>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("expiration")}
                value={
                  editorInfo.expiration ? dayjs(editorInfo.expiration) : null
                }
                minDate={dayjs()}
                onChange={(value) => {
                  // MUI may pass Moment or Dayjs here depending on adapter,
                  // so we assert it to Dayjs|null
                  void handleSetExpiration(value as Dayjs | null);
                }}
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>

            {/* <TextField
              label="Translation"
              multiline
              rows={4}
              fullWidth
              size="small"
              value={editorInfo.translation ?? ""}
              onChange={(e) =>
                dispatch(
                  saveDocumentTranslation({
                    user_id: userId,
                    file_name: fileName,
                    translation: e.target.value,
                  })
                )
              }
            /> */}

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={handleApprove}
                sx={{ flex: isSm ? 1 : "unset" }}
              >
                {t("approve")}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDecline}
                sx={{ flex: isSm ? 1 : "unset" }}
              >
                {t("decline")}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* ───── RIGHT PANEL ───── */}
        <Box
          sx={{
            flexGrow: 1,
            width: isSm ? "100%" : "70%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            // give the box a minHeight on mobile so embed can fill it
            minHeight: isSm ? "50vh" : undefined,
          }}
        >
          {/* Preview */}
          <Box
            flexGrow={1}
            position="relative"
            sx={{
              // if mobile, let it expand to fill
              minHeight: isSm ? "50vh" : undefined,
            }}
          >
            {previewStatus === "loading" ? (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <CircularProgress />
              </Box>
            ) : previewStatus === "failed" ? (
              <Typography color="error" sx={{ textAlign: "center", mt: 2 }}>
                {previewError || t("preview_failed")}
              </Typography>
            ) : previewStatus === "idle" && previewSrc ? (
              editorInfo.file_type === "pdf" ? (
                <embed
                  src={previewSrc}
                  type="application/pdf"
                  // always fill the parent—on mobile that now has a minHeight
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                />
              ) : (
                <Box
                  component="img"
                  src={previewSrc}
                  alt={fileName}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              )
            ) : (
              <Typography sx={{ mt: 2 }}>{t("no_preview")}</Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
