import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./RightSection.css";

interface RightSectionProps {
  selectedSessionId: string | null;
}

const RightSection: React.FC<RightSectionProps> = ({ selectedSessionId }) => {
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<
    { text: string; type: string; _id: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollableContentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setInputText(newValue);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";

      if (newValue.includes("\n")) {
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          100
        )}px`;
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputText.trim() !== "" && selectedSessionId) {
      const userMessage = inputText.trim();
      setInputText("");

      try {
        const response = await fetch("http://localhost:5000/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: userMessage,
            type: "user",
            sessionId: selectedSessionId,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        if (messages.length == 0) {
          const response3 = await fetch(
            `http://localhost:5000/api/first-message/${selectedSessionId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: userMessage,
              }),
            }
          );
          if (!response3.ok) {
            throw new Error("Network response was not ok.");
          }
        }
        const { messageId } = await response.json();
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: userMessage, type: "user", _id: messageId },
        ]);
        setLoading(true);

        const fakeResponse = "This is a fake response.";

        const response2 = await fetch("http://localhost:5000/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: fakeResponse,
            type: "response",
            sessionId: selectedSessionId,
          }),
        });
        if (!response2.ok) {
          throw new Error("Network response was not ok.");
        }

        const { messageId2 } = await response2.json();

        setMessages((prevMessages) => [
          ...prevMessages,

          {
            text: fakeResponse,
            type: "response",
            _id: messageId2,
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/");
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedSessionId) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/messages/${selectedSessionId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [selectedSessionId]);

  useEffect(() => {
    if (scrollableContentRef.current) {
      scrollableContentRef.current.scrollTop =
        scrollableContentRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="right-section">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <div className="scrollable-content" ref={scrollableContentRef}>
        {messages.length === 0 ? (
          <div
            className="no-messages"
            style={{
              textAlign: "center",
              alignItems: "center",
              marginTop: "20%",
              fontSize: "50px",
            }}
          >
            <img src="/logo.jpg" alt="Logo" style={{ width: "100px" }} />
            <br></br>
            MODON
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message._id ?? index}
              className={`content-item ${
                message.type === "user" ? "user-message" : "fake-response"
              } ${index === messages.length - 1 ? "typing1" : ""}`}
              style={{ textAlign: message.type === "user" ? "right" : "right" }}
            >
              {message.type === "user" ? (
                <>
                  <span style={{ textAlign: "right" }}>You</span>{" "}
                  {/* Assuming "You:" should be displayed for user messages */}
                  <br />
                  {message.text}
                </>
              ) : (
                <>
                  <span style={{ textAlign: "right" }}>Modon GPT</span>{" "}
                  <span>
                    <img src="/logo.jpg" alt="Logo" style={{ width: "30px" }} />
                  </span>
                  {/* Assuming "Admin:" should be displayed for admin messages */}
                  <br />
                  {message.text}
                </>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="loading-indicator">
            <p>Loading...</p>
          </div>
        )}
      </div>
      {selectedSessionId && (
        <form className="input-field" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            placeholder="اكتب رسالتك هنا ...."
            value={inputText}
            onChange={handleInputChange}
            rows={1}
            style={{
              minHeight: "15px",
              maxHeight: "100px",
              overflowY: "auto",
              resize: "none",
              textAlign: "right", // Align text to the right
              direction: "rtl", // Set direction to right-to-left
            }}
          />
          <button type="submit">يرسل</button>
        </form>
      )}

      <br />
    </div>
  );
};

export default RightSection;
