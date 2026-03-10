export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="siteContainer">
        <div className="footerGrid">
          <div>
            <div className="footerBrand">RoadAid</div>
            <p className="footerText">
              Trusted roadside assistance for drivers who need fast, reliable,
              and professional help in urgent situations.
            </p>
            <p className="footerText">Service Areas: Colombo and Kandy</p>
          </div>

          <div>
            <div className="footerTitle">Quick Links</div>
            <a href="#home" className="footerLink">Home</a>
            <a href="#how-it-works" className="footerLink">How It Works</a>
            <a href="#about" className="footerLink">About Us</a>
            <a href="#services" className="footerLink">Services</a>
            <a href="#contact" className="footerLink">Contact Us</a>
          </div>

          <div>
            <div className="footerTitle">Support</div>
            <a href="#contact" className="footerLink">FAQ</a>
            <a href="#contact" className="footerLink">Safety</a>
            <a href="#contact" className="footerLink">Complaints</a>
            <a href="#contact" className="footerLink">Privacy Policy</a>
            <a href="#contact" className="footerLink">Terms &amp; Conditions</a>
          </div>

          <div>
            <div className="footerTitle">Contact</div>
            <div className="footerText">Email: athifnular@icloud.com</div>
            <div className="footerText">Phone: 071 762 7177</div>
            <div className="footerText">City: Colombo</div>
            <div className="footerText">Coverage: Colombo &amp; Kandy</div>
          </div>
        </div>

        <div className="footerBottom">
          © 2026 RoadAid. Built as a professional roadside assistance platform and university project.
        </div>
      </div>
    </footer>
  );
}