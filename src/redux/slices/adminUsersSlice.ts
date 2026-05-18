// src/redux/slices/adminUsersSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface IBOption {
  id: string;
  text: string;
}

interface AdminUsersState {
  ibOptions: IBOption[];
  ibStatus: "idle" | "loading" | "failed";
  addStatus: "idle" | "loading" | "succeeded" | "failed";
  addError: string | null;
}

const initialState: AdminUsersState = {
  ibOptions: [],
  ibStatus: "idle",
  addStatus: "idle",
  addError: null,
};

/** Search IBs (for the autocomplete) */
export const searchIBs = createAsyncThunk<IBOption[], string>(
  "adminUsers/searchIBs",
  async (q, { rejectWithValue }) => {
    try {
      const form = new FormData();
      const admin = JSON.parse(localStorage.getItem("user") || "{}");
      form.append("action", "searchIBs");
      form.append("admin_id", admin.uid);
      form.append("q", q);
      const { data } = await axios.post("/adminprofiles", form);
      return data.data as IBOption[];
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

/** Add a new user (and optional account/IB relation) */
export const addUser = createAsyncThunk<
  void,
  {
    login: string;
    name: string;
    email: string;
    phone: string;
    is_ib: boolean;
    has_ib: boolean;
    ib_id?: string;
  },
  { rejectValue: string }
>("adminUsers/addUser", async (payload, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "add");
    form.append("login", payload.login);
    form.append("name", payload.name);
    form.append("email", payload.email);
    form.append("phone", payload.phone);
    if (payload.is_ib) form.append("is_ib", "1");
    if (payload.has_ib) {
      form.append("has_ib", "1");
      if (payload.ib_id) form.append("ib_id", payload.ib_id);
    }
    await axios.post("/adminprofiles", form);
  } catch (e: any) {
    return rejectWithValue("Failed to add user");
  }
});

const slice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      // searchIBs
      .addCase(searchIBs.pending, (s) => {
        s.ibStatus = "loading";
      })
      .addCase(searchIBs.fulfilled, (s, a) => {
        s.ibStatus = "idle";
        s.ibOptions = a.payload;
      })
      .addCase(searchIBs.rejected, (s) => {
        s.ibStatus = "failed";
      })

      // addUser
      .addCase(addUser.pending, (s) => {
        s.addStatus = "loading";
        s.addError = null;
      })
      .addCase(addUser.fulfilled, (s) => {
        s.addStatus = "succeeded";
      })
      .addCase(addUser.rejected, (s, a) => {
        s.addStatus = "failed";
        s.addError = a.payload as string;
      }),
});

export default slice.reducer;
