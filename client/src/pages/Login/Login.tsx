import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import type { Socket } from "socket.io-client";

interface LoginProps {
  onLogin: (userId: string) => void;
  socket: Socket | null;
  isMobile: boolean;
}

const Login = ({ onLogin, socket }: LoginProps) => {
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    socket?.emit("validate-username", trimmedName, (exists: boolean) => {
      if (trimmedName.match(/^[a-zA-Z]+$/)) {
        if (exists) {
          onLogin(trimmedName);
          navigate("/home");
        } else {
          alert("Username not found");
        }
      } else {
        alert("Username not valid");
      }
      setName("");
    });
  };

  const usernameInputProps = {
    className: "username-input",
    value: name,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setName(e.target.value),
    placeholder: "Enter your username",
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input {...usernameInputProps} />
      <button type="submit" className="sign-in-button">
        Sign In
      </button>
    </form>
  );
};

export default Login;
