import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SERVICES = [
  "Tyre Puncture",
  "Battery Dead",
  "Engine Overheating",
  "Fuel Empty",
  "Locked Out",
  "Towing Support",
];

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="homePage">
      <Navbar />

      <main>
        <section id="home" className="heroSection">
          <div className="heroOverlay" />
          <div className="siteContainer heroContent">
            <div className="heroTextBlock">
              <div className="heroBadge">Trusted roadside help in Colombo and Kandy</div>
              <h1 className="heroTitle">Need Roadside Help Right Now?</h1>
              <p className="heroSubtitle">
                RoadAid connects you with trusted roadside assistance when emergencies happen.
                From tyre punctures to battery problems, we help drivers get support quickly,
                safely, and with more confidence.
              </p>

              <div className="heroActions">
                <button className="btn btnPrimaryDark heroMainBtn" onClick={() => nav("/login")}>
                  Request Emergency Help
                </button>
                <button
                  className="btn heroSecondaryBtn"
                  onClick={() =>
                    document.getElementById("how-it-works")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                >
                  How It Works
                </button>
              </div>

              <div className="heroTrustLine">
                <span>Trusted support</span>
                <span>Nearby mechanics</span>
                <span>Fast response</span>
              </div>
              
            </div>
          </div>
        </section>

        <section id="how-it-works" className="homeSection">
          <div className="siteContainer">
            <div className="sectionIntro">
              <div className="sectionEyebrow">How it works</div>
              <h2 className="sectionTitle">Simple help when you need it most</h2>
              <p className="sectionText">
                RoadAid is designed to keep roadside emergencies simple, fast, and focused.
              </p>
            </div>

            <div className="stepsGrid">
              <div className="stepCard">
                <div className="stepNo">01</div>
                <h3>Share Your Location</h3>
                <p>Let RoadAid detect your location or enter it manually to find nearby help.</p>
              </div>

              <div className="stepCard">
                <div className="stepNo">02</div>
                <h3>Describe the Problem</h3>
                <p>Select the emergency type and add any extra details the mechanic should know.</p>
              </div>

              <div className="stepCard">
                <div className="stepNo">03</div>
                <h3>Mechanic Accepts</h3>
                <p>A nearby mechanic receives the request and accepts the job.</p>
              </div>

              <div className="stepCard">
                <div className="stepNo">04</div>
                <h3>Track and Get Help</h3>
                <p>See live updates and wait for help to arrive with more confidence.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="homeSection altSection">
          <div className="siteContainer">
            <div className="sectionIntro">
              <div className="sectionEyebrow">Main services</div>
              <h2 className="sectionTitle">Emergency support for common roadside problems</h2>
              <p className="sectionText">
                RoadAid focuses on the most common issues drivers face on the road.
              </p>
            </div>

            <div className="servicesGrid">
              {SERVICES.map((service) => (
                <div className="serviceCard" key={service}>
                  <div className="serviceIcon">⚙️</div>
                  <h3>{service}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="homeSection">
          <div className="siteContainer">
            <div className="sectionIntro">
              <div className="sectionEyebrow">Why choose us</div>
              <h2 className="sectionTitle">Why drivers choose RoadAid</h2>
              <p className="sectionText">
                We built RoadAid around one important idea: trust matters most during emergencies.
              </p>
            </div>

            <div className="whyGrid">
              <div className="whyCard">
                <h3>Trusted roadside support</h3>
                <p>Designed to help people find a more dependable emergency assistance experience.</p>
              </div>
              <div className="whyCard">
                <h3>Nearby mechanics</h3>
                <p>Customers can connect with nearby mechanics in supported areas for faster help.</p>
              </div>
              <div className="whyCard">
                <h3>Live tracking</h3>
                <p>See location updates and know that help is on the way.</p>
              </div>
              <div className="whyCard">
                <h3>Fast request flow</h3>
                <p>Request help with location, problem type, and clear service details.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="homeSection altSection">
          <div className="siteContainer aboutSplit">
            <div>
              <div className="sectionEyebrow">About RoadAid</div>
              <h2 className="sectionTitle">Trust is the reason people choose us</h2>
              <p className="sectionText">
                Roadside emergencies happen every day in Sri Lanka, and finding someone reliable
                in those moments is not easy. RoadAid was created to give people a trusted way to
                request help whenever they need it most.
              </p>
              <p className="sectionText">
                We focus on fast response, dependable service, and a safer experience for drivers
                through location-based requests and nearby mechanics. RoadAid is for anyone who
                needs a more trusted roadside assistance service.
              </p>
            </div>

            <div className="aboutCard">
              <div className="aboutStat">
                <span>Coverage</span>
                <strong>Colombo &amp; Kandy</strong>
              </div>
              <div className="aboutStat">
                <span>Focus</span>
                <strong>Nearby mechanics</strong>
              </div>
              <div className="aboutStat">
                <span>Experience</span>
                <strong>Simple emergency request flow</strong>
              </div>
              <div className="aboutStat">
                <span>Goal</span>
                <strong>Trusted roadside support</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="ctaSection">
          <div className="siteContainer ctaCard">
            <div>
              <div className="sectionEyebrow">Emergency support</div>
              <h2 className="sectionTitle ctaTitle">Need help now?</h2>
              <p className="sectionText">
                Request roadside assistance quickly and connect with nearby help.
              </p>
            </div>

            <button className="btn btnPrimaryDark heroMainBtn" onClick={() => nav("/login")}>
              Request Emergency Help
            </button>
          </div>
        </section>

        <section id="contact" className="homeSection">
          <div className="siteContainer">
            <div className="sectionIntro">
              <div className="sectionEyebrow">Contact us</div>
              <h2 className="sectionTitle">Get in touch with RoadAid</h2>
              <p className="sectionText">
                Contact us for support, inquiries, or future service partnerships.
              </p>
            </div>

            <div className="contactGrid">
              <div className="contactCard">
                <div className="contactLabel">Email</div>
                <div className="contactValue">athifnular@icloud.com</div>
              </div>

              <div className="contactCard">
                <div className="contactLabel">Phone</div>
                <div className="contactValue">071 762 7177</div>
              </div>

              <div className="contactCard">
                <div className="contactLabel">City</div>
                <div className="contactValue">Colombo</div>
              </div>

              <div className="contactCard">
                <div className="contactLabel">Coverage</div>
                <div className="contactValue">Colombo and Kandy</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}