import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface Option {
  id: string;
  text: string;
  name?: string;
  email?: string;
}

export interface Mt5Server {
  server_type: string;
  server_name: string;
}

export interface Mt5AccountType {
  id: number;
  type: string;
  shortval: string;
}

type Load = "idle" | "loading" | "failed" | "succeeded";

interface Mt5AddAccountState {
  users: Option[];
  usersStatus: Load;
  servers: Mt5Server[];
  serversStatus: Load;
  logins: Option[];
  loginsStatus: Load;
  accountTypes: Mt5AccountType[];
  accountTypesStatus: Load;
  submitStatus: Load;
  error?: string | null;
}

const initialState: Mt5AddAccountState = {
  users: [],
  usersStatus: "idle",
  servers: [],
  serversStatus: "idle",
  logins: [],
  loginsStatus: "idle",
  accountTypes: [],
  accountTypesStatus: "idle",
  submitStatus: "idle",
  error: null,
};

const adminId = () => JSON.parse(localStorage.getItem("user") || "{}")?.uid;

export const fetchMt5Users = createAsyncThunk<Option[], { query: string }>(
  "mt5AddAccount/fetchUsers",
  async ({ query }) => {
    const body = new URLSearchParams({
      action: "mt5_users",
      admin_id: adminId(),
      q: query,
    });
    const res = await axios.post("/adminsettings", body);
    return res.data.data as Option[];
  }
);

export const fetchMt5Servers = createAsyncThunk<Mt5Server[]>(
  "mt5AddAccount/fetchServers",
  async () => {
    const body = new URLSearchParams({
      action: "mt5_servers",
      admin_id: adminId(),
    });
    const res = await axios.post("/adminsettings", body);
    return res.data.data as Mt5Server[];
  }
);

export const fetchMt5Logins = createAsyncThunk<
  Option[],
  { server: string; query: string }
>("mt5AddAccount/fetchLogins", async ({ server, query }) => {
  const body = new URLSearchParams({
    action: "mt5_logins",
    admin_id: adminId(),
    server,
    q: query,
  });
  const res = await axios.post("/adminsettings", body);
  return res.data.data as Option[];
});

export const fetchMt5AccountTypes = createAsyncThunk<Mt5AccountType[]>(
  "mt5AddAccount/fetchAccountTypes",
  async () => {
    const body = new URLSearchParams({
      action: "mt5_account_types",
      admin_id: adminId(),
    });
    const res = await axios.post("/adminsettings", body);
    return res.data.data as Mt5AccountType[];
  }
);

export const submitMt5Account = createAsyncThunk<
  void,
  { user_id: string; mt5_server: string; mt5_login: string; account_type: string }
>("mt5AddAccount/submit", async (payload) => {
  const body = new URLSearchParams({
    action: "mt5_add_account",
    admin_id: adminId(),
    ...payload,
  });
  await axios.post("/adminsettings", body);
});

const slice = createSlice({
  name: "mt5AddAccount",
  initialState,
  reducers: {
    clearMt5Logins(state) {
      state.logins = [];
      state.loginsStatus = "idle";
    },
  },
  extraReducers: (b) =>
    b
      .addCase(fetchMt5Users.pending, (s) => {
        s.usersStatus = "loading";
      })
      .addCase(fetchMt5Users.fulfilled, (s, a) => {
        s.usersStatus = "succeeded";
        s.users = a.payload;
      })
      .addCase(fetchMt5Users.rejected, (s) => {
        s.usersStatus = "failed";
      })
      .addCase(fetchMt5Servers.pending, (s) => {
        s.serversStatus = "loading";
      })
      .addCase(fetchMt5Servers.fulfilled, (s, a) => {
        s.serversStatus = "succeeded";
        s.servers = a.payload;
      })
      .addCase(fetchMt5Servers.rejected, (s) => {
        s.serversStatus = "failed";
      })
      .addCase(fetchMt5Logins.pending, (s) => {
        s.loginsStatus = "loading";
      })
      .addCase(fetchMt5Logins.fulfilled, (s, a) => {
        s.loginsStatus = "succeeded";
        s.logins = a.payload;
      })
      .addCase(fetchMt5Logins.rejected, (s) => {
        s.loginsStatus = "failed";
      })
      .addCase(fetchMt5AccountTypes.pending, (s) => {
        s.accountTypesStatus = "loading";
      })
      .addCase(fetchMt5AccountTypes.fulfilled, (s, a) => {
        s.accountTypesStatus = "succeeded";
        s.accountTypes = a.payload;
      })
      .addCase(fetchMt5AccountTypes.rejected, (s) => {
        s.accountTypesStatus = "failed";
      })
      .addCase(submitMt5Account.pending, (s) => {
        s.submitStatus = "loading";
        s.error = null;
      })
      .addCase(submitMt5Account.fulfilled, (s) => {
        s.submitStatus = "succeeded";
      })
      .addCase(submitMt5Account.rejected, (s, a) => {
        s.submitStatus = "failed";
        s.error = a.error.message ?? "Failed to add MT5 account";
      }),
});

export const { clearMt5Logins } = slice.actions;
export default slice.reducer;
