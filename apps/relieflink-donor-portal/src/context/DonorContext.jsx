import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getCampBrief, getMyPledges, subscribeToChanges, subscribeToNeedAlerts } from "../services/dataService";

// Holds everything that belongs to "this donor on this device":
//  - remembered name/contact (localStorage) used to prefill pledges + look up My Pledges
//  - their pledges, polled so status changes (e.g. camp confirmed receipt) surface as alerts
//  - the notification feed + on-screen toasts (critical needs, delivery confirmations) — F9
const NAME_KEY = "relieflink_donor_name";
const CONTACT_KEY = "relieflink_donor_contact";
const POLL_MS = 20000;
const MAX_NOTIFICATIONS = 30;

const DonorContext = createContext(null);

function readStored(key) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}
function writeStored(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* private mode / storage blocked — identity just won't persist */
  }
}

let nextId = 1;

export function DonorProvider({ children }) {
  const [donorName, setDonorName] = useState(() => readStored(NAME_KEY));
  const [donorContact, setDonorContact] = useState(() => readStored(CONTACT_KEY));
  const [notifications, setNotifications] = useState([]);
  const [toastIds, setToastIds] = useState([]);

  const [myPledges, setMyPledges] = useState([]);
  const [pledgesLoading, setPledgesLoading] = useState(false);
  const [pledgesError, setPledgesError] = useState(null);
  const lastStatuses = useRef(null);

  const push = useCallback((n) => {
    const item = { id: nextId++, at: new Date().toISOString(), read: false, ...n };
    setNotifications((list) => [item, ...list].slice(0, MAX_NOTIFICATIONS));
    setToastIds((ids) => [...ids, item.id].slice(-3));
  }, []);

  const dismissToast = useCallback((id) => setToastIds((ids) => ids.filter((i) => i !== id)), []);
  const markAllRead = useCallback(() => setNotifications((l) => l.map((n) => ({ ...n, read: true }))), []);

  // --- critical need alerts (from realtime) --------------------------------
  useEffect(() => {
    return subscribeToNeedAlerts(async (need) => {
      const camp = await getCampBrief(need.campId).catch(() => null);
      const where = camp ? `${camp.name}${camp.district ? ` (${camp.district})` : ""}` : "a relief camp";
      push({
        type: "critical",
        title: "New critical need",
        body: `${need.item} — ${need.quantityNeeded} needed at ${where}`,
        link: `/donor?camp=${need.campId}`,
      });
    });
  }, [push]);

  // --- my pledges + status-change alerts -----------------------------------
  const refreshMyPledges = useCallback(async () => {
    if (!donorContact) {
      lastStatuses.current = null;
      setMyPledges([]);
      setPledgesLoading(false);
      return;
    }
    try {
      const list = await getMyPledges(donorContact);
      if (lastStatuses.current) {
        list.forEach((p) => {
          const before = lastStatuses.current.get(p.id);
          if (before && before !== p.status && p.status === "Received") {
            push({
              type: "received",
              title: "Delivery confirmed",
              body: `${p.campName} confirmed receiving your ${p.quantity} × ${p.item}. Thank you!`,
              link: "/my-pledges",
            });
          }
        });
      }
      lastStatuses.current = new Map(list.map((p) => [p.id, p.status]));
      setMyPledges(list);
      setPledgesError(null);
    } catch (e) {
      setPledgesError(e);
    } finally {
      setPledgesLoading(false);
    }
  }, [donorContact, push]);

  useEffect(() => {
    lastStatuses.current = null; // a different contact must not trigger "changed" alerts
    setPledgesLoading(!!donorContact);
    refreshMyPledges();
    const timer = setInterval(refreshMyPledges, POLL_MS);
    const unsubscribe = subscribeToChanges(refreshMyPledges);
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [donorContact, refreshMyPledges]);

  // --- identity ---------------------------------------------------------------
  const rememberDonor = useCallback((name, contact) => {
    setDonorName(name);
    setDonorContact(contact);
    writeStored(NAME_KEY, name);
    writeStored(CONTACT_KEY, contact);
  }, []);
  const forgetDonor = useCallback(() => {
    setDonorContact("");
    writeStored(CONTACT_KEY, "");
  }, []);

  const value = useMemo(
    () => ({
      donorName,
      donorContact,
      rememberDonor,
      forgetDonor,
      myPledges,
      pledgesLoading,
      pledgesError,
      refreshMyPledges,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      markAllRead,
      toastIds,
      dismissToast,
    }),
    [donorName, donorContact, rememberDonor, forgetDonor, myPledges, pledgesLoading, pledgesError, refreshMyPledges, notifications, markAllRead, toastIds, dismissToast]
  );

  return <DonorContext.Provider value={value}>{children}</DonorContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDonor() {
  const ctx = useContext(DonorContext);
  if (!ctx) throw new Error("useDonor must be used inside <DonorProvider>");
  return ctx;
}
