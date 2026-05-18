import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface HistoryParams {
  client_id: string;
  user_id: string;
  take: number;
  skip: number;
  filterText: string;
  sort: { field: string; dir: "asc" | "desc" };
}

export interface HistoryRow {
  id: number;
  date_created: string;
  type: string;
  method: string;
  reference: string;
  account: string;
  currency: string;
  amount: string;
  status: string;
}

interface State {
  rows: HistoryRow[];
  total: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: State = {
  rows: [],
  total: 0,
  status: "idle",
};

export const fetchHistoryTransactions = createAsyncThunk<
  { data: HistoryRow[]; total: number },
  HistoryParams,
  { rejectValue: string }
>("leads/historyTransactions", async (params, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "history_transactions");
    form.append("models", JSON.stringify(params));
    form.append("user_id", params.user_id);

    const { data } = await axios.post("/leadssales", form);
    // API returns { total, data: [...] }
    const response = data.data;

    return {
      data: response.data,
      total: response.total,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const slice = createSlice({
  name: "salesLeadHistory",
  initialState,
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(fetchHistoryTransactions.pending, (s) => {
        s.status = "loading";
        s.error = undefined;
      })
      .addCase(
        fetchHistoryTransactions.fulfilled,
        (s, action: PayloadAction<{ data: HistoryRow[]; total: number }>) => {
          s.status = "succeeded";
          s.rows = action.payload.data;
          s.total = action.payload.total;
        }
      )
      .addCase(fetchHistoryTransactions.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload ?? action.error.message;
      }),
});

export default slice.reducer;
