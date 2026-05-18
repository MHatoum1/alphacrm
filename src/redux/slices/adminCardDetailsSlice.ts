// src/redux/slices/adminCardDetailsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export interface CardDetailsState {
  status: "idle" | "loading" | "failed";
  error: string | null;
  data: any;
}

const initialState: CardDetailsState = {
  status: "idle",
  error: null,
  data: {},
};

// ───────────────────────────────────────────────────────────
// FETCH Purse Details
// ───────────────────────────────────────────────────────────
export const fetchCardDetails = createAsyncThunk<
  any, // payload: whatever shape data.data has
  string, // argument: uid
  { rejectValue: string }
>("purse/fetchDetails", async (uid: string, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams({
      action: "getCardDetails",
      uid, // purse ID or UID
    });

    const { data } = await axiosInstance.post("/admintransactions", form);
    return data.data; // assumes backend returns { data: { purse, user, transactions, ... } }
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to load purse details");
  }
});

// ───────────────────────────────────────────────────────────
// MODIFY Purse Status
// ───────────────────────────────────────────────────────────
export const modifyPurseStatus = createAsyncThunk<
  any, // payload: whatever shape the API returns (we’re not using it in state here)
  { id: string; action: "approve" | "decline" | "enable" | "disable" },
  { rejectValue: string }
>("purse/modifyStatus", async ({ id, action }, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams({
      action: "modifyPurseStatus",
      purse_id: id,
      [action]: "1", // only one of these keys (“approve”, “decline”, etc.) will be set to "1"
    });

    const { data } = await axiosInstance.post("/admintransactions", form);
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to modify purse status");
  }
});

// ───────────────────────────────────────────────────────────
// Slice
// ───────────────────────────────────────────────────────────
const adminCardDetailsSlice = createSlice({
  name: "adminCardDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ─── fetchCardDetails ───────────────────────────────
      .addCase(fetchCardDetails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCardDetails.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchCardDetails.rejected, (state, action) => {
        state.status = "failed";
        // If we dispatched rejectWithValue, it’s in action.payload; otherwise fallback to action.error.message
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to load purse details";
      })

      // ─── modifyPurseStatus ─────────────────────────────
      .addCase(modifyPurseStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(modifyPurseStatus.fulfilled, (state) => {
        state.status = "idle";
        // Note: we’re not storing anything from action.payload here.
      })
      .addCase(modifyPurseStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to modify purse status";
      });
  },
});

export default adminCardDetailsSlice.reducer;
