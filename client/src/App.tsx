import { io, Socket } from "socket.io-client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import Login from "./pages/Login/Login.tsx";
import Home from "./pages/Home/Home.tsx";

const App = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userId");
    if (stored) {
      setUserId(stored);
    }
  }, []);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://192.168.1.30:3000");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            userId ? (
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
            />
          }
        />
        <Route
          path="/home"
          element={
            userId ? (
              <Home userId={userId} socket={socketRef.current} />
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
