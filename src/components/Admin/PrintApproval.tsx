// src/components/Admin/PrintApproval.tsx
import { useRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { User } from "@/utils/commonData";

export default function PrintApproval({
  user,
  approvalDate,
}: {
  user: User;
  approvalDate: string;
}) {
  const printableRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handlePrint = () => {
    if (!printableRef.current) return;
    const printWindow = window.open("", "PRINT", "height=600,width=800");
    if (!printWindow) return;
    printWindow.document.write(printableRef.current.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // pick signer based on created date…
  let signerName = "Cynthia";
  if (new Date(user.created) > new Date("2024-01-01")) signerName = "Noura";
  else if (new Date(user.created) > new Date("2019-11-26"))
    signerName = "Mahdi";

  const signerTitle =
    signerName === "Cynthia"
      ? t("approval_letter_title_director", "Director")
      : t("approval_letter_title_head_of_compliance", "Head of Compliance");

  return (
    <>
      <Button fullWidth variant="outlined" onClick={handlePrint}>
        {t("print_approval_letter", "Print Approval Letter")}
      </Button>
      <Box ref={printableRef} sx={{ display: "none" }}>
        <Typography>
          {t("approval_letter_dear", "Dear {{signerName}},", {
            signerName,
          })}
        </Typography>
        <Typography>
          {t(
            "approval_letter_notification",
            "Kindly note that we need your final approval to make the status of the profile of the below client verified:"
          )}
        </Typography>
        <Typography>
          {t("approval_letter_client_name", "Name of client: {{clientName}}", {
            clientName: user.name,
          })}
        </Typography>
        <Typography>
          {t("approval_letter_profile_created", "Profile Created: {{date}}", {
            date: new Date(user.created).toLocaleDateString(),
          })}
        </Typography>
        <Typography>
          {t("approval_letter_country", "Country: {{country}}", {
            country: user.country,
          })}
        </Typography>
        <Typography>
          {t("approval_letter_contact", "Contact: {{contact}}", {
            contact: user.phone,
          })}
        </Typography>
        <Typography>
          {t("approval_letter_email", "Email: {{email}}", {
            email: user.email,
          })}
        </Typography>
        <Typography>
          {t("approval_letter_status", "Status: Verified")}
        </Typography>
        <Typography>
          {t(
            "approval_letter_categorization",
            "Client Categorization: {{riskLevel}}",
            { riskLevel: user.profile_risk_level }
          )}
        </Typography>
        <Typography>
          {t("approval_letter_documents", "Documents → Approved")}
        </Typography>
        <Typography>
          {t(
            "approval_letter_proof_of_address",
            "Proof of Address provided → Approved"
          )}
        </Typography>
        <Typography>
          {t("approval_letter_kyc_completed", "KYC completed")}
        </Typography>
        <Typography>{t("approval_letter_sincerely", "Sincerely,")}</Typography>
        <Typography>
          {signerName} / {signerTitle}
        </Typography>
        <Typography>
          {t("approval_letter_date", "Date: {{date}}", {
            date: new Date(approvalDate).toLocaleDateString(),
          })}
        </Typography>
        <img
          src={`/images/v1/${signerName.toLowerCase()}signature.png`}
          alt="Signature"
          width="150"
          height="100"
          style={{ objectFit: "contain" }}
        />
      </Box>
    </>
  );
}
