/*  ContactUsPage.tsx  */
import {
  Box,
  Grid,
  Typography,
  Link as MLink,
  Divider,
  useTheme,
} from "@mui/material";
import {
  LocationOn,
  AccessTime,
  Phone,
  Email,
  Print,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const CONTACTS = {
  HEADQUARTERS: {
    address: [
      "Arc. Makariou C 59",
      "Steratzias Court Block A, Office 14",
      "4003 Limassol, Cyprus",
    ],
    working: "Mon-Fri  07:00 – 18:00 GMT +3",
    phone: "+357-25-211707",
    fax: "+357-25-729930",
    email: "info@alphatrust.ai",
    skype: "alphatrust.ai",
  },
  PARTNERSHIPS: {
    working: "Mon-Fri  09:00 – 18:00 GMT +3",
    phone: "+357-25-211707",
    email: "info@alphatrust.ai",
  },
  SUPPORT: {
    working: "24 hours / 5",
    phone: "+357-25-211707",
    email: "support@alphatrust.ai",
  },
  BACKOFFICE: {
    working: "Mon-Fri  09:00 – 18:00 GMT +3",
    phone: "+357-25-211707",
    email: "info@alphatrust.ai",
  },
  ACCOUNTING: {
    working: "Mon-Fri  09:00 – 18:00 GMT +3",
    phone: "+357-25-211707",
    email: "info@alphatrust.ai",
  },
  HR: {
    working: "Mon-Fri  09:00 – 18:00 GMT +3",
    phone: "+357-25-211707",
    email: "hr@alphatrust.ai",
  },
  PR: {
    working: "Mon-Fri  09:00 – 18:00 GMT +3",
    phone: "+357-25-211707 ext 204",
    email: "pr@alphatrust.ai",
  },
} as const;

export default function ContactUsPage() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = i18n.dir() === "rtl";

  const text = (key: string) => t(key, { defaultValue: key });

  /** one <li/> line with icon + content */
  const L = ({
    icon,
    children,
  }: {
    icon: React.ReactElement;
    children: React.ReactNode;
  }) => (
    <Box
      component="li"
      sx={{ display: "flex", alignItems: "baseline", mb: 0.5 }}
    >
      <Box sx={{ color: theme.palette.error.main, mr: 1 }}>{icon}</Box>
      <Typography component="span" variant="body2">
        {children}
      </Typography>
    </Box>
  );

  /** section with title + list */
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Grid item xs={12} md={4} sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.error.main,
          pl: { xs: 0, md: 1 },
          pr: { xs: 0, md: 1 },
        }}
      >
        {title}
      </Typography>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {children}
      </Box>
    </Grid>
  );

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }} dir={isRtl ? "rtl" : "ltr"}>
      {/* ─── TOP 3 COLUMNS ─────────────────────────────────── */}
      <Grid container spacing={2}>
        <Section title={text("HEADQUARTERS")}>
          {CONTACTS.HEADQUARTERS.address.map((ln) => (
            <L key={ln} icon={<LocationOn fontSize="small" />}>
              {ln}
            </L>
          ))}
        </Section>

        <Section title={text("SUPPORT DESK")}>
          <L icon={<AccessTime fontSize="small" />}>
            {text("working_time")}: {CONTACTS.SUPPORT.working}
          </L>
          <L icon={<Phone fontSize="small" />}>
            {text("phone")}: {CONTACTS.SUPPORT.phone}
          </L>
          <L icon={<Email fontSize="small" />}>
            {text("email")}:{" "}
            <MLink href={`mailto:${CONTACTS.SUPPORT.email}`}>
              {CONTACTS.SUPPORT.email}
            </MLink>
          </L>
        </Section>

        <Section title={text("ACCOUNTING/FINANCE")}>
          <L icon={<AccessTime fontSize="small" />}>
            {text("working_time")}: {CONTACTS.ACCOUNTING.working}
          </L>
          <L icon={<Phone fontSize="small" />}>
            {text("phone")}: {CONTACTS.ACCOUNTING.phone}
          </L>
          <L icon={<Email fontSize="small" />}>
            {text("email")}:{" "}
            <MLink href={`mailto:${CONTACTS.ACCOUNTING.email}`}>
              {CONTACTS.ACCOUNTING.email}
            </MLink>
          </L>
        </Section>
      </Grid>

      {/* ─── SECOND ROW ─────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Section title="">
          <L icon={<Phone fontSize="small" />}>
            {text("phone")}: {CONTACTS.HEADQUARTERS.phone}
          </L>
          <L icon={<Print fontSize="small" />}>
            Fax: {CONTACTS.HEADQUARTERS.fax}
          </L>
          <L icon={<Email fontSize="small" />}>
            {text("email")}:{" "}
            <MLink href={`mailto:${CONTACTS.HEADQUARTERS.email}`}>
              {CONTACTS.HEADQUARTERS.email}
            </MLink>
          </L>

          <L icon={<AccessTime fontSize="small" />}>
            {text("working_time")}: {CONTACTS.HEADQUARTERS.working}
          </L>
        </Section>

        <Section title={text("HUMAN RESOURCES")}>
          <L icon={<AccessTime fontSize="small" />}>
            {text("working_time")}: {CONTACTS.HR.working}
          </L>
          <L icon={<Phone fontSize="small" />}>
            {text("phone")}: {CONTACTS.HR.phone}
          </L>
          <L icon={<Email fontSize="small" />}>
            {text("email")}:{" "}
            <MLink href={`mailto:${CONTACTS.HR.email}`}>
              {CONTACTS.HR.email}
            </MLink>
          </L>
        </Section>

        <Section title={text("PUBLIC RELATIONS")}>
          <L icon={<AccessTime fontSize="small" />}>
            {text("working_time")}: {CONTACTS.PR.working}
          </L>
          <L icon={<Phone fontSize="small" />}>
            {text("phone")}: {CONTACTS.PR.phone}
          </L>
          <L icon={<Email fontSize="small" />}>
            {text("email")}:{" "}
            <MLink href={`mailto:${CONTACTS.PR.email}`}>
              {CONTACTS.PR.email}
            </MLink>
          </L>
        </Section>
      </Grid>

      {/* ─── THIRD ROW ──────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Section title={text("PARTNERSHIPS")}>
          <L icon={<AccessTime fontSize="small" />}>
            {text("working_time")}: {CONTACTS.PARTNERSHIPS.working}
          </L>
          <L icon={<Email fontSize="small" />}>
            {text("email")}:{" "}
            <MLink href={`mailto:${CONTACTS.PARTNERSHIPS.email}`}>
              {CONTACTS.PARTNERSHIPS.email}
            </MLink>
          </L>
        </Section>

        <Section title={text("BACK OFFICE")}>
          <L icon={<AccessTime fontSize="small" />}>
            {text("working_time")}: {CONTACTS.BACKOFFICE.working}
          </L>
          <L icon={<Phone fontSize="small" />}>
            {text("phone")}: {CONTACTS.BACKOFFICE.phone}
          </L>
          <L icon={<Email fontSize="small" />}>
            {text("email")}:{" "}
            <MLink href={`mailto:${CONTACTS.BACKOFFICE.email}`}>
              {CONTACTS.BACKOFFICE.email}
            </MLink>
          </L>
        </Section>
      </Grid>

      {/* ─── FOLLOW US ───────────────────────────────────────── */}
      <Divider sx={{ my: 2 }} />
      <Box
        sx={{
          display: "flex",
          alignItems: "start",
          mb: 2,
        }}
      >
        <Box sx={{ height: 1, bgcolor: "text.primary" }} />
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, textAlign: "start" }}
        >
          {t("follow_our_pages")}
        </Typography>
        <Box sx={{ flexGrow: 1, height: 1, bgcolor: "text.primary" }} />
      </Box>

      <Grid
        container
        spacing={2}
        justifyContent="left"
        alignItems="left"
        wrap="nowrap" // ❌ don’t let them wrap
        sx={{ mb: 4 }}
      >
        {[
          {
            href: "https://facebook.com/alphatrustai",
            src: "/images/social/fb-icon.png",
            alt: "facebook",
          },
          {
            href: "https://instagram.com/alphatrustai",
            src: "/images/social/instagram.png",
            alt: "instagram",
          },
          {
            href: "https://linkedin.com/company/alpha-trust-ai",
            src: "/images/social/linkedin.png",
            alt: "linkedin",
          },
          {
            href: "https://youtube.com/@alphatrustai",
            src: "/images/social/youtube.png",
            alt: "youtube",
          },
          {
            href: "https://tiktok.com/@alphatrustai",
            src: "/images/social/tiktok.png",
            alt: "tiktok",
          },
        ].map(({ href, src, alt }) => (
          <Grid
            item
            key={alt}
            xs="auto" // ✅ just as wide as the icon
            sx={{ display: "flex", alignItems: "start" }}
          >
            <MLink href={href} target="_blank">
              <img src={src} alt={alt} height={24} />
            </MLink>
          </Grid>
        ))}
      </Grid>

      <Divider />
    </Box>
  );
}
