// src/redux/store.ts

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice"; // Authentication slice
import adminprofilesReducer from "./slices/adminProfilesSlice"; // Profiles slice
import admintransactionsReducer from "./slices/adminTransactionsSlice"; // Transactions slice
import adminDetailsReducer from "./slices/adminDetailsSlice"; // Detailed-transactions slice
import adminDocumentsReducer from "./slices/adminDocumentsSlice"; // Documents slice
import adminleadsReducer from "./slices/adminLeadsSlice"; // Leads slice
import adminProfileOverviewReducer from "./slices/adminProfileOverviewSlice"; // Profile overview slice
import userStatusesReducer from "./slices/userStatusesSlice";
import userAccessesReducer from "./slices/userAccessesSlice"; // User accesses slice
import adminDepositReducer from "./slices/adminDepositDetailsSlice";
import adminWithdrawalReducer from "./slices/adminWithdrawalDetailsSlice";
import adminTransferReducer from "./slices/adminTransferDetailsSlice";
import adminCardReducer from "./slices/adminCardDetailsSlice";
import adminMarketingReducer from "./slices/adminMarketingSlice";
import adminReferralsReducer from "./slices/adminReferralsSlice";
import profileReviewReducer from "./slices/adminProfileReviewSlice";
import clientProfileReducer from "./slices/clientProfileSlice";
import userAccountsReducer from "./slices/userAccountsSlice";
import accountTemplatesReducer from "./slices/accountTemplatesSlice";
import accountCreateReducer from "./slices/accountCreateSlice";
import accountDetailReducer from "./slices/accountDetailSlice";
import walletReducer from "./slices/walletSlice";
import depositReducer from "./slices/depositSlice";
import withdrawReducer from "./slices/withdrawSlice";
import transferReducer from "./slices/transferSlice";
import netellerReducer from "./slices/netellerSlice";
import skrillReducer from "./slices/skrillSlice";
import bankWireReducer from "./slices/bankWireSlice";

import netellerWithdrawReducer from "@/redux/slices/netellerWithdrawSlice";
import skrillWithdrawReducer from "@/redux/slices/skrillWithdrawSlice";
import bankWithdrawReducer from "@/redux/slices/bankWithdrawSlice";
import referReducer from "./slices/referFriendSlice";
import messengerReducer from "./slices/messengerSlice";
import salesClientReducer from "./slices/salesClientSlice";
import salesClientCreateReducer from "./slices/salesClientCreateSlice";
import salesLeadReducer from "./slices/salesLeadSlice";
import salesDemoReducer from "./slices/salesDemoSlice";
import leadDetailsReducer from "./slices/leadDetailsSlice";
import activationReducer from "./slices/activationSlice";
import partnerLinksReducer from "./slices/partnerLinksSlice";
import partnerReferralsReducer from "./slices/partnerReferralsSlice";
import partnerReferralAccountsReducer from "./slices/partnerReferralAccountsSlice";
import tradingCentralReducer from "./slices/tradingCentralSlice";
import publicActivationReducer from "./slices/publicActivationSlice";
import analystReducer from "./slices/analystSlice";
import dashboardReducer from "./slices/dashboardSlice"; // Dashboard slice
import userTransactionsReducer from "./slices/userTransactionsSlice";
import adminSettingsReducer from "./slices/adminSettingsSlice";
import customReportReducer from "./slices/customReportSlice";
import accountReportReducer from "./slices/accountReportSlice";
import mtAccountsReducer from "./slices/mtAccountsSlice";
import mt5AddAccountReducer from "./slices/mt5AddAccountSlice";
import onlineUsersReducer from "./slices/onlineUsersSlice";
import queueReducer from "./slices/queueSlice";
import salesReportReducer from "./slices/salesReportSlice";
import salesLeadHistoryReducer from "./slices/salesLeadHistorySlice";
import adminUsersReducer from "./slices/adminUsersSlice";
import paymentTransactionsReducer from "./slices/paymentTransactionsSlice";
import adminTypesReducer from "./slices/adminTypesSlice";
import adminGroupsReducer from "./slices/adminGroupsSlice";
import leadsImportReducer from "./slices/leadsImportSlice";

import whishReducer from "./slices/whishSlice";
import unlimitReducer from "./slices/unlimitSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profiles: adminprofilesReducer,
    transactions: admintransactionsReducer,
    adminDetails: adminDetailsReducer,
    documents: adminDocumentsReducer,
    leads: adminleadsReducer,
    profileOverview: adminProfileOverviewReducer,
    userStatuses: userStatusesReducer,
    userAccesses: userAccessesReducer,
    deposit: adminDepositReducer,
    withdrawal: adminWithdrawalReducer,
    transfer: adminTransferReducer,
    purse: adminCardReducer,
    marketing: adminMarketingReducer,
    referrals: adminReferralsReducer, //  👈 selector is `state.referrals`
    profileReview: profileReviewReducer,
    clientProfile: clientProfileReducer,
    accounts: userAccountsReducer, //  ←  add
    accountTemplates: accountTemplatesReducer, //  ←  already added earlier
    accountCreate: accountCreateReducer,
    accountDetails: accountDetailReducer,
    wallets: walletReducer,
    clientdeposit: depositReducer,
    withdraw: withdrawReducer,
    clienttransfer: transferReducer,
    neteller: netellerReducer,
    skrill: skrillReducer,
    bankwire: bankWireReducer,
    netellerWithdraw: netellerWithdrawReducer,
    skrillWithdraw: skrillWithdrawReducer,
    bankWithdraw: bankWithdrawReducer,
    refer: referReducer,
    messenger: messengerReducer,
    salesClient: salesClientReducer, // CRM Clients slice
    salesClientCreate: salesClientCreateReducer, // CRM Clients slice
    salesLead: salesLeadReducer, // CRM Clients slice
    salesDemo: salesDemoReducer, // CRM Clients slice
    leadDetails: leadDetailsReducer, // CRM Lead Details slice
    activation: activationReducer, // Activation slice
    publicActivation: publicActivationReducer,
    partnerLinks: partnerLinksReducer,
    partnerReferrals: partnerReferralsReducer,
    partnerReferralAccounts: partnerReferralAccountsReducer,
    tradingCentral: tradingCentralReducer,
    analyst: analystReducer,
    dashboard: dashboardReducer, // Dashboard slice
    userTransactions: userTransactionsReducer,
    adminSettings: adminSettingsReducer,
    customReport: customReportReducer,
    accountReport: accountReportReducer, // Custom report slice
    mtAccounts: mtAccountsReducer,
    mt5AddAccount: mt5AddAccountReducer,
    onlineUsers: onlineUsersReducer,
    queue: queueReducer,
    salesReport: salesReportReducer,
    salesLeadHistory: salesLeadHistoryReducer,
    adminUsers: adminUsersReducer,
    paymentTransactions: paymentTransactionsReducer,
    adminTypes: adminTypesReducer,
    adminGroups: adminGroupsReducer,
    leadsImport: leadsImportReducer,
    whish: whishReducer, // Whish deposit slice
    unlimit: unlimitReducer,
  },
});

// TypeScript Types for Redux Store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
