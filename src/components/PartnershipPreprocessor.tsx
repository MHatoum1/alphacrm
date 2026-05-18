// src/components/PartnershipPreprocessor.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/redux/hooks";
import { preProcessPartnership } from "@/redux/slices/partnershipSlice";

export default function PartnershipPreprocessor() {
  const dispatch = useAppDispatch();
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1️⃣ parse /pp/:pid
    const pathParts = pathname.split("/");
    const pid =
      pathParts[1] === "pp" && pathParts[2] ? pathParts[2] : undefined;

    // 2️⃣ parse ?cid=CAMPAIGN_ID
    const cid = new URLSearchParams(search).get("cid") ?? undefined;

    // 3️⃣ set cookies if present
    if (pid) Cookies.set("partnerid", pid, { path: "/", expires: 365 });
    if (cid) Cookies.set("cid", cid, { path: "/", expires: 365 });

    // 4️⃣ call API to stat-track
    if (pid || cid) {
      dispatch(preProcessPartnership({ pid, cid }))
        .unwrap()
        .then((res) => {
          // 5️⃣ redirect if backend tells us to
          const redirect = res?.data?.redirect;
          if (redirect) {
            window.location.replace(redirect);
          }
        })
        .catch((err) => {
          console.error("Preprocess failed", err);
        });
    }
  }, [dispatch, pathname, search]);

  return null;
}
