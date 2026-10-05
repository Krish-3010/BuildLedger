import { useState, useEffect } from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import slideSiteManager from "../assets/site_management.png";
import slideFinanceTracking from "../assets/transaction_management.png";
import slideBudgetControl from "../assets/analysis.png";
import slideCalculator from "../assets/calculator.png";

function Dashboard() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        {
            id: "sites",
            badge: "Site Management",
            title: "Multi-Site Management",
            subtitle: "Organize and monitor all your construction projects on site.",
            image: slideSiteManager,
            alt: "Construction site manager holding a tablet managing sites"
        },
        {
            id: "transactions",
            badge: "Live Ledger",
            title: "Live Transaction Tracking",
            subtitle: "Record material purchases, labour wages, and project funding instantly.",
            image: slideFinanceTracking,
            alt: "Tracking live construction transactions and material expenses"
        },
        {
            id: "budget",
            badge: "Analytics",
            title: "Budget & Expense Control",
            subtitle: "Keep actual spending transparent and aligned with your estimated budget.",
            image: slideBudgetControl,
            alt: "Construction budget and expense control analytics dashboard"
        },
        {
            id: "calculator",
            badge: "Site Tool",
            title: "Construction Calculator",
            subtitle: "Perform exact precision calculations for site measurements and costs.",
            image: slideCalculator,
            alt: "High precision construction calculator and site estimation tool"
        }
    ];
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3500);
        return () => clearInterval(timer);
    }, [slides.length]);
    const activeSlide = slides[currentSlide];
    return (
      <div className="dashboard-page">
          <section className="hero-section">
              <div className="hero-content">
                  <p className="hero-small-text">WELCOME TO BUILDLEDGER</p>
                  <h1>
                      BUILD SMARTER.
                      <br />
                      <span>TRACK EVERY RUPEE.</span>
                  </h1>
                  <p className="hero-description">
                      Streamlined construction site management & financial tracking for modern builders and contractors.
                  </p>
                  <div className="hero-buttons">
                      <Link to="/sites" className="link">
                          <button className="primary-btn">
                              Get Started →
                          </button>
                      </Link>

                      <button className="secondary-btn" onClick={() => {
                          document.getElementById("features")?.scrollIntoView({
                              behavior: "smooth"
                          });
                      }}>
                          Explore Features
                      </button>
                  </div>
              </div>
              <div className="dashboard-preview showcase-card">
                  <div className="preview-header">
                      <div>
                          <span className="preview-label">PLATFORM HIGHLIGHTS</span>
                          <h3>{activeSlide.title}</h3>
                      </div>
                      <span className="status-badge">{activeSlide.badge}</span>
                  </div>

                  <p className="showcase-subtitle">{activeSlide.subtitle}</p>

                  <div className="showcase-image-container">
                      <img 
                          src={activeSlide.image} 
                          alt={activeSlide.alt} 
                          className="showcase-slide-img"
                      />
                  </div>
                  <div className="carousel-pagination">
                      {slides.map((_, index) => (
                          <button
                              key={index}
                              className={`pagination-dot ${currentSlide === index ? 'active' : ''}`}
                              onClick={() => setCurrentSlide(index)}
                              aria-label={`Go to image slide ${index + 1}`}
                          />
                      ))}
                  </div>
              </div>
          </section>
          <section className="quick-section">
              <p className="section-small-title">BUILT FOR CONSTRUCTION</p>
              <h2>
                  ONE PLACE.
                  <span> COMPLETE CONTROL.</span>
              </h2>
              <div className="quick-cards">
                  <div className="quick-card">
                      <div className="quick-icon">₹</div>
                      <h3>Track Money</h3>
                      <p>Keep every payment, material cost, and wage organized per site.</p>
                  </div>
                  <div className="quick-card">
                      <div className="quick-icon">▦</div>
                      <h3>Manage Sites</h3>
                      <p>Create, view, and control all your active construction projects.</p>
                  </div>
                  <div className="quick-card">
                      <div className="quick-icon">↗</div>
                      <h3>Understand Spending</h3>
                      <p>Gain total financial clarity on where every rupee is invested.</p>
                  </div>
              </div>
          </section>
          <section className="features-section" id="features">
              <p className="section-small-title">WHAT YOU CAN DO</p>
              <h2>
                  EVERYTHING YOU NEED
                  <br />
                  <span>TO BUILD BETTER.</span>
              </h2>
              <div className="feature-grid">
                  <div className="feature-card">
                      <div className="feature-icon">₹</div>
                      <h3>Transaction Ledger</h3>
                      <p>
                          Record and monitor all incoming funding and outgoing expenses 
                          for your construction sites with full transaction history.
                      </p>
                  </div>

                  <div className="feature-card">
                      <div className="feature-icon">⌂</div>
                      <h3>Site Management</h3>
                      <p>
                          Create, track, and manage multiple construction site locations 
                          and status updates seamlessly from a single dashboard.
                      </p>
                  </div>

                  <div className="feature-card">
                      <div className="feature-icon">⌗</div>
                      <h3>Cost Estimation</h3>
                      <p>
                          Plan estimated costs for materials, labour, and equipment 
                          before spending to keep projects profitable.
                      </p>
                  </div>

                  <div className="feature-card">
                      <div className="feature-icon">+</div>
                      <h3>Smart Calculator</h3>
                      <p>
                          Utilize a built-in, high-precision math engine designed for 
                          quick and error-free site calculations.
                      </p>
                  </div>
              </div>
          </section>

          {/* How It Works Section */}
          <section className="how-section">
              <p className="section-small-title">SIMPLE PROCESS</p>
              <h2>
                  HOW IT <span>WORKS.</span>
              </h2>
              <div className="steps">
                  <div className="step">
                      <div className="step-number">01</div>
                      <div>
                          <h3>Create Your Site</h3>
                          <p>Add your construction project name and location.</p>
                      </div>
                  </div>
                  <div className="step-line"></div>
                  <div className="step">
                      <div className="step-number">02</div>
                      <div>
                          <h3>Record Transactions</h3>
                          <p>Log material purchases, wages, and project income.</p>
                      </div>
                  </div>
                  <div className="step-line"></div>
                  <div className="step">
                      <div className="step-number">03</div>
                      <div>
                          <h3>Control Finances</h3>
                          <p>Track site budgets and keep projects on schedule.</p>
                      </div>
                  </div>
              </div>
          </section>
          <section className="cta-section">
              <div className="cta-content">
                  <p className="section-small-title">BUILDLEDGER</p>
                  <h2>
                      YOUR PROJECT.
                      <br />
                      <span>YOUR MONEY.</span>
                  </h2>
                  <p>Build smarter. Spend smarter.</p>
                  <Link to="/sites" className="link">
                      <button className="primary-btn">
                          Get Started →
                      </button>
                  </Link>
              </div>
          </section>
          <footer className="footer">
              <div className="footer-logo">BuildLedger</div>
              <p>Construction finance, simplified.</p>
              <div className="footer-links">
                  <Link to="/" className="link"><span>Home</span></Link>
                  <Link to="/sites" className="link"><span>Sites</span></Link>
                  <Link to="/transactions" className="link"><span>Transactions</span></Link>
                  <Link to="/calculator" className="link"><span>Calculator</span></Link>
              </div>
              <div className="footer-bottom">
                  © 2026 BuildLedger. All rights reserved.
              </div>
          </footer>
      </div>
    );
}

export default Dashboard;