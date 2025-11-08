interface AttributeLableProps {
  title: string,
  children: React.ReactElement<HTMLInputElement>;
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
      {children}
    </div>
  );
}

export default AttributeMenuItem;