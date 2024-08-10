import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function Notify() {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userId = "user_123"; // This should be a unique identifier for the logged-in user
    const socket = io("http://localhost:8080", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket Connected");
      // Identify the user to the server and join their room
      socket.emit("identify", userId);
    });

    // Listen for notifications from the server
    socket.on("notification", (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Toggle modal visibility
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="Notify">
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        <span onClick={toggleModal} style={{ position: "relative" }}>
          🛎️
          {notifications.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                backgroundColor: "red",
                borderRadius: "50%",
                padding: "2px 6px",
                color: "white",
                fontSize: "12px",
              }}
            >
              {notifications.length}
            </span>
          )}
        </span>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
        >
          <h2>Notifications</h2>
          <ul>
            {notifications.map((notif, index) => (
              <li key={index}>
                {notif.message} - {new Date(notif.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
          <button onClick={toggleModal} style={{ marginTop: "10px" }}>
            Close
          </button>
        </div>
      )}

      {/* Modal Background */}
      {showModal && (
        <div
          onClick={toggleModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        ></div>
      )}
    </div>
  );
}

export default Notify;
