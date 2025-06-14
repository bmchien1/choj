import React from "react";

interface TextareaProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  name,
  value,
  onChange,
  placeholder,
  className = "w-full p-2 border rounded-md bg-white",
}) => {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      rows={4}
    />
  );
};

export default Textarea;
