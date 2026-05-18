// src/redux/slices/userAccessesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export interface Accesses {
  tradingCentral: boolean;
  backofficeAccess: boolean;
  acl: string | null;
  groups: Record<string, string>;
  canManage: boolean;
}

interface State {
  status: "idle" | "loading" | "failed";
  data: Partial<Accesses>;
  error: string | null;
}

const initialState: State = {
  status: "idle",
  data: {},
  error: null,
};

/* GET */
export const fetchUserAccesses = createAsyncThunk<
  Accesses, // payload type
  { admin_id: string; user_id: string }, // arg type
  { rejectValue: string }
>("accesses/fetch", async (p, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "getUserAccesses",
      admin_id: p.admin_id,
      user_id: p.user_id,
    });
    const { data } = await axiosInstance.post("/admindetails", body);
    return data.data as Accesses; // {status,msg,data}
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Failed to load accesses"
    );
  }
});

/* POST / SAVE */
export const saveUserAccesses = createAsyncThunk<
  Accesses, // payload type
  {
    admin_id: string;
    user_id: string;
    tradingCentral: boolean;
    backofficeAccess: boolean;
    acl: string | null;
  }, // arg type
  { rejectValue: string }
>("accesses/save", async (p, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams({
      action: "updateUserAccesses",
      admin_id: p.admin_id,
      id: p.user_id,
      tradingCentral: p.tradingCentral ? "1" : "0",
      backofficeAccess: p.backofficeAccess ? "1" : "0",
    });
    if (p.acl !== null) {
      form.append("acl", p.acl);
    }
    const { data } = await axiosInstance.post("/admindetails", form);
    return data.data as Accesses;
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Failed to save accesses"
    );
  }
});

const slice = createSlice({
  name: "accesses",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchUserAccesses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserAccesses.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchUserAccesses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Load failed";
      })
      .addCase(saveUserAccesses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(saveUserAccesses.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(saveUserAccesses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Save failed";
      }),
});

export default slice.reducer;
