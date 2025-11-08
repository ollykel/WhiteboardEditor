interface AttributeLableProps {
  title: string,
  children: React.ReactElement<HTMLInputElement>;
}

const AttributeMenuItem = ({ 
  title,
  children, 
}: AttributeLableProps) => {
  return (
    <div>
      <label className="text-sm">
        {title}
      </label>
      {children}
    </div>
  );
}

export default AttributeMenuItem;