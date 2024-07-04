import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) => {
    event.preventDefault();

    if (inputText.trim() !== "" && selectedSessionId) {
      const userMessage = inputText.trim();
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "17px"; // Reset height
      }

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

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        // If Shift + Enter is pressed, add a new line
        const { selectionStart, selectionEnd, value } = event.currentTarget;
        const newValue =
          value.substring(0, selectionStart) +
          "\n" +
          value.substring(selectionEnd);
        setInputText(newValue);

        // Move cursor to the correct position after inserting the new line
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart =
              textareaRef.current.selectionEnd = selectionStart + 1;
          }
        }, 0);
      } else {
        // If only Enter is pressed, submit the form
        event.preventDefault();
        handleSubmit(event);
      }
    }
  };

  useEffect(() => {
    if (scrollableContentRef.current) {
      scrollableContentRef.current.scrollTop =
        scrollableContentRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="right-section">
      {/* <button className="logout-button" onClick={handleLogout}>
        Logout
      </button> */}
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
            <div key={message._id ?? index} style={{ textAlign: "right" }}>
              <br></br>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <span style={{ marginRight: "5px", fontWeight: "bold" }}>
                    {message.type === "user" ? "أنت" : "Modon GPT"}
                  </span>
                  {message.type !== "user" ? (
                    <span>
                      <img
                        src="/logo.jpg"
                        alt="Logo"
                        style={{ width: "30px", marginLeft: "5px" }}
                      />
                    </span>
                  ) : (
                    <span>
                      <img
                        src="/usl.jpg"
                        alt="Logo"
                        style={{ width: "30px", marginLeft: "5px" }}
                      />
                    </span>
                  )}
                </div>
                <div
                  style={{
                    textAlign: "left",
                    marginRight: "30px",
                  }}
                  className={`content-item ${
                    message.type === "user" ? "user-message" : "fake-response"
                  } ${index === messages.length - 1 ? "typing1" : ""}`}
                >
                  {message.text.split("\n").map((text, i) => (
                    <span key={i}>
                      {text}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
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
        <div className="form-container">
          <form className="input-field" onSubmit={handleSubmit}>
            <button type="submit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="none"
                viewBox="0 0 32 32"
                className="icon-2xl"
              >
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
            <textarea
              ref={textareaRef}
              placeholder="اكتب رسالتك هنا ...."
              value={inputText}
              onKeyDown={handleKeyDown}
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
          </form>
          <p className="bottom-information-text">
            يمكن أن ترتكب "مدن" الأخطاء. تحقق من المعلومات الهامة.
          </p>
        </div>
      )}
    </div>
  );
};

export default RightSection;
