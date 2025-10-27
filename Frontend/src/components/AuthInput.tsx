export type AuthInputVariant = 
  | 'default'
  | 'error'
;

export interface AuthInputProps {
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  variant?: AuthInputVariant;
}

const AuthInput = ({
  name,
  type,
  value,
  onChange,
  placeholder,
  variant = 'default',
}: AuthInputProps): React.JSX.Element => {
  const inputCnBase = "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500";
  let inputCn;

  switch (variant) {
    case 'error':
      inputCn = `${inputCnBase} border-2 border-red-500`;
      break;
    case 'default':
      inputCn = inputCnBase;
      break;
    default:
      throw new Error(`Unrecognized variant "${variant}"`);
  }//-- end switch (variant)

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {name}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputCn}
      />
    </div>
  ); 
};// -- end AuthInput

export default AuthInput;
