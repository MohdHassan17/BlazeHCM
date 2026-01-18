import React from "react";

function Heading({ text, icon }: { text: string; icon: React.ReactNode }) {
  return (
    <>
      <div className=" text-sm font-bold text-(--color-digital-blue-700)    m-2 flex gap-2 items-center">
        {icon}
        <h1>{text}</h1>
      </div>
    </>
  );
}

export default Heading;
