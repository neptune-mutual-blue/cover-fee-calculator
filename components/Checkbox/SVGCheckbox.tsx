import { classNames } from "@utils/functions";
import { FC, ReactNode, useState } from "react";

interface SVGCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => any;
  label?: string | ReactNode;
  className?: string;
  labelClass?: string;
  wrapperClass?: string;
}

export const SVGCheckbox: FC<SVGCheckboxProps> = ({
  checked,
  className = "",
  onChange,
  label,
  labelClass = "",
  wrapperClass = "",
}) => {
  return (
    <div className={classNames("flex items-start", wrapperClass)}>
      <button
        onClick={() => onChange(!checked)}
        className="outline-none cursor-default focus:ring-2"
      >
        <span className="sr-only">Checkbox</span>
        {checked ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={className}
          >
            <rect width="24" height="24" rx="4" fill="#4289F2" />
            <path
              d="M7.06898 10.7572C6.48782 10.1669 5.5381 10.1594 4.94772 10.7405C4.35734 11.3217 4.34987 12.2714 4.93102 12.8618L7.06898 10.7572ZM10.125 16L9.05602 17.0523L10.125 18.1382L11.194 17.0523L10.125 16ZM19.069 9.05228C19.6501 8.4619 19.6427 7.51218 19.0523 6.93102C18.4619 6.34987 17.5122 6.35734 16.931 6.94772L19.069 9.05228ZM4.93102 12.8618L9.05602 17.0523L11.194 14.9477L7.06898 10.7572L4.93102 12.8618ZM11.194 17.0523L19.069 9.05228L16.931 6.94772L9.05602 14.9477L11.194 17.0523Z"
              fill="white"
            />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.5"
              y="0.5"
              width="23"
              height="23"
              rx="3.5"
              fill="white"
              stroke="#D4DFEE"
            />
          </svg>
        )}
      </button>
      {label && (
        <label
          className={classNames("ml-2 font-poppins", labelClass)}
          onClick={() => onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
};
