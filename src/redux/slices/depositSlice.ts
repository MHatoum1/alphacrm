// src/redux/slices/depositSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export const fetchDepositOptions = createAsyncThunk<
  { rows: any[]; docsExpired: boolean }, // payload type
  { user_id: string }, // arg type
  { rejectValue: string }
>("deposit/fetchOptions", async ({ user_id }, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "getDepositOptions",
      user_id,
    });
    const { data } = await axios.post("/userdeposits", body);
    

    if (user_id != "70574" && user_id != "71587" && user_id != "105630" && user_id != "1747"  && user_id != "25738"  && user_id != "109023" && user_id != "63220" ) {
      
      data.data.rows = data.data.rows.filter((option: any) => option.name !== "Debit/Credit" && option.name !== "Google Pay" && option.name !== "Apple Pay");
    }
    
    return data.data as { rows: any[]; docsExpired: boolean };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch deposit options");
  }
});

interface State {
  rows: any[];
  docsExpired: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: State = {
  rows: [],
  docsExpired: false,
  status: "idle",
};

const depositSlice = createSlice({
  name: "deposit",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchDepositOptions.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchDepositOptions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.rows = action.payload.rows;
        state.docsExpired = action.payload.docsExpired;
      })
      .addCase(fetchDepositOptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      }),
});

export default depositSlice.reducer;
