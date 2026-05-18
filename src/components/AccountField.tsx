import React from "react";
import InputField from "./ui/InputField";

interface AccountFieldProps {
  accountName: string;
  icon: string;
}

const AccountField: React.FC<AccountFieldProps> = ({ accountName, icon }) => (
  <>
    <InputField label="Account" icon={icon} value={accountName} readOnly />
    <InputField label="Link" icon="la la-link" placeholder="Enter link..." />
  </>
);

export default AccountField;
