import React, { useEffect, useState, useRef } from "react";
import "./LeftSection.css";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
interface LeftSectionProps {
  isOpen: boolean;
  setSelectedSessionId: (sessionId: string | null) => void;
}

interface Session {
  _id: string;
  message: string;
  createdAt: Date;
}
interface DecodedToken {
  name?: string;
  email?: string;
  picture?: string;
}
interface PaginatedResult {
  today: Session[];
  yesterday: Session[];
  last7Days: Session[];
  older: { [key: string]: Session[] };
}

const LeftSection: React.FC<LeftSectionProps> = ({
  isOpen,
  setSelectedSessionId,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult>({
    today: [],
    yesterday: [],
    last7Days: [],
    older: {},
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [re, setRe] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, re]); // Fetch sessions when currentPage changes

  // Add/remove scroll listener based on paginatedResult changes

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const email = localStorage.getItem("email");
      const response = await fetch(
        `http://localhost:5000/api/sessions?page=${currentPage}&email=${email}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const data = await response.json();

      // Update state with paginatedResult
      setPaginatedResult((prevPaginatedResult) => ({
        today:
          currentPage === 1
            ? data.paginatedResult.today
            : [...prevPaginatedResult.today, ...data.paginatedResult.today],
        yesterday:
          currentPage === 1
            ? data.paginatedResult.yesterday
            : [
                ...prevPaginatedResult.yesterday,
                ...data.paginatedResult.yesterday,
              ],
        last7Days:
          currentPage === 1
            ? data.paginatedResult.last7Days
            : [
                ...prevPaginatedResult.last7Days,
                ...data.paginatedResult.last7Days,
              ],
        older: {
          ...prevPaginatedResult.older,
          ...data.paginatedResult.older,
        },
      }));
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    console.log(credentialResponse);

    if (credentialResponse.credential) {
      const decoded: DecodedToken = jwtDecode(credentialResponse.credential);
      console.log(decoded);

      if (decoded.email) {
        localStorage.setItem("email", decoded.email);
      }
    } else {
      console.error("No credential found in the response");
    }
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  const createSession = async () => {
    try {
      // Get the email from local storage
      const email = localStorage.getItem("email");

      const response = await fetch("http://localhost:5000/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Include email in the request body
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const { sessionId } = await response.json();
      console.log(`Session created with ID: ${sessionId}`);
      setSelectedSessionId(sessionId);
      // After successful creation, reset currentPage to 1
      setCurrentPage(1);
      fetchSessions();
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  return (
    <div className={`left-section ${isOpen ? "open" : ""}`}>
      <div className="sessions" style={{ paddingLeft: "" }}>
        <div className="header">
          <button
            style={{ border: "none", fontWeight: "bold" }}
            onClick={createSession}
          >
            دردشة جديدة
          </button>
          &nbsp;
          <span>
            <img src="/logo.jpg" alt="Logo" style={{ width: "50px" }} />
          </span>
        </div>
        <div className="session-category">
          <h5 style={{ color: "grey" }}>اليوم</h5>
          {paginatedResult.today.map((session) => (
            <div
              key={session._id}
              className="session-item"
              onClick={() => setSelectedSessionId(session._id)}
            >
              {session.message ? (
                <div>{session.message}</div>
              ) : (
                <div>{session._id}</div>
              )}
            </div>
          ))}
        </div>
        <div className="session-category">
          <h5 style={{ color: "grey" }}>أمس</h5>
          {paginatedResult.yesterday.map((session) => (
            <div
              key={session._id}
              className="session-item"
              onClick={() => setSelectedSessionId(session._id)}
            >
              {session.message}
            </div>
          ))}
        </div>
        <div className="session-category">
          <h5 style={{ color: "grey" }}>اخر 7 ايام</h5>
          {paginatedResult.last7Days.map((session) => (
            <div
              key={session._id}
              className="session-item"
              onClick={() => setSelectedSessionId(session._id)}
            >
              {session.message}
            </div>
          ))}
        </div>
        {Object.keys(paginatedResult.older).map((monthYear) => (
          <div key={monthYear} className="session-category">
            <h5 style={{ color: "grey" }}>{monthYear}</h5>
            {paginatedResult.older[monthYear].map((session) => (
              <div
                key={session._id}
                className="session-item"
                onClick={() => setSelectedSessionId(session._id)}
              >
                {session.message}
              </div>
            ))}
          </div>
        ))}
        {isLoading && <p>Loading...</p>}
        <div style={{ textAlign: "right" }}>
          <p onClick={loadMore}>تحميل المزيد</p>
        </div>
      </div>
    </div>
  );
};

export default LeftSection;
