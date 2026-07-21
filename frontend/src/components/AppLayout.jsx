import Navbar from "./Navbar";
import Footer from "./Footer";
import RoadAidLogo from "./RoadAidLogo";

export default function AppLayout({ title, subtitle, right, children }) {
  return (
    <>
      <Navbar />

      <div className="page" style={{ paddingTop: 96 }}>
        <div className="shell">
          <div className="topbar">
            <div className="brand">
              <RoadAidLogo />
              <div className="brandText">
                <h1>{title}</h1>
                <p>{subtitle}</p>
              </div>
            </div>

            {right}
          </div>

          {children}
        </div>
      </div>

      <Footer />
    </>
  );
}
