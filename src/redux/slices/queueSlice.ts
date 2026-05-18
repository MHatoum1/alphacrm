import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ---------------- types ---------------- */
export interface QueueRow {
  RowId: number;
  id: number;
  task: string;
  status: number;
  processed: number;
  created: string;
  modified: string;
}

export interface QueueDetail extends QueueRow {
  params: string | null;
  out_params: string | null;
  owner: string | null;
  owner_id: number | null;
  ownerInfo: any | null;
}

type GridArg = {
  task: string | null;
  page: number;
  rows: number;
  sort: string;
  order: "asc" | "desc";
};

/* --------------- thunks ---------------- */
export const fetchQueueList = createAsyncThunk<
  { rows: QueueRow[]; total: number },
  GridArg
>("queue/list", async (arg) => {
  const fd = new FormData();
  Object.entries(arg).forEach(([k, v]) => fd.append(k, String(v)));
  fd.append("action", "list");
  const { data } = await axios.post("/adminsettings", fd);
  return data.data as { rows: QueueRow[]; total: number };
});

export const fetchQueueDetails = createAsyncThunk<QueueDetail, number>(
  "queue/details",
  async (id) => {
    const fd = new FormData();
    fd.append("action", "details");
    fd.append("id", String(id));
    const { data } = await axios.post("/adminsettings", fd);
    return data.data as QueueDetail;
  }
);

/* ─────────────────── thunk ─────────────────── */
export const reopenQueueTask = createAsyncThunk<void, number>(
  "queue/reopen",
  async (id, { dispatch }) => {
    const fd = new FormData();
    fd.append("action", "reopen");
    fd.append("reopen", String(id));
    await axios.post("/adminsettings", fd);
    /* after success, re-pull first page so UI updates */
    dispatch(
      fetchQueueList({
        task: "mail",
        page: 1,
        rows: 10,
        sort: "id",
        order: "desc",
      })
    );
  }
);

/* --------------- slice ----------------- */
interface QueueState {
  rows: QueueRow[];
  total: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  detail?: QueueDetail | null;
}
const initial: QueueState = {
  rows: [],
  total: 0,
  status: "idle",
  detail: null,
};

const slice = createSlice({
  name: "queue",
  initialState: initial,
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(fetchQueueList.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchQueueList.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.rows = a.payload.rows;
        s.total = a.payload.total;
      })
      .addCase(fetchQueueList.rejected, (s) => {
        s.status = "failed";
      })

      .addCase(fetchQueueDetails.fulfilled, (s, a) => {
        s.detail = a.payload;
      })
      .addCase(reopenQueueTask.pending, (s) => {
        s.status = "loading";
      })
      .addCase(reopenQueueTask.fulfilled, (s) => {
        s.status = "succeeded";
      })
      .addCase(reopenQueueTask.rejected, (s) => {
        s.status = "failed";
      }),
});
export default slice.reducer;
