// src/routesConfig.ts

import React, { lazy } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));

const Profiles = lazy(() => import("./pages/Admin/Profiles/Profiles"));
const AddUserPage = lazy(() => import("./pages/Admin/Profiles/AddUserPage"));
const ChildrenLayout = lazy(() => import("./components/ChildrenLayout"));
const Deposits = lazy(() => import("./pages/Admin/Transactions/Deposits"));
const Withdrawals = lazy(
  () => import("./pages/Admin/Transactions/Withdrawals")
);
const Internals = lazy(() => import("./pages/Admin/Transactions/Internals"));
const Cards = lazy(() => import("./pages/Admin/Transactions/Cards"));

const Documents = lazy(() => import("./pages/Admin/Documents/Documents"));
const DocumentEditorPage = lazy(
  () => import("./pages/Admin/Documents/DocumentEditorPage")
);
const Leads = lazy(() => import("./pages/Admin/Leads/Leads"));
const AdminClientCreatePage = lazy(
  () => import("./pages/Admin/Leads/AdminClientCreatePage")
);

const LeadsImportPage = lazy(
  () => import("./pages/Admin/Leads/LeadsImportPage")
);


const TypesListPage = lazy(
  () => import("./pages/Admin/GroupsTypes/TypesListPage")
);
const TypeEditorPage = lazy(
  () => import("./pages/Admin/GroupsTypes/TypeEditorPage")
);

const GroupsListPage = lazy(
  () => import("./pages/Admin/GroupsTypes/GroupsListPage")
);
const GroupsEditorPage = lazy(
  () => import("./pages/Admin/GroupsTypes/GroupsEditorPage")
);

const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Register = lazy(() => import("./pages/Register"));
const RegisterIB = lazy(() => import("./pages/RegisterIB"));
const RequestPassword = lazy(() => import("./pages/Request"));
const ResetPassword = lazy(() => import("./pages/Reset"));
const PublicActivationPage = lazy(() => import("./pages/PublicActivationPage"));
// ➊ import your new page
const ProfilesMenu = lazy(() => import("./pages/Admin/Details/ProfilesMenu"));
const StatusesPage = lazy(() => import("./pages/Admin/Details/Statuses"));
const OverviewPage = lazy(() => import("./pages/Admin/Details/Overview"));
const AccountsPage = lazy(() => import("./pages/Admin/Details/Accounts"));
const TransactionsPage = lazy(
  () => import("./pages/Admin/Details/Transactions")
);
const PursesPage = lazy(() => import("./pages/Admin/Details/Purses"));
const MessengerPage = lazy(() => import("./pages/Admin/Details/Messenger"));
const LogsPage = lazy(() => import("./pages/Admin/Details/Logs"));
const QueuePage = lazy(() => import("./pages/Admin/Details/Queue"));
const SecurePage = lazy(() => import("./pages/Admin/Details/Secure"));
const PermissionsPage = lazy(() => import("./pages/Admin/Details/Permissions"));
const ReferralsPage = lazy(() => import("./pages/Admin/Details/Referrals"));
const PaymentTransactionsPage = lazy(
  () => import("./pages/Admin/Details/PaymentTransactionsPage")
);
const AdminCreateAccountPage = lazy(
  () => import("./pages/Admin/Details/AdminCreateAccountPage")
);
// const ComingSoonPage = lazy(() => import("./pages/Admin/Details/ComingSoon"));

const DepositDetailsPage = lazy(
  () => import("./pages/Admin/Transactions/Details/DepositDetails")
);

const WithdrawalDetailsPage = lazy(
  () => import("./pages/Admin/Transactions/Details/WithdrawalDetails")
);

const InternalDetailsPage = lazy(
  () => import("./pages/Admin/Transactions/Details/InternalDetails")
);

const CardDetailsPage = lazy(
  () => import("./pages/Admin/Transactions/Details/CardDetails")
);

const MarketingMenu = lazy(
  () => import("./pages/Admin/Marketing/MarketingMenu")
);
const MarketingPage = lazy(() => import("./pages/Admin/Marketing/Marketing"));
const MarketingArchivedPage = lazy(
  () => import("./pages/Admin/Marketing/MarketingArchived")
);
const CampaignDetailsPage = lazy(
  () => import("./pages/Admin/Marketing/CampaignDetails")
);

const FriendsReferralsPage = lazy(
  () => import("./pages/Admin/Marketing/Referrals")
);

const ProfilesReviewPage = lazy(
  () => import("./pages/Admin/ProfilesReview/ReviewMenu")
);

const PersonalTab = lazy(
  () => import("./pages/Admin/ProfilesReview/tabs/PersonalTab")
);

const EmploymentTab = lazy(
  () => import("./pages/Admin/ProfilesReview/tabs/EmploymentTab")
);
const TradingTab = lazy(
  () => import("./pages/Admin/ProfilesReview/tabs/TradingTab")
);
const AgreementsTab = lazy(
  () => import("./pages/Admin/ProfilesReview/tabs/AgreementsTab")
);
const DocumentsTab = lazy(
  () => import("./pages/Admin/ProfilesReview/tabs/DocumentsTab")
);
// const IbDetailsTab     = lazy(() => import(
//   "./pages/Admin/ProfilesReview/tabs/IbDetailsTab"));
const RiskTab = lazy(
  () => import("./pages/Admin/ProfilesReview/tabs/RiskAssessmentTab")
);
const CddTab = lazy(() => import("./pages/Admin/ProfilesReview/tabs/CddTab"));

const ClientMenu = lazy(() => import("./pages/User/ClientProfile/ClientMenu"));

const ClientOverviewTab = lazy(
  () => import("./pages/User/ClientProfile/tabs/ClientOverviewTab")
);

const ClientActivationTab = lazy(
  () => import("./pages/User/ClientProfile/tabs/ClientActivationPage")
);
const ClientPersonalTab = lazy(
  () => import("./pages/User/ClientProfile/tabs/ClientPersonalTab")
);
const ClientEmploymentTab = lazy(
  () => import("./pages/User/ClientProfile/tabs/ClientEmploymentTab")
);

const ClientTradingTab = lazy(
  () => import("./pages/User/ClientProfile/tabs/ClientTradingTab")
);

const ClientAgreementsTab = lazy(
  () => import("./pages/User/ClientProfile/tabs/ClientAgreementsTab")
);

const ClientDocumentsTab = lazy(
  () => import("./pages/User/ClientProfile/tabs/ClientDocumentsTab")
);

const ResetPasswordPage = lazy(
  () => import("./pages/User/ClientProfile/tabs/ResetPasswordPage")
);

const ClientAccountsPage = lazy(
  () => import("./pages/User/Accounts/AccountsPage")
);
const CreateSelection = lazy(
  () => import("./pages/User/Accounts/CreateSelection")
);
const CreateAccountPage = lazy(
  () => import("./pages/User/Accounts/CreateAccountPage")
);

const AccountDetailsLayout = lazy(
  () => import("./pages/User/Accounts/Details/AccountDetailsLayout")
);

const AccTransactionsTab = lazy(
  () => import("./pages/User/Accounts/Details/AccTransactionsTab")
);
const AccOpenTradesTab = lazy(
  () => import("./pages/User/Accounts/Details/AccOpenTradesTab")
);

const AccHistoryTab = lazy(
  () => import("./pages/User/Accounts/Details/AccHistoryTab")
);

const AccSecurityTab = lazy(
  () => import("./pages/User/Accounts/Details/AccSecurityTab")
);

const AccFundDemoTab = lazy(
  () => import("./pages/User/Accounts/Details/AccFundDemoTab")
);

const WalletsPage = lazy(() => import("./pages/User/Wallets/WalletsPage"));

const DepositOptionsPage = lazy(
  () => import("./pages/User/Deposit/DepositOptionsPage")
);

const WithdrawOptionsPage = lazy(
  () => import("./pages/User/Withdrawals/WithdrawOptionsPage")
);

const InternalTransferPage = lazy(
  () => import("./pages/User/Accounts/InternalTransferPage")
);

const NetellerDepositPage = lazy(
  () => import("./pages/User/Deposit/NetellerDepositPage")
);

const WhishDepositPage = lazy(
  () => import("./pages/User/Deposit/WhishDepositPage")
);
const UnlimitDepositPage = lazy(
  () => import("./pages/User/Deposit/UnlimitDepositPage")
);
const GooglePayDepositPage = lazy(
  () => import("./pages/User/Deposit/GooglePayDepositPage")
);
const GooglePayResultPage = lazy(
  () => import("./pages/User/Deposit/GooglePayResultPage")
);
const ApplePayDepositPage = lazy(
  () => import("./pages/User/Deposit/ApplePayDepositPage")
);


const SkrillDepositPage = lazy(
  () => import("./pages/User/Deposit/SkrillDepositPage")
);

const UsdtDepositPage = lazy(
  () => import("./pages/User/Deposit/UsdtDepositPage")
);

const BankWireDepositPage = lazy(
  () => import("./pages/User/Deposit/BankWireDepositPage")
);

const NetellerWithdrawPage = lazy(
  () => import("./pages/User/Withdrawals/NetellerWithdrawPage")
);

const SkrillWithdrawPage = lazy(
  () => import("./pages/User/Withdrawals/SkrillWithdrawPage")
);

const UsdtWithdrawPage = lazy(
  () => import("./pages/User/Withdrawals/UsdtWithdrawPage")
);

const BankTransferWithdrawPage = lazy(
  () => import("./pages/User/Withdrawals/BankTransferWithdrawPage")
);

const WhishWithdrawPage = lazy(
  () => import("./pages/User/Withdrawals/WhishWithdrawPage")
);
const UnlimitWithdrawPage = lazy(
  () => import("./pages/User/Withdrawals/UnlimitWithdrawPage")
);
const Logout = lazy(() => import("./pages/Logout"));

const ReferAFriendPage = lazy(() => import("./pages/User/ReferAFriendPage"));

const EducationalMaterialPage = lazy(
  () => import("./pages/User/EducationalMaterialPage")
);

const ContactUsPage = lazy(() => import("./pages/User/ContactUsPage"));

const SalesClientsPage = lazy(() => import("./pages/Sales/SalesClientsPage"));

const SalesClientCreatePage = lazy(
  () => import("./pages/Sales/SalesClientCreatePage")
);

const SalesLeadsPage = lazy(() => import("./pages/Sales/SalesLeadsPage"));
const SalesDemoPage = lazy(() => import("./pages/Sales/SalesDemoPage"));
const SalesLeadHistoryPage = lazy(
  () => import("./pages/Sales/SalesLeadHistoryPage")
);
const LeadUpdatePage = lazy(() => import("./pages/Sales/LeadUpdatePage"));
const LeadPage = lazy(() => import("./pages/Sales/LeadPage"));
const SalesReportPage = lazy(() => import("./pages/Sales/SalesReportPage"));

const PartnersLayout = lazy(
  () => import("./pages/User/Partners/PartnersLayout")
);
const PartnersLinks = lazy(
  () => import("./pages/User/Partners/PartnerLinksTab")
);
const PartnersReferrals = lazy(
  () => import("./pages/User/Partners/PartnerReferralsTab")
);

const PartnerReferralsByAccount = lazy(
  () => import("./pages/User/Partners/PartnerReferralsByAccountTab")
);

const TradingCentralPage = lazy(
  () => import("./pages/User/TradingTools/TradingCentralPage")
);
const CalendarPage = lazy(
  () => import("./pages/User/TradingTools/CalendarPage")
);

const TechnicalAnalysisPage = lazy(
  () => import("./pages/User/TradingTools/TechnicalAnalysisPage")
);

const SettingsMenu = lazy(() => import("./pages/Admin/Settings/SettingsMenu"));

const RelationshipTab = lazy(
  () => import("./pages/Admin/Settings/RelationshipTab")
);

const CustomReportPage = lazy(
  () => import("./pages/Admin/Settings/CustomReportPage")
);

const AccountReportPage = lazy(
  () => import("./pages/Admin/Settings/AccountReportPage")
);

const AdminQueuePage = lazy(
  () => import("./pages/Admin/Settings/AdminQueuePage")
);

const AdminTranslationsPage = lazy(
  () => import("./pages/Admin/Settings/AdminTranslations")
);
const Mt5AddAccountsTab = lazy(
  () => import("./pages/Admin/Settings/Mt5AddAccountsTab")
);

const AccountsMenu = lazy(() => import("./pages/Admin/Accounts/AccountsMenu"));

const MTAccountsPage = lazy(
  () => import("./pages/Admin/Accounts/MTAccountsPage")
);
const OnlineUsersPage = lazy(
  () => import("./pages/Admin/Accounts/OnlineUsersPage")
);

export interface RouteConfig {
  path: string;
  titleKey: string;
  component?: React.ComponentType;
  external?: string; // ← add this
  roles?: string[];
  icon?: string;
  hideInNav?: boolean;
  tab?: string;
  children?: RouteConfig[];
  affiliateOnly?: boolean;
}

export const routesConfig: RouteConfig[] = [
  {
    path: "/",
    titleKey: "dashboard",
    component: Dashboard,
    roles: [
      "admin",
      "backoffice",
      "translators",
      "viewer",
      "accounting",
      "head_of_sales",
      "dealers",
    ],
    icon: "la la-tachometer-alt",
  },

  {
    path: "/", //  ← no trailing “/*”
    titleKey: "dashboard",
    component: UserDashboard,
    roles: ["secure"],
    icon: "la la-tachometer-alt",

    children: [
      {
        path: "dashboard/tradingcentral",
        titleKey: "tradingcentral",
        component: TradingCentralPage,
        roles: ["secure"],
        hideInNav: true,
      },
      {
        path: "dashboard/calendar",
        titleKey: "calendar",
        component: CalendarPage,
        roles: ["secure"],
        hideInNav: true,
      },
      {
        path: "dashboard/analyst",
        titleKey: "technical_analysis",
        component: TechnicalAnalysisPage,
        roles: ["secure"],
        hideInNav: true,
      },
    ],
  },
  {
    path: "/login",
    titleKey: "login",
    component: Login,
    hideInNav: true,
  },
  {
    path: "/register",
    titleKey: "register",
    component: Register,
    hideInNav: true,
  },
   {
    path: "/sign-up",
    titleKey: "register",
    component: SignUp,
    hideInNav: true,
  },
  {
    path: "/partner_register",
    titleKey: "partner_account",
    component: RegisterIB,
    hideInNav: true, // or show it in the sidebar – your call
  },
  {
    path: "/request",
    titleKey: "request",
    component: RequestPassword,
    hideInNav: true,
  },
  {
    path: "/resetpassword/:token?",
    titleKey: "reset",
    component: ResetPassword,
    hideInNav: true,
  },
  {
    path: "/activate/:token?",
    titleKey: "activate",
    component: PublicActivationPage,
    hideInNav: true,
  },
  {
    path: "/userprofile", //  ← no trailing “/*”
    titleKey: "profile",
    component: ClientMenu,
    roles: ["secure"],
    icon: "la la-user", //  ← give it an icon
    /* ▼ child routes that <Outlet/> can render */
    children: [
      {
        path: "overview",
        titleKey: "overview",
        component: ClientOverviewTab,
        roles: ["secure"],
        tab: "overview",
        hideInNav: false,
      },
      {
        path: "activatepage",
        titleKey: "activatepage",
        component: ClientActivationTab,
        roles: ["secure"],
        tab: "overview",
        hideInNav: true,
      },
      {
        path: "personal",
        titleKey: "personal",
        component: ClientPersonalTab,
        roles: ["secure"],
        tab: "personal",
        hideInNav: false,
      },
      {
        path: "employment",
        titleKey: "employment",
        component: ClientEmploymentTab,
        roles: ["secure"],
        tab: "employment",
        hideInNav: false,
      },
      {
        path: "trading",
        titleKey: "trading",
        component: ClientTradingTab,
        roles: ["secure"],
        tab: "trading",
        hideInNav: false,
      },
      {
        path: "agreements",
        titleKey: "agreements",
        component: ClientAgreementsTab,
        roles: ["secure"],
        tab: "agreements",
        hideInNav: false,
      },

      {
        path: "documents",
        titleKey: "documents",
        component: ClientDocumentsTab,
        roles: ["secure"],
        tab: "documents",
        hideInNav: false,
      },
      {
        path: "password",
        titleKey: "password",
        component: ResetPasswordPage,
        roles: ["secure"],
        tab: "password",
        hideInNav: false,
      },
    ],
  },
  {
    path: "/accounts", //  ← no trailing “/*”
    titleKey: "accounts",
    component: ClientAccountsPage,
    roles: ["secure"],
    icon: "la la-list", //  ← give it an icon
    children: [
      // ⬇ NEW child - now the sidebar-layout stays mounted
      {
        path: "create/:type/:shortval/:className/:platform",
        titleKey: "open_account",
        component: CreateAccountPage,
        hideInNav: true,
        roles: ["secure"],
      },
      {
        path: ":mode",
        titleKey: "open_account",
        component: CreateSelection,
        hideInNav: true,
        roles: ["secure"],
      },

      /* existing entries … */
      {
        path: "create_selection",
        titleKey: "create_account",
        component: CreateSelection,
        roles: ["secure"],
        hideInNav: true,
      },
      {
        path: "transfer",
        titleKey: "internal_transfer",
        component: InternalTransferPage,
        roles: ["secure"],
        icon: "la la-random",
      },
      {
        path: "detailed/:uid/*",
        titleKey: "account_details",
        component: AccountDetailsLayout,
        roles: ["secure"],
        hideInNav: true,
        children: [
          {
            path: ":transactions",
            titleKey: "transactions",
            component: AccTransactionsTab,
            hideInNav: true,
            roles: ["secure"],
          },
          {
            path: "trades",
            titleKey: "trades",
            component: AccOpenTradesTab,
            hideInNav: true,
            roles: ["secure"],
          },
          {
            path: "history",
            titleKey: "history",
            component: AccHistoryTab,
            hideInNav: true,
            roles: ["secure"],
          },
          {
            path: "security",
            titleKey: "security",
            component: AccSecurityTab, // ← point to the new file
            hideInNav: true,
            roles: ["secure"],
          },
          {
            path: "fund_demo_account",
            titleKey: "fund_demo",
            component: AccFundDemoTab,
            hideInNav: true,
            roles: ["secure"],
          },
        ],
      },
    ],
  },

  // Protected Routes:
  {
    path: "/profiles",
    titleKey: "profiles",
    component: Profiles,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
    icon: "la la-user",
    children: [
      {
        path: "all",
        titleKey: "all_profiles",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "all",
        hideInNav: false,
      },
      {
        path: "nonactivated",
        titleKey: "nonactivated",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "nonactivated",
        hideInNav: false,
      },
      {
        path: "uncompleted",
        titleKey: "uncompleted_profiles",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "uncompleted",
        hideInNav: true,
      },
      {
        path: "toverify",
        titleKey: "toverify",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "toverify",
        hideInNav: true,
      },
      {
        path: "limited",
        titleKey: "limited",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "limited",
        hideInNav: true,
      },
      {
        path: "dormant",
        titleKey: "dormant",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "dormant",
        hideInNav: true,
      },
      {
        path: "verified",
        titleKey: "verified",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "verified",
        hideInNav: false,
      },
      {
        path: "notified",
        titleKey: "notified",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "notified",
        hideInNav: true,
      },
      {
        path: "ib",
        titleKey: "ib",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "ib",
        hideInNav: false,
      },
      {
        path: "archived",
        titleKey: "archived",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "archived",
        hideInNav: true,
      },
      {
        path: "backoffice",
        titleKey: "backoffice",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "backoffice",
        hideInNav: true,
      },
      {
        path: "sales",
        titleKey: "sales",
        component: Profiles,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "sales",
        hideInNav: true,
      },
      {
        path: "detailed/personal/:id",
        titleKey: "overview",
        component: OverviewPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "create_profile",
        titleKey: "create_profile",
        component: AddUserPage,
        roles: ["admin", "backoffice", "accounting", "head_of_sales"],
        tab: "backoffice",
        hideInNav: true,
      },
    ],
  },

  {
    path: "/detailed",
    titleKey: "profile_details", // or something like "profile_details"
    component: ProfilesMenu,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
    hideInNav: true,
    children: [
      {
        path: "statuses/:id",
        titleKey: "statuses",
        component: StatusesPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "personal/:id",
        titleKey: "overview",
        component: OverviewPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "accounts/:id",
        titleKey: "accounts",
        component: AccountsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "transactions/:id",
        titleKey: "transactions",
        component: TransactionsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "purses/:id",
        titleKey: "purses",
        component: PursesPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "messenger/:id",
        titleKey: "messenger",
        component: MessengerPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "secure/:id",
        titleKey: "secure",
        component: SecurePage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "logs/:id",
        titleKey: "action_logs",
        component: LogsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "queue/:id",
        titleKey: "emails_sent",
        component: QueuePage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "review/:id/*", // 👈 note the trailing *
        titleKey: "update_info",
        component: ProfilesReviewPage, // (ReviewMenu)
        roles: ["admin", "backoffice", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,

        /* ▼ child routes that <Outlet/> can render */
        children: [
          {
            path: "personal",
            titleKey: "personal",
            component: PersonalTab,
            roles: ["admin", "backoffice", "accounting", "head_of_sales", "dealers"],
            tab: "personal",
            hideInNav: false,
          },
          {
            path: "employment",
            titleKey: "employment",
            component: EmploymentTab,
            roles: ["admin", "backoffice", "accounting", "head_of_sales", "dealers"],
            tab: "employment",
            hideInNav: false,
          },
          {
            path: "trading",
            titleKey: "trading",
            component: TradingTab,
            roles: ["admin", "backoffice", "accounting", "head_of_sales", "dealers"],
            tab: "trading",
            hideInNav: false,
          },
          {
            path: "agreements",
            titleKey: "agreements",
            component: AgreementsTab,
            roles: ["admin", "backoffice", "accounting", "head_of_sales", "dealers"],
            tab: "agreements",
            hideInNav: false,
          },

          {
            path: "risk_assessment",
            titleKey: "risk_assessment",
            component: RiskTab,
            roles: ["admin", "backoffice", "accounting", "head_of_sales", "dealers"],
            tab: "risk_assessment",
            hideInNav: false,
          },
          {
            path: "cdd",
            titleKey: "cdd",
            component: CddTab,
            roles: ["admin", "backoffice", "accounting", "head_of_sales", "dealers"],
            tab: "cdd",
            hideInNav: false,
          },
          {
            path: "documents",
            titleKey: "documents",
            component: DocumentsTab,
            roles: ["admin", "backoffice", "accounting", "head_of_sales", "dealers"],
            tab: "documents",
            hideInNav: false,
          },
        ],
      },
      {
        path: "permissions/:id",
        titleKey: "permissions",
        component: PermissionsPage,
        roles: ["admin", "backoffice", "accounting", "head_of_sales"],
        hideInNav: true,
      },
      {
        path: "referrals/:id",
        titleKey: "referrals",
        component: ReferralsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        hideInNav: true,
      },
      {
        path: "payment_transactions/:id",
        titleKey: "payment_transactions",
        component: PaymentTransactionsPage,
        roles: ["admin", "backoffice", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "create_account/:id",
        titleKey: "create_account",
        component: AdminCreateAccountPage,
        roles: ["admin", "backoffice", "accounting", "head_of_sales"],
        hideInNav: true,
      },
    ],
  },

  {
    path: "/transactions",
    titleKey: "transactions",
    component: ChildrenLayout, // ← use your new layout
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
    icon: "la la-wallet",
    children: [
      {
        path: "all_deposits",
        titleKey: "deposits",
        component: Deposits,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "all_deposits",
        hideInNav: false,
      },
      {
        path: "all_withdrawals",
        titleKey: "withdrawals",
        component: Withdrawals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "all_withdrawals",
        hideInNav: false,
      },
      {
        path: "all_internals",
        titleKey: "internal_transfers",
        component: Internals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "all_internals",
        hideInNav: false,
      },
      {
        path: "all_cards",
        titleKey: "credit_cards",
        component: Cards,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "all_cards",
        hideInNav: false,
      },
      {
        path: "cards/detailed/:id",
        titleKey: "card_details",
        component: CardDetailsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "deposits/detailed/:id",
        titleKey: "deposits",
        component: DepositDetailsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "withdrawals/detailed/:id",
        titleKey: "withdrawals",
        component: WithdrawalDetailsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
      {
        path: "own/detailed/:id",
        titleKey: "internals",
        component: InternalDetailsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        hideInNav: true,
      },
    ],
  },
  {
    path: "/deposits",
    titleKey: "deposits",
    component: Deposits,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
    icon: "la la-donate",
    hideInNav: true,
    children: [
      {
        path: "all_deposits",
        titleKey: "all_deposits",
        component: Deposits,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "all_deposits",
        hideInNav: false,
      },
      {
        path: "new",
        titleKey: "new",
        component: Deposits,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "new",
        hideInNav: true,
      },
      {
        path: "approved",
        titleKey: "approved",
        component: Deposits,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "approved",
        hideInNav: true,
      },
      {
        path: "declined",
        titleKey: "declined",
        component: Deposits,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "declined",
        hideInNav: true,
      },
      {
        path: "successful",
        titleKey: "successful",
        component: Deposits,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "successful",
        hideInNav: true,
      },
      {
        path: "failed",
        titleKey: "failed",
        component: Deposits,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "failed",
        hideInNav: true,
      },
      {
        path: "pending",
        titleKey: "pending",
        component: Deposits,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "pending",
        hideInNav: true,
      },
    ],
  },
  {
    path: "/withdrawals",
    titleKey: "withdrawals",
    component: Withdrawals,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
    icon: "la la-money-bill-alt",
    hideInNav: true,
    children: [
      {
        path: "all_withdrawals",
        titleKey: "all_withdrawals",
        component: Withdrawals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "all_withdrawals",
        hideInNav: false,
      },
      {
        path: "new",
        titleKey: "new",
        component: Withdrawals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"  , "dealers"],
        tab: "new",
        hideInNav: true,
      },
      {
        path: "approved",
        titleKey: "approved",
        component: Withdrawals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "approved",
        hideInNav: true,
      },
      {
        path: "declined",
        titleKey: "declined",
        component: Withdrawals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "declined",
        hideInNav: true,
      },
      {
        path: "successful",
        titleKey: "successful",
        component: Withdrawals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers" ],
        tab: "successful",
        hideInNav: true,
      },
      {
        path: "failed",
        titleKey: "failed",
        component: Withdrawals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "failed",
        hideInNav: true,
      },
    ],
  },
  {
    path: "/internals",
    titleKey: "internals",
    component: Internals,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
    icon: "la la-wallet",
    hideInNav: true,
    children: [
      {
        path: "all_internals",
        titleKey: "all_internals",
        component: Internals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "all_internals",
        hideInNav: false,
      },
      {
        path: "pending",
        titleKey: "pending",
        component: Internals,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "pending",
        hideInNav: true,
      },
    ],
  },
  {
    path: "/cards",
    titleKey: "cards",
    component: Cards,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
    icon: "la la-wallet",
    hideInNav: true,
    children: [
      {
        path: "all_cards",
        titleKey: "all_cards",
        component: Cards,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "all_cards",
        hideInNav: false,
      },
      {
        path: "new",
        titleKey: "new",
        component: Cards,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "new",
        hideInNav: true,
      },
      {
        path: "approved",
        titleKey: "approved",
        component: Cards,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "approved",
        hideInNav: true,
      },
      {
        path: "declined",
        titleKey: "declined",
        component: Cards,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales", "dealers"],
        tab: "declined",
        hideInNav: true,
      },
    ],
  },
  {
    path: "/documents",
    titleKey: "documents",
    component: Documents,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
    icon: "la la-toolbox",
    hideInNav: false,
    children: [
      {
        path: "new",
        titleKey: "new",
        component: Documents,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "new",
        hideInNav: false,
      },

      {
        path: "approved",
        titleKey: "approved",
        component: Documents,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "approved",
        hideInNav: false,
      },
      {
        path: "rejected",
        titleKey: "rejected",
        component: Documents,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "rejected",
        hideInNav: false,
      },
      {
        path: "expired",
        titleKey: "expired",
        component: Documents,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "expired",
        hideInNav: true,
      },
      {
        path: "archived",
        titleKey: "archived",
        component: Documents,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "archived",
        hideInNav: true,
      },
    ],
  },
  {
    path: "/editdocs/:userId/:fileName",
    titleKey: "edit",
    component: DocumentEditorPage,
    roles: ["admin", "backoffice", "accounting", "head_of_sales"],
    tab: "new",
    hideInNav: false,
  },
  {
    path: "/groupstypes", // or "/types"
    titleKey: "groups_types",
    component: TypesListPage,
    roles: ["admin", "backoffice", "accounting"],
    icon: "la la-poll-h",
    hideInNav: false,
    children: [
      {
        path: "manage_types",
        titleKey: "manage_types",
        component: TypesListPage,
        roles: ["admin", "backoffice", "accounting"],
        tab: "manage_types",
        hideInNav: false,
      },
      {
        path: "new",
        titleKey: "create_type",
        component: TypeEditorPage,
        roles: ["admin", "backoffice", "accounting"],
        hideInNav: true, // don’t show “Create” in sidebar
      },
      {
        path: ":id/edit",
        titleKey: "edit_type",
        component: TypeEditorPage,
        roles: ["admin", "backoffice", "accounting"],
        hideInNav: true, // don’t show “Edit” in sidebar
      },
      {
        path: "manage_groups",
        titleKey: "manage_groups",
        component: GroupsListPage,
        roles: ["admin", "backoffice", "accounting"],
        tab: "manage_groups",
        hideInNav: false,
      },
      {
        path: "newgroup",
        titleKey: "create_group",
        component: GroupsEditorPage,
        roles: ["admin", "backoffice", "accounting"],
        hideInNav: true, // don’t show “Create” in sidebar
      },
      {
        path: ":id/editgroup",
        titleKey: "edit_group",
        component: GroupsEditorPage,
        roles: ["admin", "backoffice", "accounting"],
        hideInNav: true, // don’t show “Edit” in sidebar
      },
    ],
  },
  {
    path: "/potential",
    titleKey: "leads",
    component: Leads,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
    icon: "la la-poll-h",
    hideInNav: false,
    children: [
      {
        path: "clients",
        titleKey: "clients",
        component: Leads,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "clients",
        hideInNav: false,
      },

      {
        path: "leads",
        titleKey: "leads",
        component: Leads,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "leads",
        hideInNav: false,
      },
        {
        path: "updateLeads/:id",
        titleKey: "update_lead",
        component: LeadUpdatePage,
        roles: ["admin", "backoffice",], // ← adjust ACL
        hideInNav: true, // reached from the options table
      },
      {
        path: "reverted",
        titleKey: "reverted_clients",
        component: Leads,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "reverted",
        hideInNav: false,
      },
      {
        path: "cold",
        titleKey: "cold",
        component: Leads,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "cold",
        hideInNav: true,
      },
      {
        path: "demo",
        titleKey: "demo",
        component: Leads,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "demo",
        hideInNav: true,
      },
      {
        path: "create",
        titleKey: "create",
        component: AdminClientCreatePage,
        roles: ["admin", "backoffice", "accounting", "head_of_sales"],
        tab: "create",
        hideInNav: true,
      },
      {
        path: "import",
        titleKey: "import",
        component: LeadsImportPage,
        roles: ["admin","head_of_sales"],
        tab: "import",
        hideInNav: true,
      },
      {
        path: "deposit",
        titleKey: "deposit",
        component: Leads,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "deposit",
        hideInNav: true,
      },
      {
        path: "redepo",
        titleKey: "redeposited",
        component: Leads,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        tab: "redepo",
        hideInNav: true,
      },
    ],
  },

  {
    path: "/accounts", // parent layout with the tabs
    titleKey: "accounts",
    component: AccountsMenu,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
    icon: "la la-list",
    children: [
      {
        path: "accounts",
        titleKey: "accounts",
        component: MTAccountsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        hideInNav: true,
      },
      {
        path: "online_users",
        titleKey: "online_users",
        component: OnlineUsersPage,
        roles: ["admin", "backoffice", "viewer", "accounting"],
        icon: "la la-signal",
      },
    ],
  },
  {
    path: "/marketing", // parent layout with the tabs
    titleKey: "marketing",
    component: MarketingMenu,
    roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
    icon: "la la-bullhorn",
    children: [
      {
        path: "campaigns/detailed/:id",
        titleKey: "campaign_details",
        component: CampaignDetailsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
        hideInNav: true,
      },
      {
        path: "campaigns", //  /marketing/campaigns
        titleKey: "campaigns",
        component: MarketingPage, // <- active list
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
      },
      {
        path: "archived", //  /marketing/archived
        titleKey: "archived",
        component: MarketingArchivedPage, // <- archived list
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
      },
      {
        path: "referrals",
        titleKey: "referrals",
        component: FriendsReferralsPage,
        roles: ["admin", "backoffice", "viewer", "accounting", "head_of_sales"],
      },
      /* add “tools” and “referrals” when you build them */
    ],
  },

  {
    path: "/settings", // parent layout with the tabs
    titleKey: "settings",
    component: SettingsMenu,
    roles: ["admin", "translators", "backoffice", "viewer", "accounting"],
    icon: "la la-cog",
    children: [
      {
        path: "relationships",
        titleKey: "relationship_update",
        component: RelationshipTab,
        roles: ["admin", "backoffice", "viewer", "accounting"],
        hideInNav: true,
      },
      {
        path: "customized_report",
        titleKey: "customized_report",
        component: CustomReportPage,
        roles: ["admin", "backoffice", "viewer", "accounting"],
        hideInNav: true,
      },
      {
        path: "account_report",
        titleKey: "account_report",
        component: AccountReportPage,
        roles: ["admin", "backoffice", "viewer", "accounting"],
        hideInNav: true,
      },
      {
        path: "mt5_add_account",
        titleKey: "add_mt5_account",
        component: Mt5AddAccountsTab,
        roles: ["admin", "backoffice", "viewer", "accounting"],
        hideInNav: true,
      },
      {
        path: "queue",
        titleKey: "queue",
        component: AdminQueuePage,
        roles: ["admin", "backoffice", "viewer", "accounting"],
        hideInNav: true,
      },
      {
        path: "translations",
        titleKey: "translations",
        component: AdminTranslationsPage,
        roles: ["admin", "translators"],
        hideInNav: true,
      },
      /* add “tools” and “referrals” when you build them */
    ],
  },
  {
    path: "download_mt5",
    titleKey: "download_mt5",
    external: "https://alphatrust.ai/add/alphatrustai/alphatrustai5setup.exe",
    roles: ["secure"],
    icon: "la la-file-download",
  },
  {
    path: "/wallets",
    titleKey: "wallets",
    component: WalletsPage,
    roles: ["secure"],
    icon: "la la-wallet",
  },
  {
    path: "/partners",
    titleKey: "partnership",
    component: PartnersLayout,
    roles: ["secure"],
    icon: "la la-users",
    affiliateOnly: true,
    children: [
      {
        path: "links",
        titleKey: "registration_links",
        component: PartnersLinks,
        roles: ["secure"],
      },
      {
        path: "referrals",
        titleKey: "referrals",
        component: PartnersReferrals,
        roles: ["secure"],
      },
      {
        path: "account",
        titleKey: "account",
        component: PartnerReferralsByAccount,
        roles: ["secure"],
      },
    ],
  },
  {
    path: "/deposit" /* or /deposit/:method for the form later */,
    titleKey: "deposits",
    component: DepositOptionsPage,
    roles: ["secure"],
    icon: "la la-donate",
    children: [
      {
        path: "neteller",
        titleKey: "deposit_neteller",
        component: NetellerDepositPage,
        roles: ["secure"],
        hideInNav: true, // reached from the options table
      },
      {
        path: "skrill",
        titleKey: "deposit_skrill",
        component: SkrillDepositPage,
        roles: ["secure"],
        hideInNav: true, // reached from the options table
      },
      {
        path: "skrill/result",
        titleKey: "deposit_skrill_result",
        component: SkrillDepositPage,
        roles: ["secure"],
        hideInNav: true,
      },
      {
        path: "usdt" /* ► /deposit/usdt               */,
        titleKey: "deposit_usdt_title",
        component: UsdtDepositPage,
        roles: ["secure"],
        hideInNav: true /* opened from the options table */,
      },
      {
        path: "banktransfer" /* ► /deposit/usdt               */,
        titleKey: "deposit_bankwire",
        component: BankWireDepositPage,
        roles: ["secure"],
        hideInNav: true /* opened from the options table */,
      },
      {
        path: "whish",
        titleKey: "deposit_whish",
        component: WhishDepositPage,
        roles: ["secure"],
        hideInNav: true, // reached from the options table
      },
      {
        path: "debit_credit",
        titleKey: "deposit_unlimit",
        component: UnlimitDepositPage,
        roles: ["secure"],
        hideInNav: true,
      },
      {
        path: "googlepay",
        titleKey: "deposit_googlepay",
        component: GooglePayDepositPage,
        roles: ["secure"],
        hideInNav: true,
      },
      {
        path: "googlepay/result",
        titleKey: "deposit_googlepay_result",
        component: GooglePayResultPage,
        roles: ["secure"],
        hideInNav: true,
      },
      {
        path: "applepay",
        titleKey: "deposit_applepay",
        component: ApplePayDepositPage,
        roles: ["secure"],
        hideInNav: true,
      },
    ],
  },

  {
    path: "/withdraw" /* or /deposit/:method for the form later */,
    titleKey: "withdraw",
    component: WithdrawOptionsPage,
    roles: ["secure"],
    icon: "la la-money-bill-alt",
    children: [
      {
        path: "neteller",
        titleKey: "withdraw_neteller",
        component: NetellerWithdrawPage,
        roles: ["secure"],
        hideInNav: true, // reached from the options table
      },
      {
        path: "skrill",
        titleKey: "withdraw_skrill",
        component: SkrillWithdrawPage,
        roles: ["secure"],
        hideInNav: true, // reached from the options table
      },
      {
        path: "usdt" /* ► /deposit/usdt               */,
        titleKey: "withdraw_usdt_title",
        component: UsdtWithdrawPage,
        roles: ["secure"],
        hideInNav: true /* opened from the options table */,
      },
      {
        path: "banktransfer" /* ► /deposit/usdt               */,
        titleKey: "withdrawal_bankwire",
        component: BankTransferWithdrawPage,
        roles: ["secure"],
        hideInNav: true /* opened from the options table */,
      },
      {
        path: "whish",
        titleKey: "withdraw_whish",
        component: WhishWithdrawPage,
        roles: ["secure"],
        hideInNav: true, // reached from the options table
      },
      {
        path: "debit_credit",
        titleKey: "withdraw_unlimit",
        component: UnlimitWithdrawPage,
        roles: ["secure"],
        hideInNav: true,
      },
    ],
  },
  {
    path: "/refer_a_friend",
    titleKey: "refer_a_friend",
    component: ReferAFriendPage,
    roles: ["secure"],
    icon: "la la-user-friends",
  },
  {
    path: "/educational",
    titleKey: "educational",
    component: EducationalMaterialPage,
    roles: ["secure"],
    icon: "la la-graduation-cap",
  },
  {
    path: "/contactus",
    titleKey: "contact_us",
    component: ContactUsPage,
    roles: ["secure"],
    icon: "la la-phone", // or any icon you like
  },

  {
    path: "/clients",
    titleKey: "clients",
    component: SalesClientsPage,
    roles: ["sales"], // ← adjust ACL
    icon: "la la-user",
    children: [
      {
        path: "create",
        titleKey: "create_client",
        component: SalesClientCreatePage,
        roles: ["sales"],
        hideInNav: true, // reached from the options table
      },
    ],
  },

  {
    path: "/leads",
    titleKey: "leads",
    component: SalesLeadsPage,
    roles: ["sales"], // ← adjust ACL
    icon: "la la-poll-h",
    children: [
      {
        path: "update/:id",
        titleKey: "update_lead",
        component: LeadPage,
        roles: ["sales"], // ← adjust ACL
        hideInNav: true, // reached from the options table
      },
      {
        path: "updateLeads/:id",
        titleKey: "update_lead",
        component: LeadUpdatePage,
        roles: ["sales"], // ← adjust ACL
        hideInNav: true, // reached from the options table
      },
      {
        path: "transactions_history/:id",
        titleKey: "transactions_history",
        component: SalesLeadHistoryPage,
        roles: ["sales"], // ← adjust ACL
        hideInNav: true, // reached from the options table
      },
    ],
  },
  {
    path: "/demo",
    titleKey: "demo_accounts",
    component: SalesDemoPage,
    roles: ["sales"], // ← adjust ACL
    icon: "la la-users",
  },

  {
    path: "/reports",
    titleKey: "reports",
    component: SalesReportPage,
    roles: ["sales"], // ← adjust ACL
    icon: "la la-table",
  },
  {
    path: "/logout",
    titleKey: "logout",
    component: Logout,
    roles: [
      "admin",
      "backoffice",
      "translators",
      "viewer",
      "accounting",
      "secure",
      "sales",
      "head_of_sales",
      "dealers",
    ],
    icon: "la la-sign-out-alt",
  },
];
