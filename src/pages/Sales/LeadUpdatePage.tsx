// src/pages/LeadUpdatePage.tsx
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  useTheme,
  useMediaQuery,
  Badge as MuiBadge,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/LocalPhone";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createNote,
  fetchLeadUpdate,
  reset,
  saveLeadCommMethod,
  saveLeadStatus,
  Note,
  updateNote,
} from "@/redux/slices/leadDetailsSlice";
import {
  salesLoadClientDocuments,
  salesUploadClientDocument,
  salesPreviewClientDocument,
  salesDownloadClientDocument,
  clearDocsPreview,
  type FileRecord,
} from "@/redux/slices/salesClientSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { clearFeedback } from "@/redux/slices/leadDetailsSlice";
import { useTranslation } from "react-i18next";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

/* ────────────────────────────────────────────────────────────────── */
export default function LeadUpdatePage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ─── current user id ────────────────────────────────────── */
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string;

  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const {
    status,
    error,
    lead,
    notes,
    feedback,
    feedbackError,
  } = useAppSelector((s) => s.leadDetails);

  /* ───────── Documents selectors (from salesClientSlice) ───────── */
  const {
    files,
    status: docsStatus,
    previewStatus,
    previewSrc,
    previewError,
  } = useAppSelector((s) => s.salesClient.docs);

  /* local state */
  const [editOpen, setEditOpen] = useState(false);

  /* ───────── LOCAL STATE – add two separate draft fields ───────── */
  const [noteOnly, setNoteOnly] = useState(""); // plain note
  const [noteRem, setNoteRem] = useState(""); // note with reminder
  const [remDate, setRemDate] = useState(""); // reminder date

  /* NEW – drafts that mirror the two <TextField/>s */
  const [commDraft, setCommDraft] = useState(""); // communications
  const [statusDraft, setStatusDraft] = useState(""); // lead-status

  /* ------------------------------------------------------------------ */
  /*  local editing state (put them next to the other useState hooks)   */
  /* ------------------------------------------------------------------ */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMsg, setEditMsg] = useState("");
  const [editDate, setEditDate] = useState<string | null>(null);

  /* ───────── Documents dialog state ───────── */
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsTab, setDocsTab] = useState<"id" | "address" | "card" | "other">(
    "id"
  );
  const [currentPreviewDoc, setCurrentPreviewDoc] = useState<FileRecord | null>(
    null
  );

  /* Resolve the profile user_id required by /userprofiles */
  const profileUserId = useMemo(() => {
    // Adjust the order to match your backend payload shape

    return (
      (lead as any)?.id ??
      (lead as any)?.profile_id ??
      (lead as any)?.user_id ??
      (lead as any)?.client_user_id ??
      null
    );
  }, [lead]);

  /* ───────── Documents helpers ───────── */
  const byType = useMemo(() => {
    return files.reduce<Record<string, FileRecord[]>>((acc, f) => {
      (acc[f.doc_type] ||= []).push(f);
      return acc;
    }, {});
  }, [files]);

  /* labels & colors for docs */
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
  const STATUS_COLORS: Record<string, "success" | "error" | "warning"> = {
    approved: "success",
    rejected: "error",
    new: "warning",
    pending: "warning",
  };

  /* refill drafts whenever the lead is (re-)loaded */
  useEffect(() => {
    if (lead) {
      setCommDraft(lead.commMethod ?? "");
      setStatusDraft(lead.leadStatus ?? "");
    }
  }, [lead]);

  /* load / cleanup */
  useEffect(() => {
    if (id) dispatch(fetchLeadUpdate(+id));
    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);

  /* When the docs dialog opens, load the files for that profile */
  useEffect(() => {
    if (docsOpen && profileUserId) {
      dispatch(salesLoadClientDocuments({ user_id: String(profileUserId) }));
    }
  }, [docsOpen, profileUserId, dispatch]);

  /* loading & error for the lead itself */
  if (status === "loading" || status === "idle")
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  if (status === "failed")
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">
          {error ?? t("failed_to_load_lead")}
        </Typography>
      </Box>
    );
  if (!lead) return null;

  /* ───────── HANDLERS ───────── */
  const addPlainNote = () => {
    if (!noteOnly.trim()) return;
    dispatch(createNote({ user_id: user_id, id: +id!, note: noteOnly.trim() })); // <-- no date
    setNoteOnly("");
  };

  const addReminder = () => {
    if (!noteRem.trim() || !remDate) return;
    dispatch(
      createNote({
        user_id: user_id,
        id: +id!,
        note: noteRem.trim(),
        future_date: remDate,
      })
    );
    setNoteRem("");
    setRemDate("");
  };

  /* called *only* by the “Add …” buttons */
  const handleComm = () =>
    dispatch(saveLeadCommMethod({ user_id, id: +id!, method: commDraft }));
  const handleStat = () =>
    dispatch(saveLeadStatus({ user_id, id: +id!, status: statusDraft }));

  /* when the pencil icon is clicked ---------------------------------- */
  const startEdit = (n: Note) => {
    setEditingId(n.id);
    setEditMsg(n.note);
    setEditDate(n.future_date ?? null);
    setEditOpen(true);
  };

  /* save – call your update-note thunk here -------------------------- */
  const handleSave = async () => {
    if (!editingId) return;

    await dispatch(
      updateNote({
        user_id,
        id: +id!,
        note_id: editingId,
        note: editMsg.trim(),
        future_date: editDate, // can be null
      })
    );
    setEditOpen(false);
  };

  const commOptions = [
    { value: "phone", label: t("phone") },
    { value: "email", label: t("email") },
    { value: "whatsapp", label: t("whatsapp") },
    { value: "facetoface", label: t("face_to_face") }, // normalized key
  ];

  const statusOptions = [
    { value: "Potential", label: t("potential") },
    { value: "Callback", label: t("callback") },
    { value: "Depositor", label: t("depositor") },
    { value: "Duplicate", label: t("duplicate") },
    { value: "Language barrier", label: t("language_barrier") },
    { value: "No answer", label: t("no_answer") },
    { value: "Not interested", label: t("not_interested") },
    { value: "Wrong/invalid details", label: t("wrong_invalid_details") },
    { value: "Registered", label: t("registered") },
    { value: "Do Not Contact", label: t("do_not_contact") }
  ];


  const handlePreviewDoc = (doc: FileRecord) => {
    setCurrentPreviewDoc(doc);
    dispatch(salesPreviewClientDocument(doc.file_name));
  };

  const handleDownloadDoc = (doc: FileRecord) => {
    dispatch(salesDownloadClientDocument(doc.file_name));
  };

  const handleUploadDoc: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    if (!profileUserId || !e.target.files?.length) return;
    try {
      const file = e.target.files[0];
      await dispatch(
        salesUploadClientDocument({
          user_id: String(profileUserId),
          doctype: docsTab,
          file,
        })
      ).unwrap();
    } finally {
      e.target.value = "";
    }
  };

  const handleCloseDocs = () => {
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    dispatch(clearDocsPreview());
    setCurrentPreviewDoc(null);
    setDocsOpen(false);
  };

  return (
    <Paper sx={{ p: 0 }}>
      {/* ---- global toast messages -------------------------------- */}
      {feedback && (
        <CustomNotification
          message={t(feedback)}
          onClose={() => dispatch(clearFeedback())}
        />
      )}
      {feedbackError && (
        <CustomError
          errorMessage={t(feedbackError)}
          onClose={() => dispatch(clearFeedback())}
        />
      )}
      {/* —— banner ——————————————————————————————————————————— */}
      <Box sx={{ px: 2, py: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontWeight={600}>{lead.name}</Typography>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* —— top info line —— */}
        <Grid container spacing={1} alignItems="center" mb={2}>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <EmailIcon sx={{ fontSize: 16, color: "#c62828" }} />
              <a href={`mailto:${lead.email}`}>{lead.email}</a>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PhoneIcon sx={{ fontSize: 16, color: "#c62828" }} />
              <a href={`tel:${lead.phone}`}>{lead.phone}</a>
            </Stack>
          </Grid>
        
        </Grid>

    

        {/* —— plain note row —— */}
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              size="small"
              label={t("add_note")}
              value={noteOnly}
              onChange={(e) => setNoteOnly(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ height: 42 }}
              onClick={addPlainNote}
            >
              {t("add_note")}
            </Button>
          </Grid>
        </Grid>

        {/* —— note + reminder row —— */}
        <Grid container spacing={2} alignItems="center" mb={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t("add_note_with_reminder")}
              value={noteRem}
              onChange={(e) => setNoteRem(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("calendar_reminder")}
                value={remDate ? dayjs(remDate) : null}
                onChange={(val) =>
                  setRemDate(val ? val.format("YYYY-MM-DD") : "")
                }
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ height: 42 }}
              onClick={addReminder}
            >
              {t("add_reminder")}
            </Button>
          </Grid>
        </Grid>

        {/* —— method / status rows —— */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={9}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("method_of_communications")}
              value={commDraft}
              onChange={(e) => setCommDraft(e.target.value)}
            >
              {commOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ height: 40, mt: { xs: 1, sm: 0 } }}
              onClick={handleComm}
            >
              {t("add_method")}
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={9}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("lead_status")}
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ height: 40, mt: { xs: 1, sm: 0 } }}
              onClick={handleStat}
            >
              {t("add_lead_status")}
            </Button>
          </Grid>
        </Grid>

        {/* —— notes header —— */}
        <Grid container sx={{ fontWeight: 600, mb: 1 }}>
          <Grid item xs={12} sm={5}>
            {t("note")}
          </Grid>
          <Grid item xs={12} sm={3}>
            {t("commenter")}
          </Grid>
          <Grid item xs={12} sm={2}>
            {t("reminder_date")}
          </Grid>
          <Grid item xs={12} sm={2}>
            {t("modified_date")}
          </Grid>
        </Grid>

        {/* —— notes list —— */}
        {notes.length === 0 ? (
          <Grid container alignItems="center" sx={{ mb: 0.5 }}>
            <Grid
              item
              xs={12}
              sm={12}
              sx={{ textAlign: "center", color: "text.secondary" }}
            >
              {t("no_available_notes")}
            </Grid>
          </Grid>
        ) : (
          notes.map((n) => (
            <Grid container key={n.id} alignItems="center" sx={{ mb: 0.5 }}>
              <Grid item xs={12} sm={5}>
                {n.note}
              </Grid>
              <Grid item xs={12} sm={3}>
                {n.sales_name}
              </Grid>
              <Grid item xs={12} sm={2}>
                {n.future_date ? dayjs(n.future_date).format("YYYY-MM-DD") : ""}
              </Grid>
              <Grid item xs={11} sm={1}>
                {dayjs(n.modified).format("YYYY-MM-DD")}
              </Grid>
              <Grid item xs={1}>
                <IconButton size="small" onClick={() => startEdit(n)}>
                  <EditIcon fontSize="inherit" />
                </IconButton>
              </Grid>
            </Grid>
          ))
        )}
      </Box>

      {/* —— documents dialog —— */}
      <Dialog open={docsOpen} onClose={handleCloseDocs} maxWidth="lg" fullWidth>
        <DialogTitle>
          {t("documents")} — {lead.name}
        </DialogTitle>

        <DialogContent dividers>
          {/* simple type buttons act like tabs */}
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
            {(["id", "address", "card", "other"] as const).map((k) => (
              <Button
                key={k}
                size="small"
                variant={docsTab === k ? "contained" : "outlined"}
                onClick={() => setDocsTab(k)}
              >
                <MuiBadge color="primary" badgeContent={byType[k]?.length || 0}>
                  {t(DOC_LABEL[k])}
                </MuiBadge>
              </Button>
            ))}
          </Stack>

          {/* loading / empty / list */}
          {docsStatus === "loading" ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : !byType[docsTab] || byType[docsTab].length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                {t("no_documents_found")}
              </Typography>
            </Box>
          ) : (
            <Paper variant="outlined">
              <List>
                {byType[docsTab].map((doc) => (
                  <ListItem
                    key={doc.id}
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 2,
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                    }}
                  >
                    {/* left: filename + status */}
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
                      {!isMobile && (
                        <Typography variant="body1" color="text.secondary">
                          <MuiBadge
                            badgeContent={t(STATUS_LABEL[doc.status] || "new")}
                            color={
                              STATUS_COLORS[
                                doc.status as keyof typeof STATUS_COLORS
                              ] || "warning"
                            }
                          />
                        </Typography>
                      )}
                    </Box>

                    {/* right: meta + actions */}
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
                          <MuiBadge
                            badgeContent={t(STATUS_LABEL[doc.status] || "new")}
                            color={
                              STATUS_COLORS[
                                doc.status as keyof typeof STATUS_COLORS
                              ] || "warning"
                            }
                          />
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {`${doc.created.slice(
                          0,
                          10
                        )} • ${doc.file_type.toUpperCase()}`}
                      </Typography>
                      <Box>
                        <IconButton
                          aria-label="preview"
                          onClick={() => handlePreviewDoc(doc)}
                          size="small"
                        >
                          <VisibilityIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          aria-label="download"
                          onClick={() => handleDownloadDoc(doc)}
                          size="small"
                        >
                          <CloudDownloadIcon fontSize="inherit" />
                        </IconButton>
                      </Box>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* inline preview */}
          <Box sx={{ mt: 2 }}>
            {previewStatus === "loading" ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : previewStatus === "failed" ? (
              <Typography color="error" sx={{ textAlign: "center", py: 2 }}>
                {previewError || t("preview_failed")}
              </Typography>
            ) : previewStatus === "idle" && previewSrc && currentPreviewDoc ? (
              currentPreviewDoc.file_type === "pdf" ? (
                <embed
                  src={previewSrc}
                  type="application/pdf"
                  width="100%"
                  height={isMobile ? 400 : 600}
                  style={{ border: 0 }}
                />
              ) : (
                <Box sx={{ textAlign: "center" }}>
                  <img
                    src={previewSrc}
                    alt={currentPreviewDoc.file_name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: isMobile ? 400 : 600,
                    }}
                  />
                </Box>
              )
            ) : null}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Box>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              disabled={!profileUserId}
            >
              {t("upload_document")}
              <input
                hidden
                type="file"
                onChange={handleUploadDoc}
                accept="image/jpeg,image/png,image/gif,application/pdf"
              />
            </Button>
          </Box>
          <Button onClick={handleCloseDocs}>{t("close")}</Button>
        </DialogActions>
      </Dialog>

      {/* —— edit-note dialog —— */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>{t("edit_note")}</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {/* note text -------------------------------------------------- */}
            <TextField
              fullWidth
              label={t("note")}
              value={editMsg}
              onChange={(e) => setEditMsg(e.target.value)}
            />

            {/* date-picker only when this note already *has* a reminder --- */}
            {editDate !== null && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t("reminder_date")}
                  value={dayjs(editDate)}
                  onChange={(val) =>
                    setEditDate(val ? val.format("YYYY-MM-DD") : null)
                  }
                  slotProps={{
                    textField: { fullWidth: true }, // <- replaces renderInput
                  }}
                />
              </LocalizationProvider>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{t("cancel")}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
