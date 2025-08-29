import { useForm } from '@tanstack/react-form';
import { useState, useRef, useEffect } from 'react';

export type UserPermissions = 'view' | 'edit';

export interface ShareWhiteboardFormData {
  email: string;
  permissions: UserPermissions;
}

export interface ShareWhiteboardFormProps {
  shareLink: string;
  onSubmit: (data: ShareWhiteboardFormData) => void;
}

const ShareWhiteboardForm = (props: ShareWhiteboardFormProps) => {
  const form = useForm({
    defaultValues: {
      email: '',
      permissions: 'view' as UserPermissions,
    },
    onSubmit: async ({ value }: { value: ShareWhiteboardFormData }) => {
      props.onSubmit(value);
    },
  });

  const [copied, setCopied] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="bg-gray-200 border border-gray-400 rounded-sm p-3 w-[320px] text-sm space-y-3">
      {/* Share Link */}
      <div className="flex items-center">
        <input
          type="text"
          value={props.shareLink}
          readOnly
          className="flex-1 border border-gray-500 rounded-sm px-2 py-1 bg-white text-xs"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="ml-2 px-2 py-1 border border-gray-600 rounded-sm bg-gray-100 hover:bg-gray-300 text-xs"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Invite Row */}
      <form onSubmit={form.handleSubmit} className="flex items-center space-x-2 relative">
        {/* Email Input */}
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              !value.includes('@') ? 'Invalid email' : undefined,
          }}
        >
          {(field) => (
            <input
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Invite by Email"
              className="flex-1 border border-gray-500 rounded-sm px-2 py-1 text-xs bg-white text-black"
            />
          )}
        </form.Field>

        {/* Permissions Dropdown (custom) */}
        <form.Field name="permissions">
          {(field) => (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setOpenDropdown((o) => !o)}
                className="border border-gray-500 rounded-sm px-2 py-1 text-xs bg-white flex items-center space-x-1"
              >
                <span className="capitalize">{field.state.value}</span>
                <span className="text-[10px]">⌄</span>
              </button>
              {openDropdown && (
                <div className="absolute left-0 mt-1 w-full border border-gray-500 bg-white rounded-sm shadow-sm text-xs z-10">
                  <div
                    className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      field.handleChange('view');
                      setOpenDropdown(false);
                    }}
                  >
                    View
                  </div>
                  <div
                    className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      field.handleChange('edit');
                      setOpenDropdown(false);
                    }}
                  >
                    Edit
                  </div>
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Invite Button */}
        <form.Subscribe selector={(s) => [s.isSubmitting]}>
          {([isSubmitting]) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 border border-gray-600 rounded-sm bg-gray-100 hover:bg-gray-300 text-xs"
            >
              Invite
            </button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
};

export default ShareWhiteboardForm;
