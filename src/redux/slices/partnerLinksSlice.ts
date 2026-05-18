// src\redux\slices\partnerLinksSlice.ts
import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import axios from '@/api/axiosInstance';

export interface Campaign { campaign:string; target_url:string; uid:string; }
interface LinksState {
  primary: string;
  campaigns: Campaign[];
  status: 'idle'|'loading'|'succeeded'|'failed';
}
const initial: LinksState = { primary:'', campaigns:[], status:'idle' };

export const fetchPartnerLinks = createAsyncThunk(
  'partners/links',
  async (user_id:string) => {
    const f = new FormData();
    f.append('user_id',user_id);
    f.append('action','getLinks');
    const {data} = await axios.post('/userpartnerlinks',f);
    return data.data as { primary:string; campaigns:Campaign[] };
  }
);
export const addPartnerLink = createAsyncThunk(
  'partners/addLink',
  async ({user_id,campaign,bannerLink}:{user_id:string;campaign:string;bannerLink?:string}) => {
    const f = new FormData();
    f.append('user_id',user_id);
    f.append('action','addLink');
    f.append('campaign',campaign);
    if(bannerLink) f.append('bannerLink',bannerLink);
    const {status} = await axios.post('/userpartnerlinks',f);
    return status===200;
  }
);

const slice = createSlice({
  name:'partners/links',
  initialState:initial,
  reducers:{},
  extraReducers:b=>{
    b.addCase(fetchPartnerLinks.pending,   s=>{s.status='loading';})
     .addCase(fetchPartnerLinks.fulfilled,(s,{payload})=>{
        s.primary=payload.primary;
        s.campaigns=payload.campaigns;
        s.status='succeeded';
      })
     .addCase(fetchPartnerLinks.rejected,  s=>{s.status='failed';});
    b.addCase(addPartnerLink.fulfilled,(s,{payload})=>{
      if(payload) s.status='idle'; // trigger refetch in UI
    });
  }
});
export default slice.reducer;
