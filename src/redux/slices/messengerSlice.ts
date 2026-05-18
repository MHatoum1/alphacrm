// src/store/slices/messengerSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ═════════════════════════════
   1.  Async thunks
   ═════════════════════════════ */

export const fetchUnreadCount = createAsyncThunk<
  { count: number }, // payload type
  { user_id: string }, // arg type
  { rejectValue: string }
>("messenger/fetchUnreadCount", async (p, { rejectWithValue }) => {
  try {
    const { data } = await axios.get("/usermessenger", {
      params: { action: "count", user_id: p.user_id },
    });
    return data.data as { count: number };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch unread count");
  }
});

/** GET /?action=list – last N messages */
export const fetchMessages = createAsyncThunk<
  { rows: Array<{ id: number; message: string ,created:string}>; count: number }, // payload
  { user_id: string; limit?: number }, // arg
  { rejectValue: string }
>("messenger/fetchMessages", async (p, { rejectWithValue }) => {
  try {
    const { data } = await axios.get("/usermessenger", {
      params: {
        action: "list",
        user_id: p.user_id,
        ...(p.limit ? { limit: p.limit } : {}),
      },
    });
    return data.data as {
      rows: Array<{ id: number; message: string, created: string }>;
      count: number;
    };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch messages");
  }
});

/** GET /?action=close_notification – mark all seen */
export const closeNotifications = createAsyncThunk<
  { status: string }, // payload type
  { user_id: string }, // arg type
  { rejectValue: string }
>("messenger/closeNotifications", async (p, { rejectWithValue }) => {
  try {
    const { data } = await axios.get("/usermessenger", {
      params: { action: "close_notification", user_id: p.user_id },
    });
    return data.data as { status: string };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to close notifications");
  }
});

/** POST /?action=callback – phone-callback request */
export const sendCallback = createAsyncThunk<
  unknown, // payload type
  {
    full_name: string;
    email: string;
    country_code: string;
    phone: string;
    country: string; // ISO-2
    validation: string;
    Besttimetocall?: string;
    user_id: string;
  }, // arg type
  { rejectValue: string }
>("messenger/sendCallback", async (p, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "callback",
      ...p,
      ...(p.Besttimetocall ? { Besttimetocall: p.Besttimetocall } : {}),
    });
    const { data } = await axios.post("/usermessenger", body);
    return data.data as unknown;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/* ═════════════════════════════
   2.  State & slice
   ═════════════════════════════ */

interface MessengerState {
  messages: { id: number; message: string ,created: string}[];
  count: number;

  /* one status per async action */
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  notifyStatus: "idle" | "loading" | "succeeded" | "failed";
  callbackStatus: "idle" | "loading" | "succeeded" | "failed";

  error?: string;
}

const initialState: MessengerState = {
  messages: [],
  count: 0,

  listStatus: "idle",
  notifyStatus: "idle",
  callbackStatus: "idle",
};

export const messengerSlice = createSlice({
  name: "messenger",
  initialState,
  reducers: {
    /** convenient helper to purge cached messages */
    clearMessages: (s) => {
      s.messages = [];
      s.listStatus = "idle";
    },
  },
  extraReducers: (builder) =>
    builder
      /* fetchMessages */
      .addCase(fetchMessages.pending, (s) => {
        s.listStatus = "loading";
        s.error = undefined;
      })
      .addCase(fetchMessages.fulfilled, (s, a) => {
        s.listStatus = "succeeded";
        s.messages = a.payload.rows;
      })
      .addCase(fetchMessages.rejected, (s, a) => {
        s.listStatus = "failed";
        s.error = a.payload ?? a.error.message;
      })

      /* fetchUnreadCount */
      .addCase(fetchUnreadCount.fulfilled, (s, a) => {
        s.count = a.payload.count;
      })
      .addCase(fetchUnreadCount.rejected, (s, a) => {
        s.error = a.payload ?? a.error.message;
      })

      /* closeNotifications */
      .addCase(closeNotifications.pending, (s) => {
        s.notifyStatus = "loading";
        s.error = undefined;
      })
      .addCase(closeNotifications.fulfilled, (s) => {
        s.notifyStatus = "succeeded";
        s.count = 0;
      })
      .addCase(closeNotifications.rejected, (s, a) => {
        s.notifyStatus = "failed";
        s.error = a.payload ?? a.error.message;
      })

      /* sendCallback */
      .addCase(sendCallback.pending, (s) => {
        s.callbackStatus = "loading";
        s.error = undefined;
      })
      .addCase(sendCallback.fulfilled, (s) => {
        s.callbackStatus = "succeeded";
      })
      .addCase(sendCallback.rejected, (s, a) => {
        s.callbackStatus = "failed";
        s.error = a.payload ?? a.error.message;
      }),
});

export const { clearMessages } = messengerSlice.actions;
export default messengerSlice.reducer;
