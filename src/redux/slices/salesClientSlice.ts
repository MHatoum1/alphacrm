// src/redux/slices/salesClientSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";

/* keep the exact filter type the page already builds */
export interface ClientFilters {
  date_from: string;
  date_to: string;
  phase: string;
  funded: string;
  country: string;
  source: string;
  status: string;
  partnership: string;
  campaign: string;
}

/* ─────────── types ─────────── */
export interface ClientRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  phase: string;
  source: string;
  partnership: string;
  campaign: string;
  status: string;
  created: string;
  funded: string;
}

export interface DropOption {
  value: string;
  text: string;
}

/* ─────────── docs (moved in here) ─────────── */
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

type LoadState = "idle" | "loading" | "failed" | "succeeded";

interface DocsState {
  status: LoadState;            // loading files / upload state
  files: FileRecord[];
  error?: string;

  previewStatus: "idle" | "loading" | "failed";
  previewSrc: string;
  previewError: string | null;

  profileId?: string;           // last loaded profile id (optional)
}

/* ─────────── slice state ─────────── */
interface State {
  rows: any[][]; // ← raw rows, NOT ClientRow[]
  total: number;
  status: "idle" | "loading" | "failed" | "succeeded";
  recordsFiltered: number; // optional, for compatibility

  /* dropdown helpers */
  dropdowns: {
    countries: DropOption[];
    partnerships: DropOption[];
    sources: DropOption[];
    statuses: DropOption[];
    campaigns: DropOption[];
  };
  ddStatus: "idle" | "loading" | "failed" | "succeeded";
  error?: string;

  /* documents (for Sales/Lead pages) */
  docs: DocsState;
}

const initial: State = {
  rows: [],
  total: 0,
  recordsFiltered: 0,
  status: "idle",
  dropdowns: {
    countries: [],
    partnerships: [],
    sources: [],
    statuses: [],
    campaigns: [],
  },
  ddStatus: "idle",
  docs: {
    status: "idle",
    files: [],
    previewStatus: "idle",
    previewSrc: "",
    previewError: null,
    profileId: undefined,
  },
};

/* ─────────── thunks (existing) ─────────── */

/**
 * Fetch dropdown data: countries, partnerships, sources, statuses, campaigns
 */
export const fetchDropdowns = createAsyncThunk<
  State["dropdowns"], // payload type
  void, // no argument
  { rejectValue: string }
>("clients/dropdowns", async (_, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("user_id", "0"); // no ACL on helper lists
    f.append("action", "dropdowns");
    const { data } = await axiosInstance.post("/salesclients", f);
    return data.data as State["dropdowns"];
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to load dropdowns");
  }
});

/**
 * Fetch client rows for the grid.
 * Expects { user_id, gridState, filters }, returns { data: any[][], recordsTotal: number }.
 */
export const fetchClients = createAsyncThunk<
  any,
  { user_id: string; gridState: GridState; filters: ClientFilters },
  { rejectValue: string }
>(
  "clients/listGrid",
  async ({ user_id, gridState, filters }, { rejectWithValue }) => {
    try {
      const form = mapGridStateToDataTablesParams(gridState, {
        action: "list",
        user_id,
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") form.append(key, value);
      });

      const response = await axiosInstance.post("/salesclients", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to fetch clients");
    }
  }
);

/* ─────────── thunks (new: docs) ─────────── */

/** Load only files for a given user profile via /userprofiles:getProfile */
export const salesLoadClientDocuments = createAsyncThunk<
  { files: FileRecord[]; profileId: string },
  { user_id: string },
  { rejectValue: string }
>("clients/loadDocuments", async ({ user_id }, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({ action: "getProfile", user_id });
    const { data } = await axiosInstance.post("/userprofiles", body);
    const files = (data?.data?.files ?? []) as FileRecord[];
    return { files, profileId: String(user_id) };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data || err.message || "Failed to load documents"
    );
  }
});

/** Upload a document and receive the updated files array */
export const salesUploadClientDocument = createAsyncThunk<
  FileRecord[],
  { user_id: string; doctype: string; file: File },
  { rejectValue: string }
>(
  "clients/uploadDocument",
  async ({ user_id, doctype, file }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("user_id", user_id);
      form.append("action", "uploadDocument");
      form.append("doctype", doctype);
      form.append("file", file);
      const { data } = await axiosInstance.post("/userprofiles", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data.files as FileRecord[];
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err.message || "Failed to upload document"
      );
    }
  }
);

/** Get a blob preview and return a blob URL */
export const salesPreviewClientDocument = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("clients/previewDocument", async (filename, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "previewDocument");
    form.append("filename", filename);
    const resp = await axiosInstance.post("/userprofiles", form, {
      responseType: "blob",
    });
    return URL.createObjectURL(resp.data);
  } catch (err: any) {
    return rejectWithValue(err?.response?.statusText || err.message);
  }
});

/** Trigger a file download for a given filename */
export const salesDownloadClientDocument = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("clients/downloadDocument", async (filename, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "downloadDocument");
    form.append("filename", filename);

    const resp = await axiosInstance.post("/userprofiles", form, {
      responseType: "blob",
    });

    const url = URL.createObjectURL(resp.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err: any) {
    return rejectWithValue(err.message || "Download failed");
  }
});

/* ─────────── slice ─────────── */

const salesClientSlice = createSlice({
  name: "clients",
  initialState: initial,
  reducers: {
    /* docs helpers */
    clearDocsPreview(state) {
      if (state.docs.previewSrc) URL.revokeObjectURL(state.docs.previewSrc);
      state.docs.previewSrc = "";
      state.docs.previewStatus = "idle";
      state.docs.previewError = null;
    },
    /* (optional) if you ever need to set files from outside thunks */
    setDocsFiles(state, action: PayloadAction<FileRecord[]>) {
      state.docs.files = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder
      /* fetchDropdowns */
      .addCase(fetchDropdowns.pending, (s) => {
        s.ddStatus = "loading";
        s.error = undefined;
      })
      .addCase(fetchDropdowns.fulfilled, (s, action) => {
        s.ddStatus = "succeeded";
        s.dropdowns = action.payload;
      })
      .addCase(fetchDropdowns.rejected, (s, action) => {
        s.ddStatus = "failed";
        s.error =
          action.payload ?? action.error.message ?? "Dropdown load failed";
      })

      /* fetchClients */
      .addCase(fetchClients.pending, (s) => {
        s.status = "loading";
        s.error = undefined;
      })
      .addCase(fetchClients.fulfilled, (s, action) => {
        s.status = "succeeded";
        const payload =
          typeof action.payload.data === "string"
            ? JSON.parse(action.payload.data)
            : action.payload.data;
        s.rows = payload.data as any[][];
        s.total = payload.recordsTotal;
        s.recordsFiltered = payload.recordsFiltered;
      })
      .addCase(fetchClients.rejected, (s, action) => {
        s.status = "failed";
        s.error =
          action.payload ?? action.error.message ?? "Client fetch failed";
      })

      /* ─────────── docs: load ─────────── */
      .addCase(salesLoadClientDocuments.pending, (s) => {
        s.docs.status = "loading";
        s.docs.error = undefined;
      })
      .addCase(salesLoadClientDocuments.fulfilled, (s, action) => {
        s.docs.status = "succeeded";
        s.docs.files = action.payload.files;
        s.docs.profileId = action.payload.profileId;
      })
      .addCase(salesLoadClientDocuments.rejected, (s, action) => {
        s.docs.status = "failed";
        s.docs.error =
          (action.payload as string) ??
          action.error.message ??
          "Failed to load documents";
      })

      /* ─────────── docs: upload ─────────── */
      .addCase(salesUploadClientDocument.pending, (s) => {
        s.docs.status = "loading";
        s.docs.error = undefined;
      })
      .addCase(salesUploadClientDocument.fulfilled, (s, action) => {
        s.docs.status = "succeeded";
        s.docs.files = action.payload;
      })
      .addCase(salesUploadClientDocument.rejected, (s, action) => {
        s.docs.status = "failed";
        s.docs.error =
          (action.payload as string) ??
          action.error.message ??
          "Failed to upload document";
      })

      /* ─────────── docs: preview ─────────── */
      .addCase(salesPreviewClientDocument.pending, (s) => {
        s.docs.previewStatus = "loading";
        s.docs.previewError = null;
      })
      .addCase(salesPreviewClientDocument.fulfilled, (s, action) => {
        s.docs.previewStatus = "idle";
        s.docs.previewSrc = action.payload;
      })
      .addCase(salesPreviewClientDocument.rejected, (s, action) => {
        s.docs.previewStatus = "failed";
        s.docs.previewError =
          (action.payload as string) ??
          action.error.message ??
          "Preview failed";
      })

      /* ─────────── docs: download ─────────── */
      .addCase(salesDownloadClientDocument.rejected, (s, action) => {
        // no loading flag for download; just store error if any
        s.docs.error =
          (action.payload as string) ??
          action.error.message ??
          "Download failed";
      }),
});

export const { clearDocsPreview, setDocsFiles } = salesClientSlice.actions;
export default salesClientSlice.reducer;
