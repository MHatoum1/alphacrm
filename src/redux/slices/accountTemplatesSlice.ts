// src/redux/slices/accountTemplatesSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/** What one “template row” looks like – adjust if your PHP returns more */
export interface Template {
  className: string; // e.g. “ECN”
  type: "live" | "demo"; // MT4 / MT5 is in `platform`
  platform: "mt4" | "mt5";
  initial: number; // min deposit or “0” for demo
  spread: string;
  commission: string;
  leverage: string;
  hosting: string;
  strategy: string;
  shortval: string; // the link stub “ecn”, “ecn_plus”… (legacy)
}

export interface TemplatesState {
  live: Template[];
  demo: Template[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

/* ---------- thunk ---------- */
export const fetchAccountTemplates = createAsyncThunk<
  { live: Template[]; demo: Template[] }, // ← returned payload type
  { user_id: string }, // ← argument type
  { rejectValue: string } // ← allows us to return a string on reject
>("accounts/templates", async ({ user_id }, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "getTemplates"); // PHP will switch on this
    form.append("user_id", user_id);

    const { data } = await axios.post("/useraccounts", form);
    return data.data as { live: Template[]; demo: Template[] };
  } catch (e: any) {
    // Any network/backend error ends up here; we surface a string
    return rejectWithValue(e.message || "Failed to fetch templates");
  }
});

/* ---------- slice ---------- */
const slice = createSlice({
  name: "accountTemplates",
  initialState: {
    live: [] as Template[],
    demo: [] as Template[],
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountTemplates.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAccountTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.live = action.payload.live;
        state.demo = action.payload.demo;
      })
      .addCase(fetchAccountTemplates.rejected, (state, action) => {
        state.status = "failed";
        // If we returned rejectWithValue, it comes in action.payload; otherwise fallback to action.error.message
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });
  },
});

export default slice.reducer;
