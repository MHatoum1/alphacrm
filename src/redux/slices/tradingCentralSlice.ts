import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface TradingCentralState {
  verified: boolean;
  deposited: boolean;
  accessFlag: boolean;
  status: "idle" | "loading" | "failed";
}

const initialState: TradingCentralState = {
  verified: false,
  deposited: false,
  accessFlag: false,
  status: "idle",
};

export const fetchTradingCentralStatus = createAsyncThunk<
  { verified: boolean; deposited: boolean; accessFlag: boolean },
  { user_id: string }
>("tradingCentral/fetchStatus", async ({ user_id }, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("user_id", user_id);
    const { data } = await axios.post("/tradingCentralStatus", f);
    return data.data;
  } catch (err: any) {
    return rejectWithValue("network_error");
  }
});

const slice = createSlice({
  name: "tradingCentral",
  initialState,
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(fetchTradingCentralStatus.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchTradingCentralStatus.fulfilled, (s, { payload }) => {
        s.status = "idle";
        s.verified = payload.verified;
        s.deposited = payload.deposited;
        s.accessFlag = payload.accessFlag;
      })
      .addCase(fetchTradingCentralStatus.rejected, (s) => {
        s.status = "failed";
      }),
});

export default slice.reducer;
