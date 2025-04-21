import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


// React Bootstrap components
import {
  Container,
  Nav,
  Navbar,
  Button,
  Row,
  Col,
  Card,
  Form,
  Modal,
  InputGroup
} from 'react-bootstrap';

// Page components
import SummarizePage from './SummarizePage';
import Login from './components/Login';
import AboutUs from './components/aboutUs';
import Contact from './components/Contact';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import DictionaryWidget from './components/DictionaryWidget';




// Put this near the top if not already imported
// import './App.css'; // or wherever your custom CSS is

const faqData = [
  {
    question: 'What is a research paper?',
    answer: 'A research paper presents original findings or arguments using evidence and analysis. It is written to share knowledge and contribute to a field of study.',
  },
  {
    question: 'Why are research papers important?',
    answer: 'They advance knowledge, help solve real-world problems, and support academic and scientific growth.',
  },
  {
    question: 'What does a research paper include?',
    answer: 'A title, abstract, introduction, literature review, methodology, results, discussion, and references.',
  },
  {
    question: 'Who writes research papers?',
    answer: 'Students, scholars, scientists, and professionals to share findings, earn degrees, or contribute to fields.',
  },
  {
    question: 'How is a research paper different from an essay?',
    answer: 'Research papers are formal, structured, and data-backed, unlike essays which may be more opinionated and informal.',
  },
  {
    question: 'Where can you find research papers?',
    answer: 'Google Scholar, JSTOR, ResearchGate, academic journals, or university databases.',
  },
];

function FAQSection() {
  return (
    <section id="faq" className="py-5" style={{ backgroundColor: 'var(--light-color)',color: 'var(--text-color)' }}>

      <Container>
      <h2 className="text-center mb-5">Common Research Paper Questions</h2>
        <Row xs={1} md={2} className="g-4">
          {faqData.map((faq, index) => (
            <Col key={index}>
              <OverlayTrigger
                trigger={['hover', 'focus']}
                placement="bottom"
                overlay={
                  <Popover className="custom-popover">
                    <Popover.Header as="h3">{faq.question}</Popover.Header>
                    <Popover.Body>{faq.answer}</Popover.Body>
                  </Popover>
                }
              >
                <Button className="faq-button w-100">{faq.question}</Button>
              </OverlayTrigger>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}







const ThemeContext = createContext();

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => setDarkMode(prev => !prev);
  return (
    <ThemeContext.Provider value={darkMode}>
      <Router>
        <div className={`app-wrapper ${darkMode ? 'dark-mode' : 'light-mode'}`}>
          <Navbar expand="lg" variant="dark" className="main-navbar">
            <Container>
              <Navbar.Brand href="/" className="d-flex align-items-center">
                <img src="./logopaperglance1.jpg" alt="PaperGlance Logo" className="logo" />
                <span className="brand-name ms-2">PaperGlance</span>
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="navbarNav" className="border-0" />
              <Navbar.Collapse id="navbarNav">
                <Nav className="ms-auto align-items-center">
                  <Nav.Link href="/" className="nav-item">Home</Nav.Link>
                  <Nav.Link href="#features" className="nav-item">Features</Nav.Link>
                  <Nav.Link href="/summarize" className="nav-item">Summarize</Nav.Link>
                  <Nav.Link href="/aboutUs" className="nav-item">About</Nav.Link>
                  <Nav.Link href="/contact" className="nav-item">Contact</Nav.Link>
                  <Nav.Link href="/login" className="nav-btn">
                    <i className="bi bi-person-fill me-2"></i>Login / Sign Up
                  </Nav.Link>
                  <Form.Check 
                    type="switch"
                    id="theme-switch"
                    label={darkMode ? '🌙 Dark' : '☀️ Light'}
                    onChange={toggleTheme}
                    className="ms-3 theme-switch"
                    checked={darkMode}
                  />
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/summarize" element={<SummarizePage />} />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

// Use dark mode context in child components if needed
export const useDarkMode = () => useContext(ThemeContext);

// HomePage remains unchanged except for the How It Works section
const HomePage = () => {
  return (
    <>
      {/* Hero Section with Parallax Effect */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <Container className="hero-container">
          <Row className="align-items-center">
            <Col lg={6} className="hero-content">
              <h1 className="hero-title">
                <span className="highlight">Summarizes</span> Research Papers For You
              </h1>
              <p className="hero-subtitle">
                AI-powered extraction of key insights from academic papers, saving you hours of reading
              </p>
              <div className="hero-cta">
                <Button href="/summarize" className="btn-primary btn-lg me-3">
                  Try It Now <i className="bi bi-arrow-right ms-2"></i>
                </Button>
                <Button href="#features" variant="outline-light" className="btn-lg">
                  Learn More
                </Button>
              </div>
            </Col>
            <Col lg={6} className="hero-visual">
              <div className="floating-gif-container">
                <img src="./Gifpaperglancehome.gif" alt="Paper summarization demo" className="hero-gif" />
                <div className="floating-circle circle-1"></div>
                <div className="floating-circle circle-2"></div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Trust Indicators */}
      <section className="trust-section py-4">
        <Container>
          <Row className="g-4 justify-content-center">
            {['10,000+ Papers Analyzed', '97% Accuracy', 'Used by 50+ Universities'].map((text, i) => (
              <Col md={4} key={i} className="text-center">
                <div className="trust-item">
                  <div className="trust-icon">
                    <i className={`bi ${i === 0 ? 'bi-files' : i === 1 ? 'bi-check-circle' : 'bi-building'}`}></i>
                  </div>
                  <p className="trust-text mb-0">{text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <Container>
          <div className="section-header">
            <h2 className="section-title">Advanced Research Tools</h2>
            <p className="section-subtitle">Everything you need for efficient academic research</p>
            <div className="section-divider"></div>
          </div>
          
          <Row className="g-4">
            {[
              {
                icon: 'bi-file-earmark-text',
                title: 'Smart Summarization',
                desc: 'Get concise summaries of complex papers with key points highlighted',
                color: '#4e79a7'
              },
              {
                icon: 'bi-search',
                title: 'Deep Analysis',
                desc: 'Identify methodologies, results, and conclusions at a glance',
                color: '#e15759'
              },
              {
                icon: 'bi-bookmark-check',
                title: 'Citation Extraction',
                desc: 'Automatically extract references in multiple citation formats',
                color: '#76b7b2'
              },
              {
                icon: 'bi-graph-up',
                title: 'Data Visualization',
                desc: 'Transform complex data into understandable charts and graphs',
                color: '#f28e2b'
              }
            ].map((feature, index) => (
              <Col lg={3} md={6} key={index}>
                <Card className="feature-card h-100">
                  <div className="feature-icon-container" style={{ backgroundColor: `${feature.color}20` }}>
                    <i className={`bi ${feature.icon}`} style={{ color: feature.color }}></i>
                  </div>
                  <Card.Body>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text>{feature.desc}</Card.Text>
                    <Button variant="link" className="feature-link">
                      Learn more <i className="bi bi-arrow-right"></i>
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How It Works Section - UPDATED */}
      <section className="how-it-works-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">How PaperGlance Works</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="timeline-container">
            <div className="timeline-line"></div>
            <Row className="steps-container">
              <Col md={4} className="step-column">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3 className="step-title">Upload Your Paper</h3>
                  <p className="step-description">
                    Simply upload your research paper in PDF format or provide a DOI
                  </p>
                </div>
              </Col>
              <Col md={4} className="step-column">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3 className="step-title">AI Processing</h3>
                  <p className="step-description">
                    Our advanced algorithms analyze the content and extract key information
                  </p>
                </div>
              </Col>
              <Col md={4} className="step-column">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3 className="step-title">Get Your Summary</h3>
                  <p className="step-description">
                    Receive a concise summary with main points, methods, and findings
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">What Researchers Say</h2>
            <div className="section-divider"></div>
          </div>
          
          <Row className="g-4">
            {[
              {
                quote: "PaperGlance saved me countless hours during my literature review. The summaries are remarkably accurate.",
                author: "Dr. Sarah Johnson",
                role: "Postdoctoral Researcher, MIT"
              },
              {
                quote: "As a PhD student, this tool has become indispensable for quickly assessing paper relevance.",
                author: "Michael Chen",
                role: "PhD Candidate, Stanford"
              },
              {
                quote: "The citation extraction feature alone makes this worth it for our research team.",
                author: "Prof. David Wilson",
                role: "Department Head, Oxford"
              }
            ].map((testimonial, index) => (
              <Col lg={4} key={index}>
                <div className="testimonial-card">
                  <div className="testimonial-quote">
                    <i className="bi bi-quote"></i>
                    <p>{testimonial.quote}</p>
                  </div>
                  <div className="testimonial-author">
                    <h4>{testimonial.author}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <div className="cta-container">
            <h2 className="cta-title">Ready to revolutionize your research workflow?</h2>
            <p className="cta-subtitle">Join thousands of researchers saving hours every week</p>
            <div className="cta-buttons">
              <Button href="/summarize" className="btn-primary btn-lg me-3">
                Try For Free
              </Button>
              <Button href="/login" variant="outline-light" className="btn-lg">
                Create Account
              </Button>
            </div>
          </div>
        </Container>
      </section>


      <FAQSection />


      {/* Footer */}
      <footer className="main-footer">
        <Container>
          <Row>
            <Col lg={4} className="footer-brand">
              <img src="./logopaperglance1.jpg" alt="PaperGlance Logo" className="footer-logo" />
              <p className="brand-tagline">AI-powered research paper summarization</p>
              <div className="social-links">
                {['twitter', 'linkedin', 'github'].map((platform) => (
                  <a key={platform} href={`#${platform}`} className="social-link">
                    <i className={`bi bi-${platform}`}></i>
                  </a>
                ))}
              </div>
            </Col>
            <Col lg={2} md={4} className="footer-links">
              <h4>Product</h4>
              <ul>
                {['Features', 'Pricing', 'API', 'Examples'].map((item) => (
                  <li key={item}><a href={`#${item.toLowerCase()}`}>{item}</a></li>
                ))}
              </ul>
            </Col>
            <Col lg={2} md={4} className="footer-links">
              <h4>Resources</h4>
              <ul>
                {['Documentation', 'Blog', 'Research', 'Help Center'].map((item) => (
                  <li key={item}><a href={`#${item.toLowerCase().replace(' ', '-')}`}>{item}</a></li>
                ))}
              </ul>
            </Col>
            <Col lg={2} md={4} className="footer-links">
              <h4>Company</h4>
              <ul>
                {['About Us', 'Careers', 'Contact', 'Press'].map((item) => (
                  <li key={item}><a href={`#${item.toLowerCase().replace(' ', '-')}`}>{item}</a></li>
                ))}
              </ul>
            </Col>
            <Col lg={2} className="footer-newsletter">
              <h4>Stay Updated</h4>
              <form className="newsletter-form">
                <div className="input-wrapper">
                  <input type="email" placeholder="Your email" />
                  <Button type="submit" className="subscribe-btn">
                    <i className="bi bi-arrow-right"></i>
                  </Button>
                </div>
              </form>
            </Col>
          </Row>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} PaperGlance. All rights reserved.</p>
            <div className="legal-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </Container>
      </footer>
      <div>
       
      {/* Other content here */}

    
    </div>
    </>
  );
};

export default App;