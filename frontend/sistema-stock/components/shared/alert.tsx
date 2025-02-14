import { cn } from "@/lib/utils";

interface AlertProps {
  message: string;
  variant?: "info" | "success" | "warning" | "error" | "primary" | "secondary" | "dark";
  className?: string;
  onClose?: () => void;
  showIcon?: boolean;
}

const variantStyles = {
  primary: "bg-blue-100 text-blue-900 border-blue-200",
  secondary: "bg-gray-100 text-gray-900 border-gray-200",
  success: "bg-green-100 text-green-900 border-green-200",
  error: "bg-red-100 text-red-900 border-red-200",
  warning: "bg-yellow-100 text-yellow-900 border-yellow-200",
  info: "bg-purple-100 text-purple-900 border-purple-200",
  dark: "bg-gray-300 text-gray-900 border-gray-400"
};

const icons: Record<AlertProps['variant'] & string, JSX.Element> = {
  primary: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  ),
  secondary: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  ),
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m9 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  dark: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 10a1 1 0 01-1 1H9a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v10zm0 0c.53 0 1.039-.016 1.524-.049C10.543 12.12 9.57 11.46 8.86 10.75c-.712-.712-1.073-1.685-1.074-2.498-.05C5.207 11.88 4.545 12.852 3.83 13.56C3.12 14.268 2.46 15.24 1.992 16.476c-.05.12-.096.255-.144.39-.306C1.463 15.46 2.127 14.487 2.84 13.78c.705-.705 1.68-1.065 2.805-1.05" />
    </svg>
  )
};

const closeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export function Alert({ 
  message, 
  variant = "primary", 
  className,
  onClose,
  showIcon = true
}: AlertProps) {
  return (
    <div className={cn(
      "flex justify-between items-center px-5 py-3 text-sm rounded-md border",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-center">
        {showIcon && variant in icons && (
          <div className="mr-2 w-4">
            {icons[variant]}
          </div>
        )}
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-2 w-4 transition-opacity hover:opacity-75"
        >
          {closeIcon}
        </button>
      )}
    </div>
  );
}
