import * as React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = ({ checked, onChange, ...props }: CheckboxProps) => {
  return (
    <input type="checkbox" checked={checked} onChange={onChange} {...props} />
  );
};
