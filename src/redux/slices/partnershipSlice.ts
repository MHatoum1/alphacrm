// src/redux/slices/partnershipSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface PartnershipState {
  pid?: string;
  cid?: string;
  redirect?: string;
  status: "idle" | "loading" | "failed";
}

const initialState: PartnershipState = {
  status: "idle",
};

export const preProcessPartnership = createAsyncThunk<
  { redirect?: string },
  { pid?: string; cid?: string }
>("partners/preProcess", async ({ pid, cid }) => {
  const form = new FormData();
  if (pid) form.append("pid", pid);
  if (cid) form.append("cid", cid);

  const { data } = await axios.post("/partnerspreprocess", form);
  return data as { redirect?: string };
});

const slice = createSlice({
  name: "partners",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(preProcessPartnership.pending, (state) => {
        state.status = "loading";
      })
      .addCase(preProcessPartnership.fulfilled, (state, { payload, meta }) => {
        state.status = "idle";
        if (meta.arg.pid) state.pid = meta.arg.pid;
        if (meta.arg.cid) state.cid = meta.arg.cid;
        state.redirect = payload.redirect;
      })
      .addCase(preProcessPartnership.rejected, (state) => {
        state.status = "failed";
      }),
});

export default slice.reducer;
