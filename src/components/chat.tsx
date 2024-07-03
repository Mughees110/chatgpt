// src/App.tsx
import React, { useState, useEffect } from "react";
import "./chat.css";
import LeftSection from "./LeftSection";
import RightSection from "./RightSection";
import { useNavigate } from "react-router-dom";

const Chat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();

  const toggleLeftSection = () => {
    setIsOpen(!isOpen);
  };
  const handleLoginSuccess = (response: any) => {
    console.log("Login success:", response);
    // Handle successful login, e.g., set user state or redirect to main app
  };

  const handleLoginFailure = (error: any) => {
    console.error("Login failed:", error);
    // Handle login failure, e.g., show error message to user
  };
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      navigate("/");
    }
  }, [navigate]);
  return (
    <div className="app">
      <button className="menu-toggle" onClick={toggleLeftSection}>
        ☰
      </button>
      <div className={`left-section ${isOpen ? "open" : ""}`}>
        <LeftSection
          isOpen={isOpen}
          setSelectedSessionId={setSelectedSessionId}
        />{" "}
        {/* Ensure isOpen is passed */}
      </div>

      <RightSection selectedSessionId={selectedSessionId} />
    </div>
  );
};

export default Chat;
