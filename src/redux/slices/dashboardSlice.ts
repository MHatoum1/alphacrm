// src/redux/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

interface MoneySum {
  currency: string;
  amount: number;
}

interface DashboardState {
  stats: {
    newDeposits: number;
    newWithdrawals: number;
    newUsers: number;
    newDocs: number;
    allProfiles: number;
    activeMessages: number;
    campaignsInUse: number;
    profileDistribution: Record<string, number>;
      depositsSum: MoneySum[];
    withdrawalsSum: MoneySum[];
  };
  latestProfiles: {
    email: string;
    fullName: string;
    country: string;
    created: string;
    status: string;
  }[];
  latestTransactions: {
    profile: string;
    account: string;
    amount: string;
    created: string;
    finished: string;
    status: string;
  }[];
  status: "idle" | "loading" | "failed";
  error?: string;
}

const initialState: DashboardState = {
  stats: {
    newDeposits: 0,
    newWithdrawals: 0,
    newUsers: 0,
    newDocs: 0,
    allProfiles: 0,
    activeMessages: 0,
    campaignsInUse: 0,
    profileDistribution: {},
      depositsSum: [],
    withdrawalsSum: [],
  },
  latestProfiles: [],
  latestTransactions: [],
  status: "idle",
};

function getAdminId(): number | null {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).uid : null;
  } catch {
    return null;
  }
}

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    const admin_id = getAdminId();
    try {
      const body = new URLSearchParams({
        action: "stats",
        admin_id: admin_id ? String(admin_id) : "",
      });

      const { data } = await axios.post("/admindashboard", body);

      return data.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchLatestProfiles = createAsyncThunk<
  DashboardState["latestProfiles"], // return type
  number, // argument type
  { rejectValue: string }
>("dashboard/fetchProfiles", async (limit, { rejectWithValue }) => {
  const admin_id = getAdminId();
  try {
    const body = new URLSearchParams({
      action: "latestProfiles",
      admin_id: admin_id ? String(admin_id) : "",
      limit: String(limit), // ensure limit is a string
    });

    const { data } = await axios.post("/admindashboard", body);

    return data.data;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

// likewise:
export const fetchLatestTransactions = createAsyncThunk<
  DashboardState["latestTransactions"],
  number,
  { rejectValue: string }
>("dashboard/fetchTransactions", async (limit, { rejectWithValue }) => {
  const admin_id = getAdminId();
  try {
    const body = new URLSearchParams({
      action: "latestTransactions",
      admin_id: admin_id ? String(admin_id) : "",
      limit: String(limit), // ensure limit is a string
    });

    const { data } = await axios.post("/admindashboard", body);

    return data.data;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

const slice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      // stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = "idle";
         state.stats = {
          ...state.stats,
          ...action.payload,
        };
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // latest profiles
      .addCase(fetchLatestProfiles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLatestProfiles.fulfilled, (state, action) => {
        state.status = "idle";
        state.latestProfiles = (action.payload as any[]).map((item, idx) => ({
          id: idx,
          ...item,
        }));
      })
      .addCase(fetchLatestProfiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // latest transactions
      .addCase(fetchLatestTransactions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLatestTransactions.fulfilled, (state, action) => {
        state.status = "idle";
        state.latestTransactions = (action.payload as any[]).map(
          (item, idx) => ({
            id: idx,
            ...item,
          })
        );
      })
      .addCase(fetchLatestTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      }),
});

export default slice.reducer;
