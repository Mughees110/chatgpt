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
  email: string;
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

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className={`left-section ${isOpen ? "open" : ""}`}>
      <div className="svg-container">
        <svg
          style={{ position: "absolute", top: "1rem", left: "1rem" }}
          onClick={createSession}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="icon-md"
        >
          <path d="M15.673 3.913a3.121 3.121 0 1 1 4.414 4.414l-5.937 5.937a5 5 0 0 1-2.828 1.415l-2.18.31a1 1 0 0 1-1.132-1.13l.311-2.18A5 5 0 0 1 9.736 9.85zm3 1.414a1.12 1.12 0 0 0-1.586 0l-5.937 5.937a3 3 0 0 0-.849 1.697l-.123.86.86-.122a3 3 0 0 0 1.698-.849l5.937-5.937a1.12 1.12 0 0 0 0-1.586M11 4A1 1 0 0 1 10 5c-.998 0-1.702.008-2.253.06-.54.052-.862.141-1.109.267a3 3 0 0 0-1.311 1.311c-.134.263-.226.611-.276 1.216C5.001 8.471 5 9.264 5 10.4v3.2c0 1.137 0 1.929.051 2.546.05.605.142.953.276 1.216a3 3 0 0 0 1.311 1.311c.263.134.611.226 1.216.276.617.05 1.41.051 2.546.051h3.2c1.137 0 1.929 0 2.546-.051.605-.05.953-.142 1.216-.276a3 3 0 0 0 1.311-1.311c.126-.247.215-.569.266-1.108.053-.552.06-1.256.06-2.255a1 1 0 1 1 2 .002c0 .978-.006 1.78-.069 2.442-.064.673-.192 1.27-.475 1.827a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C15.6 21 14.727 21 13.643 21h-3.286c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.233-.487-1.961C3 15.6 3 14.727 3 13.643v-3.286c0-1.084 0-1.958.058-2.666.06-.729.185-1.369.487-1.961A5 5 0 0 1 5.73 3.545c.556-.284 1.154-.411 1.827-.475C8.22 3.007 9.021 3 10 3A1 1 0 0 1 11 4"></path>
        </svg>
        <div className="tooltip">جلسه جديده</div>
      </div>
      <div className="header">
        <div className="icon-header">
          <span className="logo-span">
            <img
              src="/newl.jpg"
              alt="Logo"
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
            />
          </span>
        </div>
      </div>
      <div className="sessions" style={{ paddingLeft: "" }}>
        <div className="session-category">
          <h5 className="time today">اليوم</h5>
          {paginatedResult.today.map(
            (session) =>
              session.message && (
                <div
                  key={session._id}
                  className="session-item"
                  onClick={() => setSelectedSessionId(session._id)}
                >
                  <div className="session-sub-item">{session.message}</div>
                </div>
              )
          )}
        </div>
        {paginatedResult.yesterday.length ? (
          <div className="session-category" style={{ marginTop: "1rem" }}>
            <h5 className="time">أمس</h5>
            {paginatedResult.yesterday.map(
              (session) =>
                session.message && (
                  <div
                    key={session._id}
                    className="session-item"
                    onClick={() => setSelectedSessionId(session._id)}
                  >
                    <div className="session-sub-item">{session.message}</div>
                  </div>
                )
            )}
          </div>
        ) : (
          ""
        )}
        {paginatedResult.last7Days.length ? (
          <div className="session-category" style={{ marginTop: "1rem" }}>
            <h5 className="time">اخر 7 ايام</h5>
            {paginatedResult.last7Days.map(
              (session) =>
                session.message && (
                  <div
                    key={session._id}
                    className="session-item"
                    onClick={() => setSelectedSessionId(session._id)}
                  >
                    <div className="session-sub-item">{session.message}</div>
                  </div>
                )
            )}
          </div>
        ) : (
          ""
        )}
        {Object.keys(paginatedResult.older).map((monthYear) => (
          <div key={monthYear} className="session-category">
            <h5 className="time">{monthYear}</h5>
            {paginatedResult.older[monthYear].map(
              (session) =>
                session.message && (
                  <div
                    key={session._id}
                    className="session-item"
                    onClick={() => setSelectedSessionId(session._id)}
                  >
                    <div className="session-sub-item">{session.message}</div>
                  </div>
                )
            )}
          </div>
        ))}
        {isLoading && <p>Loading...</p>}
        <div className="load-more" style={{ textAlign: "right" }}>
          <h5 onClick={loadMore} className="time">
            تحميل المزيد
          </h5>
        </div>
      </div>
      <div className="bottom-container">
        <p className="email-text">{localStorage.getItem("email")}</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default LeftSection;
