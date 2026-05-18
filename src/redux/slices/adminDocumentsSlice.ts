import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";

export interface FileInfo {
  status: string;
  translation: string | null;
  expiration?: string | null;
  details: Record<string, string>; // ← here
  file_type: string;
}

interface DocumentsState {
  // for table
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
  status: "idle" | "loading" | "failed";
  error: string | null;
  // for editor
  editorInfo: FileInfo | null;
  editorStatus: "idle" | "loading" | "failed";
  editorError: string | null;

  previewStatus: "idle" | "loading" | "failed";
  previewUrl: string;
  previewError: string | null;
}

const initialState: DocumentsState = {
  draw: 0,
  recordsTotal: 0,
  recordsFiltered: 0,
  data: [],
  status: "idle",
  error: null,
  editorInfo: null,
  editorStatus: "idle",
  editorError: null,
  previewStatus: "idle",
  previewUrl: "",
  previewError: null,
};

export interface DataTablesPayload {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}

export const fetchDocuments = createAsyncThunk<
  DataTablesPayload,
  { urlPart: string; gridState: GridState },
  { rejectValue: string }
>(
  "documents/fetchDocuments",
  async ({ urlPart, gridState }, { rejectWithValue }) => {
    try {
      const payload = mapGridStateToDataTablesParams(gridState, {
        urlPart,
        action: "select",
      });
      const resp = await axiosInstance.post("/admindocuments", payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      // The server envelope is { status, message, data: string }
      const body = resp.data;
      // Parse the inner JSON if it's a string:
      const dt: DataTablesPayload =
        typeof body.data === "string" ? JSON.parse(body.data) : body.data;
      return dt;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

/** Fetch single‐file info for editor */
export const fetchDocumentInfo = createAsyncThunk<
  FileInfo,
  { user_id: string; file_name: string },
  { rejectValue: string }
>(
  "documents/fetchInfo",
  async ({ user_id, file_name }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("action", "info");
      form.append("user_id", user_id);
      form.append("file_name", file_name);
      const { data } = await axiosInstance.post("/admindocuments", form);
      return data.data as FileInfo;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

/** Generic action dispatcher for mutations */
export const mutateDocument = createAsyncThunk<
  void,
  {
    user_id: string;
    file_name: string;
    action: string;
    payload?: Record<string, any>;
  },
  { rejectValue: string }
>(
  "documents/mutate",
  async ({ user_id, file_name, action, payload }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("action", action);
      form.append("user_id", user_id);
      form.append("file_name", file_name);
      if (payload) {
        Object.entries(payload).forEach(([k, v]) => form.append(k, String(v)));
      }
      await axiosInstance.post("/admindocuments", form);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteDocument = (args: { user_id: string; file_name: string }) =>
  mutateDocument({
    ...args,
    action: "doc_delete",
  });

export const approveDocument = (args: { user_id: string; file_name: string }) =>
  mutateDocument({
    ...args,
    action: "doc_aprove",
  });

export const declineDocument = (args: { user_id: string; file_name: string }) =>
  mutateDocument({
    ...args,
    action: "doc_decline",
  });

export const setDocumentExpiration = (args: {
  user_id: string;
  file_name: string;
  expiration: string;
}) =>
  mutateDocument({
    ...args,
    action: "doc_expiration",
    payload: { doc_expiration: args.expiration },
  });

export const saveDocumentTranslation = (args: {
  user_id: string;
  file_name: string;
  translation: string;
}) =>
  mutateDocument({
    ...args,
    action: "but_translate",
    payload: { translate: args.translation },
  });

const slice = createSlice({
  name: "admindocuments",
  initialState,
  reducers: {},
  extraReducers: (b) =>
    b
      // ---------- table fetch ----------
      .addCase(fetchDocuments.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(
        fetchDocuments.fulfilled,
        (s, action: PayloadAction<DataTablesPayload>) => {
          s.status = "idle";
          s.draw = action.payload.draw;
          s.recordsTotal = action.payload.recordsTotal;
          s.recordsFiltered = action.payload.recordsFiltered;
          s.data = action.payload.data;
        }
      )
      .addCase(fetchDocuments.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? a.error.message ?? null;
      })

      // ---------- editor info fetch ----------
      .addCase(fetchDocumentInfo.pending, (s) => {
        s.editorStatus = "loading";
        s.editorError = null;
      })
      .addCase(fetchDocumentInfo.fulfilled, (s, a: PayloadAction<FileInfo>) => {
        s.editorStatus = "idle";
        s.editorInfo = a.payload;
      })
      .addCase(fetchDocumentInfo.rejected, (s, a) => {
        s.editorStatus = "failed";
        s.editorError = a.payload ?? a.error.message ?? null;
      })

      // ---------- mutations all share same pending/rejected ----------
      .addMatcher(mutateDocument.pending.match, (s) => {
        s.editorStatus = "loading";
        s.editorError = null;
      })
      .addMatcher(mutateDocument.rejected.match, (s, a) => {
        s.editorStatus = "failed";
        s.editorError = a.payload ?? a.error.message ?? null;
      })
      .addMatcher(mutateDocument.fulfilled.match, (s) => {
        s.editorStatus = "idle";
      }),
});

export default slice.reducer;
