// src\redux\slices\mtAccountsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ─────────────── types ─────────────── */
export interface MtAccountRow {
  Login: number;
  Name: string;
  Type: string;
  Class: string;
  Group: string;
  IB: string;
  Balance: number;
  Credit: number;
  Leverage: number;
  Email: string;
  Country: string;
  LastDate: number; // UNIX UTC
  Regdate: number;
  Equity: number;
  Hidden: number;
  /* local enrichment */
  uid?: string;
  type?: string;
  localid?: number;
  UserColor?: number;

  /* added on the client side */
  id?: number;          // <- DataGrid needs this
}

interface Query {
  page: number;
  rows: number;
  sort: string;
  order: "asc" | "desc";
  srch: string;
  srchv: string;
}

export const fetchMtAccounts = createAsyncThunk<
  { rows: MtAccountRow[]; total: number },
  Query & { admin_id: string }
>("mtAccounts/mtaccounts", async (q) => {
  const fd = new FormData();
  Object.entries(q).forEach(([k, v]) => fd.append(k, String(v)));
  fd.append("action", "mtaccounts");           // 👈 new
  const { data } = await axios.post("/mt5accounts", fd);

  /* attach id for DataGrid */
  const rows = (data.data.rows as MtAccountRow[]).map((r) => ({
    ...r,
    id: r.Login,
  }));

  return { rows, total: data.data.total } as {
    rows: MtAccountRow[];
    total: number;
  };
});

/* ─────────────── slice ─────────────── */
type Load = "idle" | "loading" | "succeeded" | "failed";
interface MtAccState {
  rows: MtAccountRow[];
  total: number;
  recordsTotal: number;
  recordsFiltered: number;
  status: Load;
  query: Query;
}
const initial: MtAccState = {
  rows: [],
  total: 0,
  recordsTotal: 0,
  recordsFiltered: 0,
  status: "idle",
  query: { page: 1, rows: 25, sort: "Regdate", order: "desc", srch: "all", srchv: "" },
};

const slice = createSlice({
  name: "mtAccounts",
  initialState: initial,
  reducers: {
    setQuery(s, a: PayloadAction<Partial<Query>>) {
      s.query = { ...s.query, ...a.payload };
    },
  },
  extraReducers: (b) =>
    b
      .addCase(fetchMtAccounts.pending, (s) => { s.status = "loading"; })
      .addCase(fetchMtAccounts.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.rows   = a.payload.rows;
        s.total  = a.payload.total;
        s.recordsTotal     = a.payload.total;
        s.recordsFiltered  = a.payload.total;
      })
      .addCase(fetchMtAccounts.rejected, (s) => { s.status = "failed"; }),
});

export const { setQuery } = slice.actions;
export default slice.reducer;
