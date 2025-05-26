import React, { useState } from "react";
import "./TextInput.css";

interface TextInputProps {
  text: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextInput = ({ text, handleChange }: TextInputProps) => {
  return (
    <textarea
      value={text}
      onChange={handleChange}
      className="text-area"
      placeholder="Enter Text Here"
    />
  );
};

export default TextInput;
