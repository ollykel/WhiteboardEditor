interface AttributeLableProps {
  children: string;
}

const AttributeLabel = ({ 
  children, 
}: AttributeLableProps) => {
  return (
    <label>{children}</label>
  );
}

export default AttributeLabel;