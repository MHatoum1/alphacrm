import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

type Summary = { total: number; success: number; error: number };

export const importLeadsCSV = createAsyncThunk<
  Summary,
  { file: File; adminId: string; msoffice?: boolean },
  { rejectValue: string }
>(
  "leads/importCSV",
  async ({ file, adminId, msoffice }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      // backend expectations
      form.append("action", "import");
      form.append("admin_id", String(adminId));
      form.append("import", file);
      if (msoffice) form.append("msoffice", "1"); // use semicolon delimiter

      const { data } = await axios.post("/adminleads", form);

      // Preferred: structured JSON from CommonAPI
      if (data?.data?.summary) {
        return data.data.summary as Summary;
      }
      if (data?.summary) {
        return data.summary as Summary;
      }

      // Fallback: parse message like "Import Completed. Total: X, Success: Y, Error: Z"
      const msg: string = data?.message || "";
      const re = /Total:\s*(\d+).*?Success:\s*(\d+).*?Error:\s*(\d+)/i;
      const m = re.exec(msg);
      if (m) {
        return { total: +m[1], success: +m[2], error: +m[3] };
      }

      // Neutral fallback
      return { total: 0, success: 0, error: 0 };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

interface State {
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  summary?: Summary;
}

const initial: State = { status: "idle" };

const slice = createSlice({
  name: "leadsImport",
  initialState: initial,
  reducers: { reset: () => initial },
  extraReducers: (b) =>
    b
      .addCase(importLeadsCSV.pending, (s) => {
        s.status = "loading";
        s.error = undefined;
      })
      .addCase(importLeadsCSV.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.summary = a.payload;
      })
      .addCase(importLeadsCSV.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? a.error.message ?? "import_failed";
      }),
});

export const { reset } = slice.actions;
export default slice.reducer;
