import React from "react";

export default function Icon({ name }) {
  return (
    <svg className="icon" aria-hidden="true" focusable="false">
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
}
