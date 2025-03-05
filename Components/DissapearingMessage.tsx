import { useEffect, useState } from "react";

interface DissapearingMessageProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export default function DissapearingMessage({
  children,
  duration = 5000,
  className,
}: DissapearingMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  return (
    <div
      className={`${
        visible ? "opacity-100" : "opacity-0"
      } w-max transition-opacity duration-500 ${className}`}
    >
      {children}
    </div>
  );
}
