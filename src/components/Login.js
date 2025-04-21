import React, { useState, useEffect } from "react";
import "./Login.css";
import LoginImg from "../Login.png";
import Typed from 'typed.js';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const strings = isLogin 
      ? ["Welcome Back!", "Research Made Efficient", "Login to Continue"] 
      : ["Create Account", "Join PaperGlance", "Start Your Research Journey"];
      
    const typed = new Typed(".typing-text", {
      strings,
      typeSpeed: 80,
      backSpeed: 50,
      loop: true,
    });
    return () => typed.destroy();
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    // ✅ Validation only for signup
    if (!isLogin) {
      if (!formData.email) {
        setError("Email is required for signup.");
        setLoading(false);
        return;
      }
  
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match.");
        setLoading(false);
        return;
      }
    }
  
    try {
      if (isLogin) {
        // ✅ Login API - no email needed
        const response = await axios.post("http://localhost:8080/api/auth", {
          username: formData.username,
          password: formData.password,
        });
        alert(response.data.message);
        navigate("/"); // Redirect to homepage
      } else {
        // ✅ Signup API - email required
        const response = await axios.post("http://localhost:8080/api/users", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        alert(response.data.message);
        setIsLogin(true); // Switch to login mode after signup
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="login-page">
      <Container className="login-container">
        <Row className="align-items-center gx-5">
          {/* Illustration Column */}
          <Col md={6} className="d-none d-md-block login-illustration">
            <div className="illustration-wrapper">
              <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
              </div>
              <img 
                src={LoginImg} 
                alt="Research Illustration" 
                className="illustration-img"
              />
            </div>
          </Col>

          {/* Form Column */}
          <Col md={6} className="form-column">
            <div className="form-container">
              <div className="form-header">
                <img 
                  src={process.env.PUBLIC_URL + "/logopaperglance1.jpg"} 
                  alt="PaperGlance Logo" 
                  className="form-logo"
                />
                <h1 className="form-title">
                  <span className="typing-text"></span>
                </h1>
                <p className="form-subtitle">
                  {isLogin 
                    ? "Sign in to access your research dashboard" 
                    : "Create your account to get started"}
                </p>
              </div>

              <Form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>

                {!isLogin && (
                  <Form.Group className="mb-4" controlId="confirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required={!isLogin}
                    />
                  </Form.Group>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {isLogin && (
                  <div className="d-flex justify-content-end mb-3">
                    <a href="#forgot-password" className="text-decoration-none forgot-password">
                      Forgot password?
                    </a>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-100 auth-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isLogin ? "Logging in..." : "Creating account..."}
                    </>
                  ) : (
                    isLogin ? "Login" : "Sign Up"
                  )}
                </Button>

                <div className="auth-toggle text-center mt-4">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button" 
                    className="btn btn-link p-0 toggle-link"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                  >
                    {isLogin ? "Sign up" : "Login"}
                  </button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;