import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import "./App.css";
import Login from "./pages/Login/Login.tsx";
import socket from "./lib/socket.ts";
import Home from "./pages/Home/Home.tsx";

const protocol = import.meta.env.VITE_MODE === "production" ? "https" : "http";
const host = import.meta.env.VITE_SERVER_IP;
const port = import.meta.env.VITE_SERVER_PORT;

const App = () => {
  const [connected, setConnected] = useState(false);
  const [accessTokenValid, setAccessTokenValid] = useState(true);
  const [username, setUsername] = useState(
    localStorage.getItem("username") ?? ""
  );
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("userId") ?? "");

  useEffect(() => {
    if (location.pathname === "/home") {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => {
      setTimeout(() => {
        if (!socket.connected) setConnected(false);
      }, 1000);
    };
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", async (err) => {
      if (
        err.message === "Access token expired or invalid" ||
        err.message === "Error: No token provided"
      ) {
        const res = await fetch(`${protocol}://${host}:${port}/api/refresh`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("username", data.username);
          localStorage.setItem("userId", data.userId);
          setUsername(data.username);
          setUserId(data.userId);
          socket.connect(); // reconnect with new token
        } else {
          setAccessTokenValid(false);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("username");
          localStorage.removeItem("userId");
          setUsername("");
          setUserId("");
        }
      } else {
        setAccessTokenValid(false);
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    if (connected) setLoggedIn(true);
  }, [connected, accessTokenValid]);

  const homeProps = {
    username,
    userId,
    socket,
    isMobile,
    connected,
    protocol,
    host,
    port,
  };

  const loginProps = {
    socket,
    isMobile,
    username,
    setUsername,
    setUserId,
    protocol,
    host,
    port,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login {...loginProps} />} />
        <Route
          path="/home"
          element={
            loggedIn ? (
              <Home {...homeProps} />
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
