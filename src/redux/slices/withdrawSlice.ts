// src/redux/slices/withdrawSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export const fetchWithdrawOptions = createAsyncThunk<
  { rows: any[]; docsExpired: boolean }, // payload type
  { user_id: string }, // arg type
  { rejectValue: string }
>("withdraw/fetchOptions", async ({ user_id }, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "getWithdrawOptions",
      user_id,
    });
    const { data } = await axios.post("/userwithdrawals", body);
    // file the response such that if the user_id is NOT 123 to remove the whish option

    if (user_id != "70574" && user_id != "71587" && user_id != "105630" && user_id != "1747" && user_id != "25738" && user_id != "109023" && user_id != "63220") {

      data.data.rows = data.data.rows.filter((option: any) => option.name !== "Debit/Credit" && option.name !== "Google Pay" && option.name !== "Apple Pay");
    }

    return data.data as { rows: any[]; docsExpired: boolean };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch withdraw options");
  }
});

/* state */
interface State {
  rows: any[];
  docsExpired: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: State = { rows: [], docsExpired: false, status: "idle" };

export const withdrawSlice = createSlice({
  name: "withdraw",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchWithdrawOptions.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchWithdrawOptions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.rows = action.payload.rows;
        state.docsExpired = action.payload.docsExpired;
      })
      .addCase(fetchWithdrawOptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      }),
});

export default withdrawSlice.reducer;
