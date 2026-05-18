// src/redux/slices/referSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ─────────────────────────────────────────────────────────── */
/* async thunks                                               */
/* ─────────────────────────────────────────────────────────── */
export const fetchReferStats = createAsyncThunk<
  {
    link: string;
    friends: number;
    verified: boolean;
    limited: boolean;
    dormant: boolean;
  },
  string,
  { rejectValue: string }
>("refer/stats", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "stats");
    f.append("user_id", user_id);
    const { data } = await axios.post("/userrefer", f);
    return data.data as {
      link: string;
      friends: number;
      verified: boolean;
      limited: boolean;
      dormant: boolean;
    };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed loading statistics");
  }
});

export const generateReferLink = createAsyncThunk<
  void,
  string,
  { rejectValue: string; dispatch: any }
>("refer/gen", async (user_id, { dispatch, rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "generate");
    f.append("user_id", user_id);
    await axios.post("/userrefer", f);
    // immediately refresh the stats
    dispatch(fetchReferStats(user_id));
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed generating link");
  }
});

/* ─────────────────────────────────────────────────────────── */
/* slice                                                      */
/* ─────────────────────────────────────────────────────────── */
interface St {
  link: string;
  friends: number;
  verified: boolean;
  limited: boolean;
  dormant: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: St = {
  link: "",
  friends: 0,
  verified: false,
  limited: false,
  dormant: false,
  status: "idle",
};

const referSlice = createSlice({
  name: "refer",
  initialState,
  reducers: {
    resetRefer: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferStats.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchReferStats.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.status = "succeeded";
      })
      .addCase(fetchReferStats.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed loading statistics";
      })
      .addCase(generateReferLink.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(generateReferLink.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(generateReferLink.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed generating link";
      });
  },
});

export const { resetRefer } = referSlice.actions;
export default referSlice.reducer;
