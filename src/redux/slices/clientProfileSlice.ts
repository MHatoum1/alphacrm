// src/redux/slices/clientProfileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";
import { RootState } from "../store";

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

export interface ClientProfile {
  id: string;
  title?: string;
  name?: string;
  passport?: string;
  birth_date?: string;
  birth_place?: string;
  phone?: string;
  country?: string;
  country_name?: string;
  city?: string;
  zip?: string;
  region?: string;
  address?: string;
  address2?: string;
  phone_home?: string;
  phone_fax?: string;
  agreements?: string[];
  files?: FileRecord[];
  [key: string]: any;
}

interface ClientProfileState {
  status: "idle" | "loading" | "failed" | "succeeded";
  previewStatus: "idle" | "loading" | "failed";
  previewSrc: string;
  previewError: string | null;
  data: Partial<ClientProfile>;
  error?: string;
}

const initialState: ClientProfileState = {
  status: "idle",
  data: {},
  previewStatus: "idle",
  previewSrc: "",
  previewError: null,
  error: undefined,
};
// at top, after uploadClientDocument:
export const previewClientDocument = createAsyncThunk<
  string, // returns object URL
  string, // filename
  { rejectValue: string }
>("clientProfile/previewDocument", async (filename, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "previewDocument");
    form.append("filename", filename);
    const resp = await axios.post("/userprofiles", form, {
      responseType: "blob",
    });
    return URL.createObjectURL(resp.data);
  } catch (err: any) {
    return rejectWithValue(err.response?.statusText || err.message);
  }
});

export const loadClientProfile = createAsyncThunk<
  ClientProfile, // payload: loaded profile
  { user_id: string }, // arg: user_id
  { rejectValue: string }
>("clientProfile/load", async ({ user_id }, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "getProfile",
      user_id,
    });
    const { data } = await axios.post("/userprofiles", body);
    return data.data as ClientProfile;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data || err.message || "Failed to load profile"
    );
  }
});

export const updateClientProfile = createAsyncThunk<
  void, // we merge fields manually, no payload used
  { user_id: string; section: string; fields: Record<string, any> },
  { rejectValue: string }
>(
  "clientProfile/update",
  async ({ user_id, section, fields }, { rejectWithValue }) => {
    try {
      const body = new URLSearchParams({
        action: "update",
        user_id,
        update: section,
        ...fields,
      });
      await axios.post("/userprofiles", body);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || err.message || "Failed to update profile"
      );
    }
  }
);

export const uploadClientDocument = createAsyncThunk<
  FileRecord[], // payload: array of FileRecord
  { user_id: string; doctype: string; file: File }, // arg
  { rejectValue: string }
>(
  "clientProfile/uploadDocument",
  async ({ user_id, doctype, file }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("user_id", user_id);
      form.append("action", "uploadDocument");
      form.append("doctype", doctype);
      form.append("file", file);
      const { data } = await axios.post("/userprofiles", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data.files as FileRecord[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || err.message || "Failed to upload document"
      );
    }
  }
);

export const resetPassword = createAsyncThunk<
  void,
  string,
  { rejectValue: string; state: RootState }
>(
  "clientProfile/resetPassword",
  async (newPassword, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user.userID;
      const form = new URLSearchParams({
        action: "resetPassword",
        user_id: String(userId),
        new_password: newPassword,
      });
      await axios.post("/userprofiles", form);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const resetPin = createAsyncThunk<
  void,
  string,
  { rejectValue: string; state: RootState }
>("clientProfile/resetPin", async (newPin, { getState, rejectWithValue }) => {
  try {
    const userId = getState().auth.user.userID;
    const form = new URLSearchParams({
      action: "resetPin",
      user_id: String(userId),
      new_pin: newPin,
    });
    await axios.post("/userprofiles", form);
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const requestVerification = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: RootState }
>(
  "clientProfile/requestVerification",
  async (_, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.userID;
    if (!userId) {
      return rejectWithValue("No user logged in");
    }
    try {
      const form = new URLSearchParams({
        action: "verify",
        user_id: String(userId),
      });
      await axios.post("/userprofiles", form);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const downloadClientDocument = createAsyncThunk<
  void, // no payload stored in Redux
  string, // filename
  { rejectValue: string }
>("clientProfile/downloadDocument", async (filename, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "downloadDocument");
    form.append("filename", filename);

    // get the blob
    const resp = await axios.post("/userprofiles", form, {
      responseType: "blob",
    });

    // trigger the client download
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

const clientProfileSlice = createSlice({
  name: "clientProfile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Partial<ClientProfile>>) {
      state.data = action.payload;
    },
    clearPreview(state) {
      if (state.previewSrc) URL.revokeObjectURL(state.previewSrc);
      state.previewSrc = "";
      state.previewStatus = "idle";
      state.previewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadClientProfile.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(loadClientProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(loadClientProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(updateClientProfile.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(updateClientProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { fields } = action.meta.arg;
        state.data = { ...state.data, ...fields };
      })
      .addCase(updateClientProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(uploadClientDocument.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(uploadClientDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data.files = action.payload;
      })
      .addCase(uploadClientDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(resetPin.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(resetPin.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(resetPin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })

      .addCase(requestVerification.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(requestVerification.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(requestVerification.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })
      /* ─── previewDocument ─────────────────────────────────────── */
      .addCase(previewClientDocument.pending, (state) => {
        state.previewStatus = "loading";
        state.previewError = null;
      })
      .addCase(previewClientDocument.fulfilled, (state, action) => {
        state.previewStatus = "idle";
        state.previewSrc = action.payload;
      })
      .addCase(previewClientDocument.rejected, (state, action) => {
        state.previewStatus = "failed";
        state.previewError =
          action.payload ?? action.error.message ?? "Preview failed";
      });
  },
});

export const { setProfile, clearPreview } = clientProfileSlice.actions;
export default clientProfileSlice.reducer;
