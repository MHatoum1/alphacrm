import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Container,
  useMediaQuery,
  useTheme,
  Grid,
  Link as MLink,
} from "@mui/material";

const HomeFooter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Determine if we are in Arabic (RTL)
  const isArabic = i18n.language === "ar";
  // Decide direction, textAlign, and possible row direction
  const direction = isArabic ? "rtl" : "ltr";
  const textAlign = isArabic ? "right" : "left";
  const flexDirection = isMobile ? "column" : isArabic ? "row-reverse" : "row";

  return (
    <Box
      component="footer"
      sx={{
        maxWidth: 960,
        mx: "auto",
        // Remove or override any hard-coded "textAlign: 'left'"
        // Instead, conditionally set it:
        textAlign,
        borderTop: "1px solid",
        borderColor: "text.primary",
        py: 3,
        px: 2,
        
        // Apply direction to the container
        direction,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          paddingLeft: "0 !important",
          "@media (min-width:1340px)": {
            paddingLeft: "0 !important",
          },
        }}
      >
        {/* Top row */}
        <Box
          sx={{
            display: "flex",
            // Conditionally reverse the row when Arabic
            flexDirection,
            alignItems: "center", // 'left' is not valid for alignItems
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", direction, textAlign }}
          >
            {t("footer_powered_by")}
          </Typography>
          {!isMobile && (
            <Box>
              <img
                src="/images/v1/securesite_icn.png"
                alt="SECURE SITE"
                style={{ height: 40 }}
              />
            </Box>
          )}
        </Box>

        {/* Brokerage disclaimers & text */}
        <Typography variant="body2" sx={{ mb: 2, direction, textAlign }}>
          {t("footer_fxgrow_description")}
        </Typography>

        {/* Social Icons */}
         <Grid
        container
        spacing={2}
        justifyContent="left"
        alignItems="left"
        wrap="nowrap" // ❌ don’t let them wrap
        sx={{ mb: 1 }}
      >
        {[
          {
            href: "https://www.facebook.com/fxgrow.international",
            src: "/images/social/fb-icon.png",
            alt: "facebook",
          },
          {
            href: "https://www.instagram.com/fxgrow",
            src: "/images/social/instagram.png",
            alt: "instagram",
          },
          {
            href: "https://twitter.com/fxgrow",
            src: "/images/social/twitter-icon.png",
            alt: "twitter",
          },
          {
            href: "https://www.linkedin.com/company/fxgrow",
            src: "/images/social/linkedin.png",
            alt: "linkedin",
          },
          {
            href: "https://www.youtube.com/channel/UCIW5WD2-she6NUQX9XEsnOQ?view_as=subscriber",
            src: "/images/social/youtube.png",
            alt: "youtube",
          },
          {
            href: "https://www.threads.net/@fxgrow",
            src: "/images/social/threads.png",
            alt: "threads",
          },
          {
            href: "https://www.tiktok.com/@fxgrow",
            src: "/images/social/tiktok.png",
            alt: "tiktok",
          },
          {
            href: "https://www.t.me/fxgrowofficial",
            src: "/images/social/telegram.png",
            alt: "telegram",
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

        <Typography variant="body2" sx={{ fontSize: 13, direction, textAlign }}>
          {t("footer_risk_warning")}{" "}
          <a href="http://fxgrow.com/pdf/Risk-Disclosure.pdf">
            {t("footer_risk_disclosure")}
          </a>{" "}
          {t("and")}{" "}
          <a href="http://fxgrow.com/pdf/Terms-And-Conditions-For-The-Use-Of-The-Website.pdf">
            {t("footer_terms_conditions")}
          </a>
          <br />
          {t("footer_restricted_clients")}
        </Typography>
      </Container>
    </Box>
  );
};

export default HomeFooter;
