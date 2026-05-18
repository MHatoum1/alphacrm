// src/redux/slices/profileReviewSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface FileRecord {
  id: number;
  file_name: string;
  file_type: string;
  doc_type: string;
  status: string;
  created: string;
  preview: string;
  url: string;
}

export interface Option {
  id: string;
  text: string;
}

interface ProfileReviewState {
  status: "idle" | "loading" | "failed";
  data: any[];
  error?: string | null;

  userOpts: Option[];
  userOptsStatus: "idle" | "loading" | "failed";

  ibOptions: Option[];
  ibOptionsStatus: "idle" | "loading" | "failed";
}

const initialState: ProfileReviewState = {
  status: "idle",
   data: [],
  error: null,
  userOpts: [],
  userOptsStatus: "idle",

  ibOptions: [],
  ibOptionsStatus: "idle",
};





/** 4️⃣ Fetch all IBs once for autocomplete */
export const fetchuserOpts = createAsyncThunk<
  Option[],
   { query: string },
  { rejectValue: string }
>("profileReview/fetchuserOpts", async ({query}, { rejectWithValue }) => {
  try {
    const admin = JSON.parse(localStorage.getItem("user") || "{}");
    const body = new URLSearchParams({
      action: "searchUsers",
      admin_id: admin.uid,
      q: query,
    });
    const res = await axios.post("/adminsettings", body);
    return res.data.data as Option[];
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});



/** 4️⃣ Fetch all IBs once for autocomplete */
export const fetchIBOptions = createAsyncThunk<
  Option[],
   { query: string },
  { rejectValue: string }
>("profileReview/fetchIBOptions", async  ({query}, { rejectWithValue }) => {
  try {
    const admin = JSON.parse(localStorage.getItem("user") || "{}");
    const body = new URLSearchParams({
      action: "searchIBs",
      admin_id: admin.uid,
      q: query
    });
    const res = await axios.post("/adminsettings", body);
    return res.data.data as Option[];
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

/** 5️⃣ Update IB–client relationship */
export const updateRelation = createAsyncThunk<
  void,
  { user_id: string; ibId: string },
  { rejectValue: string }
>("profileReview/updateRelation", async ({ user_id, ibId }, { rejectWithValue }) => {
  try {
      const admin = JSON.parse(localStorage.getItem("user") || "{}");
    const body = new URLSearchParams({
      action: "relationUpdate",
      admin_id: admin.uid,
      user_id: user_id,
      ib_id: ibId,
    });
    await axios.post("/adminsettings", body);
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

const slice = createSlice({
  name: "profileReview",
  initialState,
  reducers: {},
  extraReducers: (b) =>
    b
     

      // fetchuserOpts
      .addCase(fetchuserOpts.pending, (s) => {
        s.userOptsStatus = "loading";
      })
      .addCase(fetchuserOpts.fulfilled, (s, a) => {
        s.userOptsStatus = "idle";
        s.userOpts = a.payload;
      })
      .addCase(fetchuserOpts.rejected, (s) => {
        s.userOptsStatus = "failed";
      })

       // fetchIBOptions
      .addCase(fetchIBOptions.pending, (s) => {
        s.ibOptionsStatus = "loading";
      })
      .addCase(fetchIBOptions.fulfilled, (s, a) => {
        s.ibOptionsStatus = "idle";
        s.ibOptions = a.payload;
      })
      .addCase(fetchIBOptions.rejected, (s) => {
        s.ibOptionsStatus = "failed";
      })

      // updateRelation
      .addCase(updateRelation.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(updateRelation.fulfilled, (s) => {
        s.status = "idle";

        
      })
      .addCase(updateRelation.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      }),
});

export default slice.reducer;
