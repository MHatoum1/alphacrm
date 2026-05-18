import {
  Box,
  Grid,
  Paper,
  Typography,
  Link,
  Button,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusLabel from "@/components/ui/StatusLabel";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import {
  fetchCardDetails,
  modifyPurseStatus,
} from "@/redux/slices/adminCardDetailsSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";

export default function CardDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { status, data, error } = useSelector((s: RootState) => s.purse);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const { t } = useTranslation();

  const cached = localStorage.getItem("user");
  const admin = cached ? JSON.parse(cached) : null;

  if (!admin?.uid) throw new Error("No admin user in storage");

  useEffect(() => {
    if (id) dispatch(fetchCardDetails(id));
  }, [id]);

  const handleAction = async (
    action: "approve" | "decline" | "enable" | "disable"
  ) => {
    if (!id) return;
    if (!window.confirm(t("confirm_action", { action }))) return;

    try {
      await dispatch(modifyPurseStatus({ id, action })).unwrap();
      setOk(t("action_success"));
      dispatch(fetchCardDetails(id));
    } catch (e: any) {
      setErr(e.message || t("action_failed"));
    }
  };

  if (status === "loading") {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const purse = data?.purse;
  const user = data?.user;

  return (
    <Paper sx={{ p: 3 }}>
      {ok && <CustomNotification message={ok} onClose={() => setOk("")} />}
      {(err || error) && (
        <CustomError
          errorMessage={err || error || "Error"}
          onClose={() => setErr("")}
        />
      )}

      <Grid container spacing={2}>
        {/* Purse Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
              {t("payment_instrument")}
            </Typography>
            <InfoLine label={t("status")}>
              {!purse?.status ? (
                <StatusLabel label={t("new")} statusKey="pending" />
              ) : (
                <StatusLabel
                  label={t(purse.status.toLowerCase())}
                  statusKey={purse.status}
                />
              )}
            </InfoLine>
            <InfoLine label={t("card_token")}>
              <StatusLabel
                label={purse?.id_origin ? t("present") : t("no_token")}
                statusKey={purse?.id_origin ? "approved" : "declined"}
              />
            </InfoLine>
            <InfoLine label="Title">{purse?.purse}</InfoLine>
            <InfoLine label={t("validity")}>
              {purse?.disabled ? (
                <StatusLabel label={t("disabled")} statusKey="unverified" />
              ) : new Date(purse?.valid || "" || null) < new Date() ? (
                <StatusLabel label={t("expired")} statusKey="declined" />
              ) : (
                <StatusLabel label={t("valid")} statusKey="approved" />
              )}
            </InfoLine>
          </Paper>

          {/* Profile Info */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
              {t("profile_info")}
            </Typography>
            <InfoLine label={t("status")}>
              <StatusLabel user={user} />
            </InfoLine>
            <InfoLine label={t("name")}>{user?.name}</InfoLine>
            <InfoLine label={t("email")}>
              <Link
                href={`/profiles/detailed/personal/${user?.id}`}
                target="_blank"
              >
                {user?.email}
              </Link>
            </InfoLine>

            {/* Dynamic Info Block (SEPA etc.) */}
            {purse?.info &&
              (() => {
                let infoObj: Record<string, any> = {};
                try {
                  infoObj =
                    typeof purse.info === "string"
                      ? JSON.parse(purse.info)
                      : purse.info;
                } catch (e) {
                  console.warn("Invalid JSON in purse.info", e);
                }

                return (
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(infoObj).map(([k, v]) => (
                      <InfoLine key={k} label={t(k)}>
                        {k === "SEPA" ? t(v === "1" ? "yes" : "no") : String(v)}
                      </InfoLine>
                    ))}
                  </Box>
                );
              })()}
          </Paper>

          {/* Action Buttons */}
          {(admin?.acl?.includes("admin") || admin?.acl?.includes("dealers")) && (
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              {(!purse?.status || purse.status === "declined") && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAction("approve")}
                >
                  {t("approve")}
                </Button>
              )}
              {(!purse?.status || purse.status === "approved") && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleAction("decline")}
                >
                  {t("decline")}
                </Button>
              )}
              {!purse?.disabled ? (
                <Button
                  variant="outlined"
                  onClick={() => handleAction("disable")}
                >
                  {t("disable")}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => handleAction("enable")}
                >
                  {t("enable")}
                </Button>
              )}
            </Box>
          )}
        </Grid>

        {/* Image & Document Panel */}
        <Grid item xs={12} md={6}>
          {/* Optional: document/image viewer */}
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t("transactions_list")}
        </Typography>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>{t("payment_provider")}</th>
              <th>{t("reference")}</th>
              <th>{t("amount")}</th>
              <th>{t("currency")}</th>
              <th>{t("created")}</th>
              <th>{t("status")}</th>
              <th>{t("processing")}</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions?.map((i: any) => {
              const type = i.type === "deposit" ? "deposits" : "withdrawals";
              return (
                <tr key={i.uid}>
                  <td>{i.methodName}</td>
                  <td>
                    <Link
                      href={`/transactions/${type}/detailed/${i.uid}`}
                      target="_blank"
                    >
                      {i.reference}
                    </Link>
                  </td>
                  <td>{i.amount}</td>
                  <td>{i.currency}</td>
                  <td>{i.date_created}</td>
                  <td>
                    <StatusLabel statusKey={i.status} />
                  </td>
                  <td>
                    {i.status_finished ? (
                      <StatusLabel statusKey={i.status_finished} />
                    ) : (
                      <StatusLabel
                        label={t("not_processed")}
                        statusKey="unverified"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
}

const InfoLine = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box sx={{ display: "flex", mb: 1 }}>
    <Box sx={{ width: 160, fontWeight: 500 }}>{label}</Box>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);
