// src/redux/slices/userStatusesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export interface Accesses {
  tradingCentral: boolean;
  backofficeAccess: boolean;
  acl: string | null;
  groups: Record<string, string>;
  canManage: boolean;
}

interface UserStatusesState {
  status: "idle" | "loading" | "failed";
  error: string | null;
  data: any; // ‹see payload below›
}

const initialState: UserStatusesState = {
  status: "idle",
  error: null,
  data: {},
};

/** GET /admindetails (action=getUserStatuses) */
export const fetchUserStatuses = createAsyncThunk<
  any, // payload: full response.data
  { admin_id: string; user_id: string },
  { rejectValue: string }
>("userStatuses/fetch", async ({ admin_id, user_id }, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "getUserStatuses",
      admin_id,
      user_id,
    }).toString();

    const res = await axiosInstance.post("/admindetails", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data; // { data: { flags, legal, … } }
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addLeadStatus = createAsyncThunk<
  any, // payload: full response.data
  { userId: string; leadStatus: string },
  { rejectValue: string }
>("lead/addStatus", async ({ userId, leadStatus }, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams({
      action: "add_lead_status",
      user_id: userId,
      lead_status: leadStatus,
    });
    const { data } = await axiosInstance.post("/admindetails", form);
    return data; // whatever we sent back in ④
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/** POST /admindetails (action=updateUserStatuses) */
export const saveUserStatuses = createAsyncThunk<
  any, // payload: full response.data
  {
    admin_id: string;
    id: string;
    flags: Record<string, boolean>;
    legal: "unverified" | "limited" | "dormant" | "verified";
    risk: "low" | "medium" | "high";
    completion: Record<string, boolean>;
    server?: string;
  },
  { rejectValue: string }
>("userStatuses/save", async (payload, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({
      action: "saveUserStatuses",
      id: payload.id,
      admin_id: payload.admin_id,
    });

    /* flags */
    Object.entries(payload.flags).forEach(([k, v]) =>
      params.append(k, v ? "1" : "0")
    );

    /* completion */
    params.append("completed", payload.flags.completed ? "1" : "0");
    Object.entries(payload.completion).forEach(([k, v]) =>
      params.append(`details[${k}]`, v ? "1" : "0")
    );

    /* radio groups */
    params.append("legal", payload.legal);
    params.append("profile_risk_level", payload.risk);

    /* optional server */
    if (payload.server) {
      params.append("report-server", payload.server);
    }

    const res = await axiosInstance.post("/admindetails", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data; // { status:'success', data: { … } }
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const slice = createSlice({
  name: "userStatuses",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchUserStatuses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserStatuses.fulfilled, (state, action) => {
        state.status = "idle";
        /**  <<< UNWRAP RIGHT HERE >>>  */
        state.data = action.payload.data; // now state.data = { flags, legal, … }
      })
      .addCase(fetchUserStatuses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed";
      })
      .addCase(saveUserStatuses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(saveUserStatuses.fulfilled, (state, action) => {
        state.data = action.payload.data;
        state.status = "idle";
      })
      .addCase(saveUserStatuses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Save failed";
      })
      .addCase(addLeadStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addLeadStatus.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(addLeadStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to add lead status";
      }),
});

export default slice.reducer;
