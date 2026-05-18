// src\redux\slices\partnerReferralsSlice.ts
import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import axios from '@/api/axiosInstance';

export interface Referral {
  name:string;
  country:string;
  email:string; phone:string;
  status:string;
  deposited:boolean;
  accounts:{ login:string; type:string; currency:string; created:string; volume?:number; balance?:number; leverage?:string }[];
}
interface ReferralsState {
  rows:Referral[];
  page:number; perPage:number;
  status:'idle'|'loading'|'succeeded'|'failed';
}
const initial:ReferralsState = {rows:[],page:1,perPage:100,status:'idle'};

export const fetchReferrals = createAsyncThunk(
  'partners/referrals',
  async ({user_id,page,perPage}:{user_id:string;page:number;perPage:number}) => {
    const f=new FormData();
    f.append('user_id',user_id);
    f.append("action", "getReferrals");
    f.append('page',String(page));
    f.append('perPage',String(perPage));
    const {data} = await axios.post('/userpartnerreferrals',f);
    return data.data as { rows:Referral[]; page:number; perPage:number; };
  }
);

const slice = createSlice({
  name:'partners/referrals',
  initialState:initial,
  reducers:{},
  extraReducers:b=>{
    b.addCase(fetchReferrals.pending,    s=>{s.status='loading';})
     .addCase(fetchReferrals.fulfilled,  (s,{payload})=>{
        s.rows=payload.rows;
        s.page=payload.page;
        s.perPage=payload.perPage;
        s.status='succeeded';
      })
     .addCase(fetchReferrals.rejected,   s=>{s.status='failed';});
  }
});
export default slice.reducer;
