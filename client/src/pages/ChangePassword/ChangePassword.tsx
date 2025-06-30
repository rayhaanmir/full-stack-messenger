import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosReturnLeft } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import type { Socket } from "socket.io-client";
import "./ChangePassword.css";

interface ChangePasswordProps {
  socket: Socket;
  isMobile: boolean;
  protocol: string;
  host: string;
  port: string;
}

const ChangePassword = ({
  socket,
  isMobile,
  protocol,
  host,
  port,
}: ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit(
      "change-password",
      currentPassword,
      newPassword,
      (passwordChanged: boolean) => {
        if (passwordChanged) {
          alert("Password changed successfully");
          setCurrentPassword("");
          setNewPassword("");
          navigate("/home");
        } else {
          alert("Failed to change password");
          setCurrentPassword("");
          setNewPassword("");
        }
      }
    );
  };

  const navigateLogin = () => {
    socket.disconnect();
    fetch(`${protocol}://${host}:${port}/api/logout`, {
      method: "DELETE",
      credentials: "include",
    });
    localStorage.clear();
    navigate("/login");
  };

  const currentPasswordInputProps = {
    className: "current-password-input",
    type: "password",
    value: currentPassword,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setCurrentPassword(e.target.value),
    placeholder: "Current Password",
  };

  const newPasswordInputProps = {
    className: "new-password-input",
    type: "password",
    value: newPassword,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setNewPassword(e.target.value),
    placeholder: "New Password",
  };

  const iconWrapperProps = {
    className: "icon-wrapper",
    tabIndex: -1,
  };

  const logoutIconProps = {
    className: "logout-icon",
    tabIndex: 0,
    onClick: navigateLogin,
    onKeyDown: (e: React.KeyboardEvent<SVGElement>) =>
      e.key === "Enter" && navigateLogin(),
    title: "Log out",
  };

  const returnProps = {
    className: "return-icon",
    tabIndex: 0,
    onClick: () => navigate("/home"),
    onKeyDown: (e: React.KeyboardEvent<SVGElement>) =>
      e.key === "Enter" && navigate("/home"),
    title: "Go back home",
  };

  return (
    <>
      <div className="top-bar">
        <div {...iconWrapperProps}>
          <IoIosReturnLeft {...returnProps} />
          <IoIosLogOut {...logoutIconProps} />
        </div>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <input {...currentPasswordInputProps} />
        <input {...newPasswordInputProps} />
        <button type="submit" className="change-password-button">
          Change Password
        </button>
      </form>
    </>
  );
};

export default ChangePassword;
