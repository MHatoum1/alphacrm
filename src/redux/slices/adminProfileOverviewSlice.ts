// src/redux/slices/profileOverviewSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";
import dayjs from "dayjs";

export interface OverviewState {
  status: "idle" | "loading" | "failed";
  error: string | null;
  data: {
    user?: any;
    files?: any[];
    notes?: any[];
    leadStatus?: any;
    approvalDate?: string;
    counts?: {
      accounts: number;
      purses: number;
      messages: number;
      documents: number;
    };
  };
}

// src/redux/slices/profileOverviewSlice.ts
export interface Note {
  id: number;
  type: string; // call | email | note | …
  message: string;
  future_date?: string | null;
  owner_name: string;
  created: string;
}

const initialState: OverviewState = { status: "idle", error: null, data: {} };

// ⚠️ put this *below* fetchProfileOverview in the same file
export const createProfileNote = createAsyncThunk<
  Note, // payload
  {
    admin_id: string;
    id: string;
    note: string;
    type: string;
    future_date?: string | null;
  },
  { rejectValue: string }
>("profileOverview/createNote", async (p, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({
      action: "createnote",
      admin_id: p.admin_id,
      id: p.id,
      note: p.note,
      type: p.type,
      future_date: p.future_date ?? "",
    }).toString();

    const { data } = await axiosInstance.post("/admindetails", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return data.data.note as Note; // ⬅️ API echoes the row
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to save note");
  }
});

// ▼ put right under createProfileNote
export const updateProfileNote = createAsyncThunk<
  {
    note_id: number;
    message: string;
    note: string;
    future_date?: string | null;
    modified: string;
  },
  {
    admin_id: string;
    id: string;
    note_id: number;
    note: string;
    future_date?: string | null;
  },
  { rejectValue: string }
>("profileOverview/updateNote", async (p, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({
      action: "updatenote",
      admin_id: p.admin_id,
      id: p.id,
      note_id: String(p.note_id),
      note: p.note,
      future_date: p.future_date ?? "",
    }).toString();

    const { data } = await axiosInstance.post("/admindetails", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return {
      note_id: p.note_id,
      message: data.message, // "note_updated_ok"
      note: p.note,
      future_date: p.future_date,
      modified: dayjs().format("YYYY-MM-DD"),
    };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to update note");
  }
});

export const deleteProfileNote = createAsyncThunk<
  { note_id: number; message: string },
  { admin_id: string; id: string; note_id: number },
  { rejectValue: string }
>("profileOverview/deleteNote", async (p, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({
      action: "deletenote",
      admin_id: p.admin_id,
      id: p.id,
      note_id: String(p.note_id),
    }).toString();

    const { data } = await axiosInstance.post("/admindetails", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return { note_id: p.note_id, message: data.message };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to delete note");
  }
});

export const fetchProfileOverview = createAsyncThunk<
  any, // payload: the raw response
  string, // argument: user_id
  { rejectValue: string }
>("profileOverview/fetch", async (user_id, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({
      action: "getProfileOverview",
      user_id,
    }).toString();

    const res = await axiosInstance.post("/admindetails", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to load profile");
  }
});

const slice = createSlice({
  name: "adminProfileOverview",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOverview.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfileOverview.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload.data;
      })
      .addCase(fetchProfileOverview.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to load profile";
      })
      .addCase(createProfileNote.fulfilled, (s, a) => {
        // push to the top so it pops up immediately
        s.data.notes?.unshift(a.payload);
      })
      .addCase(updateProfileNote.fulfilled, (s, a) => {
        const n = s.data.notes?.find((x) => x.id === a.payload.note_id);
        if (n) {
          n.message = a.payload.note;
          n.future_date = a.payload.future_date;
          n.modified = a.payload.modified;
        }
      })
      .addCase(deleteProfileNote.fulfilled, (s, a) => {
        s.data.notes = s.data.notes?.filter((n) => n.id !== a.payload.note_id);
      });
  },
});

export default slice.reducer;
