// The sign-in frame: village photo on the left, the form column on the right.
import type { View } from "../Console";
import Login from "../screens/Login";
import ChangePassword from "../screens/ChangePassword";

export default function AuthLayout({ v }: { v: View }) {
  return (
    <>
      {" "}
      <div style={{height: "100vh", display: "grid", gridTemplateColumns: "1fr 520px"}}>
        <div style={{position: "relative", overflow: "hidden", background: "#0A2550"}}>
          {" "}
          <img src="/assets/village-landscape.jpg" alt="" style={{position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: ".55"}} />
          {" "}
          <div style={{position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(10,37,80,.3),rgba(10,37,80,.9))"}} />
          {" "}
          <div style={{position: "absolute", left: "64px", bottom: "72px", right: "64px", color: "#fff", display: "flex", flexDirection: "column", gap: "14px"}}>
            <div style={{display: "flex", height: "4px", width: "120px", borderRadius: "2px", overflow: "hidden"}}>
              <span style={{flex: "1", background: "#E9791E"}} />
              <span style={{flex: "1", background: "#fff"}} />
              <span style={{flex: "1", background: "#1F8A3B"}} />
            </div>
            <div style={{fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "40px", lineHeight: "1.15", letterSpacing: ".01em"}}>BVT GRAMA CONNECT</div>
            <div style={{fontSize: "22px", fontWeight: "600", color: "#f2dd3d"}}>మన గ్రామం – మన సేవలు – మన అభివృద్ధి</div>
            <div style={{fontSize: "16px", opacity: ".9"}}>Connecting Villages, Empowering India · Super Admin Console</div>
          </div>
          {" "}
        </div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", background: "#fff"}}>
          <img src="/assets/logo-mark.png" alt="" style={{width: "72px", height: "72px", borderRadius: "18.5%", boxShadow: "0 6px 20px rgba(0,64,126,.18)", marginBottom: "24px"}} />
          {v.is?.login ? <Login v={v} /> : null}
          {v.is?.changePassword ? <ChangePassword v={v} /> : null}
        </div>
      </div>
      {" "}
    </>
  );
}
