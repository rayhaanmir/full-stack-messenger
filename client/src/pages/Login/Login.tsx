import { useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "./Login.css";

interface LoginProps {
  onLogin: (userId: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    socketRef.current = io("http://192.168.1.30:3000");
    socketRef.current.emit(
      "validate-username",
      trimmedName,
      (exists: boolean) => {
        if (trimmedName) {
          if (exists) {
            console.log(`${trimmedName} exists`);
            onLogin(trimmedName);
            navigate("/home");
          } else {
            alert("Username not found");
          }
        } else {
          alert("Username not valid");
        }
        setName("");
      }
    );
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button type="submit" className="sign-in-button">
        Sign In
      </button>
    </form>
  );
};

export default Login;
