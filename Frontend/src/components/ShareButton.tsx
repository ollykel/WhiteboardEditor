interface ShareButtonProps {
  onShare?: () => void;
}

function ShareButton({ onShare }: ShareButtonProps) {
  return (
    <button
      onClick={onShare}
      className="p-1 bg-gray-500 text-white rounded-xl hover:bg-gray-400"
    >
      Share
    </button>
  );
}

export default ShareButton;