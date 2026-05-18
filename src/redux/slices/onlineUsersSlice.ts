import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ---- row type ---- */
export interface OnlineRow {
  RowId: number; // DataGrid key (Login)
  Login: number;
  Name: string;
  Group: string;
  Balance: number;
  Credit: number;
  Equity: number;
  FreeMargin: number;
  Margin: number;
  Country: string;
  Email: string;
}

/* ---- thunk ---- */
/* src/redux/slices/onlineUsersSlice.ts */
export const fetchOnlineUsers = createAsyncThunk<
  { rows: OnlineRow[]; total: number },
  {
    platform: "mt5" | "mt4";
    page: number; // 👈 added
    rows: number;
    sort: string;
    order: "asc" | "desc";
    srch: string;
    srchv: string;
  }
>("online/list", async (arg) => {
  const fd = new FormData();
  fd.append("action", arg.platform === "mt4" ? "list_mt4" : "list_mt5");
  fd.append("page", String(arg.page));
  fd.append("rows", String(arg.rows));
  fd.append("sort", arg.sort);
  fd.append("order", arg.order);
  fd.append("srch", arg.srch);
  fd.append("srchv", arg.srchv);

  const { data } = await axios.post("/mt5accounts", fd);

  const rows = (data.data.rows as OnlineRow[]).map((r) => ({
    ...r,
    id: r.RowId, // still unique
  }));
  return { rows, total: data.data.total };
});
/* ---- slice ---- */
type Load = "idle" | "loading" | "succeeded" | "failed";
interface OnlineState {
  rows: OnlineRow[];
  total: number;
  status: Load;
}
const initial: OnlineState = { rows: [], total: 0, status: "idle" };

const slice = createSlice({
  name: "onlineUsers",
  initialState: initial,
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(fetchOnlineUsers.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchOnlineUsers.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.rows = a.payload.rows;
        s.total = a.payload.total;
      })
      .addCase(fetchOnlineUsers.rejected, (s) => {
        s.status = "failed";
      }),
});
export default slice.reducer;
