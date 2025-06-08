import { io, Socket } from "socket.io-client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import "./App.css";
import Login from "./pages/Login/Login.tsx";
import Home from "./pages/Home/Home.tsx";

const App = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://192.168.1.30:3000");
    }
    const stored = localStorage.getItem("userId");
    if (stored) {
      socketRef.current.emit("validate-username", stored, (exists: boolean) => {
        if (exists) {
          setUserId(stored);
        } else {
          localStorage.removeItem("userId");
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            loading ? null : userId ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            <Login
              onLogin={(id) => {
                localStorage.setItem("userId", id);
                setUserId(id);
              }}
              socket={socketRef.current}
              isMobile={isMobile}
            />
          }
        />
        <Route
          path="/home"
          element={
            loading ? null : userId ? (
              <Home
                userId={userId}
                socket={socketRef.current}
                isMobile={isMobile}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
