// src/redux/slices/adminProfileReviewSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export interface FileRecord {
  id: number;
  file_name: string;
  file_type: string;
  doc_type: string;
  status: string;
  created: string;
  preview: string;
  url: string;
}

/** 🔑 describe every field you will ever show/edit in the tabs */
export interface Profile {
  id: string;
  title?: string;
  name?: string;
  passport?: string;
  birth_date?: string; // still DD/MM/YYYY from backend
  // …add the rest of the attributes as they arrive from PHP …
  [key: string]: any; // ← keeps it flexible
  agreements?: string[]; // ← add
}

interface ReviewState {
  status: "idle" | "loading" | "failed";
  data: Partial<Profile> & { files?: FileRecord[] };
  error?: string | null;
  previewStatus: "idle" | "loading" | "failed";
  previewSrc: string;
  previewError: string | null;
}

const initialState: ReviewState = {
  status: "idle",
  data: { files: [] },
  error: null,
  previewStatus: "idle",
  previewSrc: "",
  previewError: null,
};

/* ---------- async thunks ---------- */
export const loadProfile = createAsyncThunk<
  { data: Partial<Profile>; files?: FileRecord[] }, // payload type
  string, // argument: id
  { rejectValue: string }
>("profileReview/load", async (id: string, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({ action: "getProfile", id });
    const { data } = await axiosInstance.post("/adminprofiles", body);
    // backend returns { status: 'success', data: { …profile… } }
    return data; // we expect data.data to be the profile object
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to load profile");
  }
});

export const previewDocument = createAsyncThunk<
  string, // returns an object-URL
  string, // arg: filename
  { rejectValue: string }
>("profileReview/previewDocument", async (filename, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "previewDocument");
    form.append("filename", filename);

    // Use axios, ask for a blob
    const resp = await axiosInstance.post("/adminprofiles", form, {
      // withCredentials: true,      // if your server uses cookies
      responseType: "blob", // IMPORTANT: treat the response as raw bytes
    });

    // resp.data is now a Blob
    return URL.createObjectURL(resp.data);
  } catch (err: any) {
    return rejectWithValue(
      err.response?.statusText || err.message || "Failed to load preview"
    );
  }
});

export const updateProfile = createAsyncThunk<
  void, // no payload used in reducer
  { id: string; section: string; fields: Record<string, any> }, // arg type
  { rejectValue: string }
>("profileReview/update", async (p, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "update",
      id: p.id,
      update: p.section,
      ...p.fields,
    });
    await axiosInstance.post("/adminprofiles", body);
    // no return needed
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to update profile");
  }
});

// Upload a single document
export const uploadDocument = createAsyncThunk<
  FileRecord[], // payload: array of FileRecord
  { userId: string; doctype: string; file: File }, // arg type
  { rejectValue: string }
>(
  "profileReview/uploadDocument",
  async ({ userId, doctype, file }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("action", "uploadDocument");
      form.append("user_id", userId);
      form.append("doctype", doctype);
      form.append("file", file);

      const { data } = await axiosInstance.post("/adminprofiles", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // PHP returns { status, message, data: { files: FileRecord[] } }
      return data.data.files;
    } catch (e: any) {
      return rejectWithValue(e.message || "Failed to upload document");
    }
  }
);

export const downloadDocument = createAsyncThunk<
  void, // <-- no payload
  string, // filename
  { rejectValue: string }
>("profileReview/downloadDocument", async (filename, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "downloadDocument");
    form.append("filename", filename);

    const resp = await axiosInstance.post("/adminprofiles", form, {
      responseType: "blob",
    });
    // → resp.data is a Blob, but we never return it

    // trigger download here:
    const url = URL.createObjectURL(resp.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    // thunk returns void
  } catch (e: any) {
    return rejectWithValue(e.message || "Download failed");
  }
});

/* ---------- slice ---------- */
const slice = createSlice({
  name: "profileReview",
  initialState,
  reducers: {
    clearPreview(state) {
      if (state.previewSrc) {
        URL.revokeObjectURL(state.previewSrc);
      }
      state.previewSrc = "";
      state.previewStatus = "idle";
      state.previewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ─── loadProfile ───────────────────────────────────────── */
      .addCase(loadProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload.data ?? {};
        if (action.payload.files) {
          state.data.files = action.payload.files;
        }
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Error";
      })

      /* ─── updateProfile ──────────────────────────────────────── */
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "idle";
        // Write back the fields that were sent in the action
        const { fields } = action.meta.arg as {
          id: string;
          section: string;
          fields: Record<string, any>;
        };
        state.data = { ...state.data, ...fields };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Save failed";
      })

      /* ─── uploadDocument ─────────────────────────────────────── */
      .addCase(uploadDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.status = "idle";
        state.data.files = action.payload;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Upload failed";
      }) /* ─── previewDocument ─────────────────────────────────────── */
      .addCase(previewDocument.pending, (state) => {
        state.previewStatus = "loading";
        state.previewError = null;
      })
      .addCase(previewDocument.fulfilled, (state, action) => {
        state.previewStatus = "idle";
        state.previewSrc = action.payload;
      })
      .addCase(previewDocument.rejected, (state, action) => {
        state.previewStatus = "failed";
        state.previewError =
          action.payload ?? action.error.message ?? "Preview failed";
      });
  },
});

export const { clearPreview } = slice.actions;
export default slice.reducer;
