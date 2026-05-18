// src/redux/slices/analystSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface AnalystState {
  url?: string;
  status: "idle" | "loading" | "failed";
  errorCode?: string;
}
const initialState: AnalystState = { status: "idle" };

export const fetchAnalystLink = createAsyncThunk<
  { url: string },
  { user_id: string },
  { rejectValue: string }
>(
  "analyst/fetchLink",
  async ({ user_id }, { rejectWithValue }) => {
    const f = new FormData();
    f.append("user_id", user_id);
    try {
      const resp = await axios.post("/getAnalystLink", f);
      const env  = resp.data; // { code, message, data: { url } }
 
      return { url: env.data.url };
    } catch (err: any) {
      if (err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue("network_error");
    }
  }
);

const slice = createSlice({
  name: "analyst",
  initialState,
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(fetchAnalystLink.pending, (s) => {
        s.status = "loading";
        s.errorCode = undefined;
      })
      .addCase(fetchAnalystLink.fulfilled, (s, { payload }) => {
        s.status = "idle";
        s.url = payload.url;
      })
      .addCase(fetchAnalystLink.rejected, (s, { payload }) => {
        s.status = "failed";
        s.errorCode = payload;
      }),
});

export default slice.reducer;
