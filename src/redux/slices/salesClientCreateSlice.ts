// src/redux/slices/salesClientCreateSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface NewClient {
  name: string;
  email: string;
  country: string;
  phone: string;
  status: string;
  source: string;
  specify?: string;
  sales?: string; // only if admin selected
}

export const createClient = createAsyncThunk<
  { id: number }, // payload: newly created client ID
  NewClient, // arg: NewClient
  { rejectValue: string }
>("salesClient/create", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    Object.entries(p).forEach(([k, v]) => {
      if (v) f.append(k, v);
    });
    f.append("action", "create");
    f.append("user_id", "0"); // not used by backend
    const { data } = await axios.post("/salesclients", f);
    return data.data as { id: number };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

interface State {
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  newId?: number;
}

const initial: State = { status: "idle" };

const slice = createSlice({
  name: "salesClientCreate",
  initialState: initial,
  reducers: { reset: () => initial },
  extraReducers: (builder) =>
    builder
      .addCase(createClient.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.newId = action.payload.id;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "create_failed";
      }),
});

export const { reset } = slice.actions;
export default slice.reducer;
