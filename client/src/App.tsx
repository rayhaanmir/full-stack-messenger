import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import "./App.css";
import Login from "./pages/Login/Login.tsx";
import socket from "./lib/socket.ts";
import Home from "./pages/Home/Home.tsx";

const App = () => {
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken") ?? ""
  );
  const [connected, setConnected] = useState(false);
  const [accessTokenValid, setAccessTokenValid] = useState(true);
  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", async (err) => {
      if (
        err.message === "Access token expired or invalid" ||
        err.message === "Error: No token provided"
      ) {
        const res = await fetch("http://192.168.1.30:3000/api/refresh", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("accessToken", data.accessToken);
          socket.connect(); // reconnect with new token
        } else {
          setAccessTokenValid(false);
          localStorage.removeItem("accessToken");
        }
      } else {
        setAccessTokenValid(false);
      }
    });

    socket.on("user-info", (username) => {
      localStorage.setItem("username", username);
    });
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/login"
          element={<Login socket={socket} isMobile={isMobile} />}
        />
        <Route
          path="/home"
          element={
            connected ? (
              <Home
                username={localStorage.getItem("username") ?? "UNKNOWN_USER"}
                socket={socket}
                isMobile={isMobile}
              />
            ) : accessTokenValid ? null : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
