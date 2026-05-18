// src/pages/User/ClientProfile/tabs/OverviewPage.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfileOverview,
  createProfileNote,
  updateProfileNote,
  deleteProfileNote,
} from "@/redux/slices/adminProfileOverviewSlice";
import { RootState, AppDispatch } from "@/redux/store";
import { useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import ProfileSidebar from "@/components/Admin/ProfileSidebar";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

import ProfileInfo from "@/components/Admin/ProfileInfo";
import LeadStatusForm from "@/components/Admin/LeadStatusForm";
import NewNoteForm from "@/components/Admin/NewNoteForm";
import NotesTable from "@/components/Admin/NotesTable";

import UpdateNoteModal from "@/components/Admin/UpdateNoteModal";
import { useTranslation } from "react-i18next";
import { addLeadStatus } from "@/redux/slices/userStatusesSlice";

export default function OverviewPage() {
  const { id: user_id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { data, status } = useSelector((s: RootState) => s.profileOverview);
  const { t } = useTranslation();

  const stored = localStorage.getItem("user");
  const authUser = stored ? JSON.parse(stored) : null;

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [editingNote, setEditingNote] = useState<any>(null);
  const handleEditNote = (note: any) => setEditingNote(note);
  const handleCloseEdit = () => setEditingNote(null);
  const handleSaveEdit = async (
    id: number,
    msg: string,
    futureDate?: string
  ) => {
    try {
      await dispatch(
        updateProfileNote({
          admin_id: authUser.userID,
          id: String(user.id),
          note_id: id,
          note: msg,
          future_date: futureDate,
        })
      ).unwrap();

      setSuccessMsg(t("note_updated_ok"));
      setOpenSuccess(true);
    } catch (err: any) {
      setErrorMsg(t(err?.message || "note_update_failed"));
      setOpenError(true);
    } finally {
      handleCloseEdit();
    }
  };

  const handleDeleteNote = async (note_id: number) => {
    if (!window.confirm(t("confirm_delete_note"))) return;
    try {
      await dispatch(
        deleteProfileNote({
          admin_id: authUser.userID,
          id: String(user.id),
          note_id,
        })
      ).unwrap();

      setSuccessMsg(t("note_deleted_ok"));
      setOpenSuccess(true);
    } catch (err: any) {
      setErrorMsg(t(err?.message || "note_delete_failed"));
      setOpenError(true);
    }
  };
  /* ─── local snackbars for notes ─────────────────────────────── */
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user_id) dispatch(fetchProfileOverview(user_id));
  }, [dispatch, user_id]);

  if (status !== "idle" || !data?.user) return null;
  const {
    user,
    files = [],
    notes = [],
    leadStatus,
    approvalDate,
    counts,
  } = data;
  const safeCounts = {
    accounts: counts?.accounts ?? 0,
    purses: counts?.purses ?? 0,
    messages: counts?.messages ?? 0,
    documents: counts?.documents ?? 0,
  };

  const handleStatusChange = async (st: string) => {
    try {
      await dispatch(
        addLeadStatus({ userId: user.id, leadStatus: st })
      ).unwrap();
      dispatch(fetchProfileOverview(user.id));
    } catch (err) {
      console.error(err);
    }
  };

  /* helper */
  const addNote = async (msg: string, type: string, date?: string | null) => {
    try {
      await dispatch(
        createProfileNote({
          admin_id: authUser.userID,
          id: String(user.id),
          note: msg,
          type,
          future_date: date,
        })
      );

      /* refresh list & toast OK */
      // dispatch(fetchProfileOverview(user.id));
      setSuccessMsg(t("note_created_ok", "Note added"));
      setOpenSuccess(true);
      setTimeout(() => setOpenSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(
        t(err?.message || "note_create_failed", "Failed to add note")
      );
      setOpenError(true);
      setTimeout(() => setOpenError(false), 3000);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Responsive header */}
      <Box
        sx={{
          mb: isSm ? 2 : 3,
          display: "flex",
          flexDirection: isSm ? "column" : "row",
          alignItems: isSm ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: isSm ? 1 : 0,
        }}
      >
        <Typography variant="h5">{t("profile_overview")}</Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} sm={4} md={3}>
          <ProfileSidebar
            user={user}
            files={files}
            approvalDate={approvalDate}
            accountsCount={safeCounts.accounts}
            pursesCount={safeCounts.purses}
            messagesCount={safeCounts.messages}
            documentsCount={safeCounts.documents}
          />
        </Grid>

        {/* Main content */}
        <Grid item xs={12} sm={8} md={9}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <ProfileInfo
                user={user}
                assignedSales={leadStatus?.assigned_to}
                campaign={user.campaign}
                ib_link={user.ib_link}
              />
            </Grid>
            <Grid item>
              <Paper sx={{ p: 2 }}>
                <LeadStatusForm
                  currentStatus={leadStatus?.lead_status || ""}
                  onStatusChange={handleStatusChange}
                />
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 2 }}>
                {/* ——— success / error toasts ——— */}
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
                <NewNoteForm onAdd={addNote} />
                <NotesTable
                  notes={notes}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                />
              </Paper>
            </Grid>
            {/* <Grid item>
              <Paper sx={{ p: 2 }}>
                <DocumentsGallery files={files} />
              </Paper>
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>

      <UpdateNoteModal
        note={editingNote}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />
    </Box>
  );
}
