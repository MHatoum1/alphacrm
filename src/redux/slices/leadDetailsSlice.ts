// src/redux/slices/leadSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";
import dayjs from "dayjs";

/* ─────── DB-shaped objects ─────────────────────────────────────── */
export interface Note {
  id: number;
  note: string;
  modified: string;
  usertype: "admin" | "sales";
  sales_name?: string;
  future_date?: string | null;
}

export interface LeadDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  country_name: string;
  campaign: string;
  assigned_to: number | null;
  status: string;
  documents: 0 | 1;
  kyc: 0 | 1;
  isClient: boolean;
  phase: "demo" | "all";
  commMethod?: string;
  leadStatus?: string;
}

/* ─────── slice state ───────────────────────────────────────────── */
interface State {
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  lead?: LeadDetails;
  notes: Note[];
  phaseToggling: "idle" | "loading";

  /* NEW → feedback for “revert to admin” */
  actionStatus: "idle" | "loading" | "succeeded" | "failed";
  feedback?: string; // success message
  feedbackError?: string; // failure message
}

const initial: State = {
  status: "idle",
  notes: [],
  phaseToggling: "idle",
  actionStatus: "idle",
};

/* ─────── helpers ───────────────────────────────────────────────── */
const post = async (
  body: Record<string, string | number | null | undefined>
) => {
  const f = new FormData();
  /* ignore both undefined and null */
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined && v !== null) f.append(k, String(v));
  });
  return axios.post("/leadssales", f).then((r) => r.data);
};

const start = (s: State) => {
  s.actionStatus = "loading";
  s.feedback = s.feedbackError = undefined;
};
const success = (s: State, msg?: string) => {
  s.actionStatus = "succeeded";
  s.feedback = msg ?? "Action completed";
};
const fail = (s: State, err: any) => {
  s.actionStatus = "failed";
  s.feedbackError =
    typeof err.payload === "string"
      ? err.payload
      : err.error.message ?? "Action failed";
};

/* ─────── thunks ────────────────────────────────────────────────── */
export const fetchLead = createAsyncThunk<
  { lead: LeadDetails; notes: Note[] }, // payload
  number, // arg: lead id
  { rejectValue: string }
>("lead/fetch", async (id, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "get", id });
    return data as { lead: LeadDetails; notes: Note[] };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchLeadUpdate = createAsyncThunk<
  { lead: LeadDetails; notes: Note[] }, // payload
  number, // arg: lead id
  { rejectValue: string }
>("lead/fetchLeadUpdate", async (id, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "getUpdate", id });
    return data as { lead: LeadDetails; notes: Note[] };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const assignLead = createAsyncThunk<
  number, // payload: sales_id
  { id: number; sales_id: number }, // arg
  { rejectValue: string }
>("lead/assign", async (p, { rejectWithValue }) => {
  try {
    await post({ action: "assign", id: p.id, sales_id: p.sales_id });
    return p.sales_id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createNote = createAsyncThunk<
  Note, // payload: created note
  {
    user_id: string;
    id: number;
    note: string;
    future_date?: string | null;
  }, // arg
  { rejectValue: string }
>("lead/createNote", async (p, { rejectWithValue }) => {
  try {
    const { data } = await post({
      action: "createnote",
      user_id: p.user_id,
      id: p.id,
      note: p.note,
      future_date: p.future_date,
    });
    return data.note as Note;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const saveCommMethod = createAsyncThunk<
  { method: string; message: string },
  { user_id: string; id: number; method: string },
  { rejectValue: string }
>("lead/commMethod", async (p, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "savemethod", ...p });
    return { method: p.method, message: data.message as string };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const saveLeadCommMethod = createAsyncThunk<
  { method: string; message: string },
  { user_id: string; id: number; method: string },
  { rejectValue: string }
>("lead/LeadcommMethod", async (p, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "saveLeadsMethod", ...p });
    return { method: p.method, message: data.message as string };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const saveClientStatus = createAsyncThunk<
  { status: string; message: string },
  { user_id: string; id: number; status: string },
  { rejectValue: string }
>("lead/clientStatus", async (p, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "savestatus", ...p });
    return { status: p.status, message: data.message as string };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const saveLeadStatus = createAsyncThunk<
  { status: string; message: string },
  { user_id: string; id: number; status: string },
  { rejectValue: string }
>("lead/leadStatus", async (p, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "saveLeadstatus", ...p });
    return { status: p.status, message: data.message as string };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const toggleDemoPhase = createAsyncThunk<
  { phase: "demo" | "all"; message: string },
  { user_id: string; id: number },
  { rejectValue: string }
>("lead/togglePhase", async (p, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "setphase", ...p });
    return data as { phase: "demo" | "all"; message: string };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const revertLead = createAsyncThunk<
  { message: string },
  { user_id: string; id: number },
  { rejectValue: string }
>("lead/revert", async (p, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "revert", ...p });
    return data as { message: string };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const makeCold = createAsyncThunk<
  { message: string },
  { user_id: string; id: number },
  { rejectValue: string }
>("lead/cold", async (p, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "cold", ...p });
    return data as { message: string };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateNote = createAsyncThunk<
  {
    note_id: number;
    message: string;
    note: string;
    future_date?: string | null;
    modified: string;
  },
  {
    user_id: string;
    id: number;
    note_id: number;
    note: string;
    future_date?: string | null;
  },
  { rejectValue: string }
>("lead/updateNote", async (p, { rejectWithValue }) => {
  try {
    const { data } = await post({
      action: "updatenote",
      user_id: p.user_id,
      id: p.id,
      note_id: p.note_id,
      note: p.note,
      future_date: p.future_date,
    });
    return {
      note_id: p.note_id,
      message: data.message,
      note: p.note,
      future_date: p.future_date,
      modified: dayjs().format("YYYY-MM-DD"),
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/* ─────── slice definition ─────────────────────────────────────────── */
const slice = createSlice({
  name: "lead",
  initialState: initial,
  reducers: {
    reset: () => initial,
    clearFeedback: (s) => {
      s.actionStatus = "idle";
      s.feedback = undefined;
      s.feedbackError = undefined;
    },
  },
  extraReducers: (builder) =>
    builder
      /* fetch --------------------------------------------------- */
      .addCase(fetchLead.pending, (s) => {
        s.status = "loading";
        s.error = undefined;
      })
      .addCase(fetchLead.fulfilled, (s, action) => {
        s.status = "succeeded";
        s.lead = action.payload.lead;
        s.notes = action.payload.notes;
      })
      .addCase(fetchLead.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload ?? action.error.message;
      })
      .addCase(fetchLeadUpdate.pending, (s) => {
        s.status = "loading";
        s.error = undefined;
      })
      .addCase(fetchLeadUpdate.fulfilled, (s, action) => {
        s.status = "succeeded";
        s.lead = action.payload.lead;
        s.notes = action.payload.notes;
      })
      .addCase(fetchLeadUpdate.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload ?? action.error.message;
      })

      /* assign -------------------------------------------------- */
      .addCase(assignLead.fulfilled, (s, action) => {
        if (s.lead) s.lead.assigned_to = action.payload;
      })
      .addCase(assignLead.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload ?? action.error.message;
      })

      /* create note --------------------------------------------- */
      .addCase(createNote.fulfilled, (s, action) => {
        s.notes.unshift(action.payload);
        success(s, "note_created_ok");
      })
      .addCase(createNote.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload ?? action.error.message;
      })

      /* comm-method -------------------------------------------- */
      .addCase(saveCommMethod.pending, start)
      .addCase(saveCommMethod.fulfilled, (s, action) => {
        success(s, action.payload.message);
        if (s.lead) s.lead.commMethod = action.payload.method;
      })
      .addCase(saveCommMethod.rejected, fail)

      .addCase(saveLeadCommMethod.pending, start)
      .addCase(saveLeadCommMethod.fulfilled, (s, action) => {
        success(s, action.payload.message);
        if (s.lead) s.lead.commMethod = action.payload.method;
      })
      .addCase(saveLeadCommMethod.rejected, fail)

      /* lead status -------------------------------------------- */
      .addCase(saveLeadStatus.pending, start)
      .addCase(saveLeadStatus.fulfilled, (s, action) => {
        success(s, action.payload.message);
        if (s.lead) s.lead.leadStatus = action.payload.status;
      })
      .addCase(saveLeadStatus.rejected, fail)
      .addCase(saveClientStatus.pending, start)
      .addCase(saveClientStatus.fulfilled, (s, action) => {
        success(s, action.payload.message);
        if (s.lead) s.lead.leadStatus = action.payload.status;
      })
      .addCase(saveClientStatus.rejected, fail)

      /* phase toggle ------------------------------------------- */
      .addCase(toggleDemoPhase.pending, start)
      .addCase(toggleDemoPhase.fulfilled, (s, action) => {
        success(s, action.payload.message);
        if (s.lead) s.lead.phase = action.payload.phase;
      })
      .addCase(toggleDemoPhase.rejected, fail)

      /* cold / revert – no local-state change necessary --------- */
      .addCase(makeCold.pending, start)
      .addCase(makeCold.fulfilled, (s, action) =>
        success(s, action.payload.message)
      )
      .addCase(makeCold.rejected, fail)
      .addCase(revertLead.pending, start)
      .addCase(revertLead.fulfilled, (s, action) =>
        success(s, action.payload.message)
      )
      .addCase(revertLead.rejected, fail)

      /* update note --------------------------------------------- */
      .addCase(updateNote.pending, start)
      .addCase(updateNote.fulfilled, (s, action) => {
        success(s, action.payload.message);
        const n = s.notes.find((x) => x.id === action.payload.note_id);
        if (n) {
          n.note = action.payload.note;
          n.future_date = action.payload.future_date;
          n.modified = action.payload.modified;
        }
      })
      .addCase(updateNote.rejected, fail),
});

export const { reset, clearFeedback } = slice.actions;
export default slice.reducer;
