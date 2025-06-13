import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import type { Socket } from "socket.io-client";

interface LoginProps {
  socket: Socket;
  isMobile: boolean;
}

const Login = ({ socket }: LoginProps) => {
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") ?? ""
  );
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const waitForConnection = (cb: () => void) => {
    if (socket.connected) {
      cb();
    } else {
      socket.once("connect", cb);
      socket.connect();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("http://192.168.1.30:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: "include",
    });
    if (res.ok) {
      const { accessToken } = await res.json();
      localStorage.setItem("accessToken", accessToken);
      waitForConnection(() => navigate("/home"));
    } else {
      alert("Login failed");
      setUsername("");
      setPassword("");
    }
  };

  const usernameInputProps = {
    className: "username-input",
    value: username,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setUsername(e.target.value),
    placeholder: "Username",
  };

  const passwordInputProps = {
    className: "password-input",
    type: "password",
    value: password,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setPassword(e.target.value),
    placeholder: "Password",
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input {...usernameInputProps} />
      <input {...passwordInputProps} />
      <button type="submit" className="sign-in-button">
        Sign In
      </button>
    </form>
  );
};

export default Login;
