// src/pages/Admin/Profiles/config.ts
import { defineTabs } from "@/utils/defineTabs";

export type ProfilesTabKey =
  | "all"
  | "nonactivated"
  | "uncompleted"
  | "toverify"
  | "limited"
  | "dormant"
  | "verified"
  | "ib"
  | "archived"
  | "backoffice"
  | "sales"
  | "create_profile";

export const profilesTabs = (t: (s: string) => string) =>
  defineTabs<ProfilesTabKey>([
    { key: "all", label: t("all_profiles"), path: "/profiles/all" },
    {
      key: "nonactivated",
      label: t("nonactivated"),
      path: "/profiles/nonactivated",
    },
    {
      key: "uncompleted",
      label: t("uncompleted"),
      path: "/profiles/uncompleted",
    },
    { key: "toverify", label: t("toverify"), path: "/profiles/toverify" },
    { key: "limited", label: t("limited"), path: "/profiles/limited" },
    { key: "dormant", label: t("dormant"), path: "/profiles/dormant" },
    { key: "verified", label: t("verified"), path: "/profiles/verified" },
    { key: "ib", label: t("ib"), path: "/profiles/ib" },
    { key: "archived", label: t("archived"), path: "/profiles/archived" },
    { key: "backoffice", label: t("backoffice"), path: "/profiles/backoffice" },
    { key: "sales", label: t("sales"), path: "/profiles/sales" },
    { key: "create_profile", label: t("create_profile"), path: "/profiles/create_profile" },
  ]);
