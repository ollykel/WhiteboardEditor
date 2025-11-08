import React from "react";

interface AttributeLableProps {
  title: string,
  children: React.ReactElement<{ className?: string}>;
}

const AttributeMenuItem = ({ 
  title,
  children, 
}: AttributeLableProps) => {
  return (
    <div className="flex justify-between items-center">
      <label className="text-md text-center">
        {title}
      </label>
      {React.cloneElement(children, {
        className: `${children.props.className ?? ""} w-10 pl-2 mx-4`,
      })}
    </div>
  );
}

export default AttributeMenuItem;