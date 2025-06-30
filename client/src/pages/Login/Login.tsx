import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import "./Login.css";

interface LoginProps {
  socket: Socket;
  isMobile: boolean;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  protocol: string;
  host: string;
  port: string;
}

const Login = ({
  socket,
  isMobile,
  username,
  setUsername,
  setUserId,
  protocol,
  host,
  port,
}: LoginProps) => {
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
    const res = await fetch(`${protocol}://${host}:${port}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: "include",
    });
    if (res.ok) {
      const { accessToken, userId } = await res.json();
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("username", username);
      localStorage.setItem("userId", userId);
      setUserId(userId);
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
