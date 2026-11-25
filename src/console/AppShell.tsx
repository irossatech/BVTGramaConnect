// The signed-in console: sidebar, top bar, every screen and every side panel, form and dialog. It is its own
// download, fetched after sign-in, so the login and change-password screens show from a small first download
// (owner's choice of 14 Nov 2026, audit WEB-PERF-003, backlog 25). The markup is moved here unchanged from
// Console.tsx's render(); the logic and state stay in Console.tsx.
import type { View } from "./Console";
import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";
import DashboardScreen from "./screens/Dashboard";
import Geography from "./screens/Geography";
import Users from "./screens/Users";
import Posts from "./screens/Posts";
import Reports from "./screens/Reports";
import Audit from "./screens/Audit";
import Messages from "./screens/Messages";
import ServiceTabs from "./screens/ServiceTabs";
import Requests from "./screens/Requests";
import Ads from "./screens/Ads";
import Services from "./screens/Services";
import Numbers from "./screens/Numbers";
import SettingsScreen from "./screens/Settings";
import CitizensWallet from "./screens/CitizensWallet";
import CitizenAccountPanel from "./panels/CitizenAccountPanel";
import WalletDialog from "./panels/WalletDialog";
import DetailPanel from "./panels/DetailPanel";
import UserDrawer from "./panels/UserDrawer";
import RequestPanel from "./panels/RequestPanel";
import ContactPanel from "./panels/ContactPanel";
import AuditPanel from "./panels/AuditPanel";
import ServiceFormPanel from "./panels/ServiceForm";
import AdFormPanel from "./panels/AdForm";
import ComposeFormPanel from "./panels/ComposeForm";
import NumberFormPanel from "./panels/NumberForm";
import TypeFormPanel from "./panels/TypeForm";
import ConfirmModal from "./panels/ConfirmModal";

export default function AppShell({ v }: { v: View }) {
  return (
    <>

      {" "}
      <div className={"sa-shell" + (v.navOpen ? " is-open" : "")} style={{display: "grid", gridTemplateColumns: "248px minmax(0, 1fr)", height: "100dvh", overflow: "hidden"}}>
        <Sidebar v={v} />
        <button className="sa-scrim" aria-label="Close menu" tabIndex={v.navOpen ? 0 : -1} onClick={v.toggleNav} />
        <main style={{display: "flex", flexDirection: "column", minWidth: "0", minHeight: "0"}}>
          <TopBar v={v} />
          <div ref={v.scrollRef} style={{flex: "1", minHeight: "0", overflowY: "auto"}}>
          <div className="sa-content" style={{padding: "24px 28px 40px", display: "flex", flexDirection: "column", gap: "20px", animation: "sa-fade .2s ease-out"}}>
            {/* DASHBOARD */}
            {v.pg?.dashboard ? <DashboardScreen v={v} /> : null}
            {/* GEOGRAPHY */}
            {v.pg?.geography ? <Geography v={v} /> : null}
            {/* USERS */}
            {v.pg?.users ? <Users v={v} /> : null}
            {/* POSTS */}
            {v.pg?.posts ? <Posts v={v} /> : null}
            {/* REPORTS */}
            {v.pg?.reports ? <Reports v={v} /> : null}
            {/* AUDIT */}
            {v.pg?.audit ? <Audit v={v} /> : null}
            {/* CONTACT MESSAGES */}
            {v.pg?.contact ? <Messages v={v} /> : null}
            {/* SERVICE REQUESTS */}
            {v.pg?.requests && v.canCatalog ? <ServiceTabs v={v} /> : null}
            {v.pg?.requests && (v.svcView === "requests" || !v.canCatalog) ? <Requests v={v} /> : null}
            {/* ADS */}
            {v.pg?.ads ? <Ads v={v} /> : null}
            {/* SERVICES / BILLS: the services citizens can request, or the bills & recharges, on the app's Home
                (same as the app's Super Admin › Services and › Bills & Recharges) */}
            {(v.pg?.requests || v.pg?.bills) && v.catShow ? <Services v={v} /> : null}
            {/* IMPORTANT NUMBERS */}
            {v.pg?.numbers ? <Numbers v={v} /> : null}
            {/* SETTINGS */}
            {v.pg?.settings ? <SettingsScreen v={v} /> : null}
            {/* CITIZENS & WALLET (BVTGC-139/140) */}
            {v.pg?.wallet ? <CitizensWallet v={v} /> : null}
          </div>
          </div>
        </main>
      </div>
      {" "}
      {/* SIDE PANEL (post / user) */}
      {" "}
      {v.panel?.show ? <DetailPanel v={v} /> : null}
      {" "}
      {/* ADD USER DRAWER */}
      {" "}
      {v.drawerOpen ? <UserDrawer v={v} /> : null}
      {/* IMPORTANT NUMBER DRAWER */}
      {v.rqShow ? <RequestPanel v={v} /> : null}
      {v.cmShow ? <ContactPanel v={v} /> : null}
      {v.aeShow ? <AuditPanel v={v} /> : null}
      {v.sfShow ? <ServiceFormPanel v={v} /> : null}
      {v.afShow ? <AdFormPanel v={v} /> : null}
      {v.cfShow ? <ComposeFormPanel v={v} /> : null}
      {v.nfShow ? <NumberFormPanel v={v} /> : null}
      {v.tfShow ? <TypeFormPanel v={v} /> : null}
      {v.waShow ? <CitizenAccountPanel v={v} /> : null}
      {v.wdShow ? <WalletDialog v={v} /> : null}
      {" "}
      {/* MODAL */}
      {" "}
      {v.modal?.show ? <ConfirmModal v={v} /> : null}
      {" "}
    </>
  );
}