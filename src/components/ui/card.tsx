import React, { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
