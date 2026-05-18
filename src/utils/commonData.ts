// src/api/common_data.ts

export interface User {
  id: number;
  name: string;
  email: string;
  filenum: string;
  country: string;
  zip: string;
  city: string;
  address: string;
  birth_date: string;
  phone: string;
  mobile_phone: string;
  nationality: string;
  fatca: boolean;
  fatca_number?: string;
  created: string; // ISO date
  verified: boolean;
  limited: boolean;
  dormant: boolean;
  affiliate: boolean;
  deleted: boolean;
  campaign?: string;
  profile_risk_level?: string;
  approved: boolean;
}

export interface FileRecord {
  doc_type: number;
  status: number;
  file_name: string;
}

export interface Note {
  id: number;
  sub_type: string;
  message: string;
  future_date?: string | null; // ISO date/time string or null
  owner_name: string;
  usertype: string;
  created: string; // ISO date/time string
}
