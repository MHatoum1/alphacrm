// src\components\ui\LeadSwitcher.tsx
import { ReactNode, useMemo } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useOutlet } from "react-router-dom";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";
import { defineTabs } from "@/utils/defineTabs";

// 1) Copy your TabKey type here
export type TabKey =
  | "clients"
  | "leads"
  | "reverted"
  | "cold"
  | "demo"
  | "create"
  | "import"
  | "deposit"
  | "redepo";

// 2) Copy your leadsTabs factory here
export const leadsTabs = (
  t: any,
  user?: { acl?: string; email?: string } | null
) => {
  // Base tabs (unchanged)
  const BASE = defineTabs<TabKey>([
    { key: "clients", label: t("clients"), path: "/potential/clients" },
    { key: "leads", label: t("leads"), path: "/potential/leads" },
    {
      key: "reverted",
      label: t("reverted_clients"),
      path: "/potential/reverted",
    },
    { key: "cold", label: t("cold_clients"), path: "/potential/cold" },
    { key: "demo", label: t("demo_clients"), path: "/potential/demo" },
    { key: "create", label: t("create"), path: "/potential/create" },
    { key: "import", label: t("import"), path: "/potential/import" },
    { key: "deposit", label: t("deposit_report"), path: "/potential/deposit" },
    { key: "redepo", label: t("redeposit_report"), path: "/potential/redepo" },
  ]);

  // Pull user (prefer arg, fallback to localStorage)
  let acl = (user?.acl || "").toLowerCase();
  let email = (user?.email || "").toLowerCase();

  if (!acl || !email) {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        acl = (acl || parsed?.acl || "").toLowerCase();
        email = (email || parsed?.email || "").toLowerCase();
      }
    } catch {}
  }

  // PHP-equivalent rules
  const RESTRICTED_EMAILS = new Set([
    "info@alphatrust.ai"

  ]);

  // Sales → no menu
  if (acl === "sales") return [];

  // Admin-like roles → everything, except hide "cold" for restricted emails
  const ADMIN_LIKE = new Set(["admin", "viewer", "head_sales", "backoffice"]);
  if (ADMIN_LIKE.has(acl)) {
    if (RESTRICTED_EMAILS.has(email)) {
      return BASE.filter((t) => t.key !== "cold");
    }
    return BASE;
  }

  // Others → unchanged
  return BASE;
};

// 3) Props: pass your “table body” (or any default content) as children
interface LeadSwitcherProps {
  children: ReactNode;
}

export default function LeadSwitcher({ children }: LeadSwitcherProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { "*": subRoute = "" } = useParams<{ "*": string }>();
  const child = useOutlet();

  // derive activeTab from the current URL segment
  const activeTab = useMemo<TabKey>(() => {
    const found = leadsTabs(t).find((tb) => subRoute.includes(tb.key));
    return (found ?? leadsTabs(t)[0]).key as TabKey;
  }, [subRoute, t]);

  // when the user clicks a tab…
  const handleTabChange = (key: TabKey) => {
    const tab = leadsTabs(t).find((tb) => tb.key === key)!;
    navigate(tab.path);
  };

  return (
    <>
      {/* always show your tabs */}
      <Box mb={2}>
        <CustomTabSwitcher
          tabs={leadsTabs(t).map(({ key, label }) => ({
            key,
            label,
            iconClass: "la-icon-default",
          }))}
          activeTab={activeTab}
          onTabChange={handleTabChange as any}
        />
      </Box>

      {/* a single Box that either renders the routed child (e.g. create form)
          or your “default” content (the leads table + toolbar, passed as children) */}
      <Box>{child ?? children}</Box>
    </>
  );
}
