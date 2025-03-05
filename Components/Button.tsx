import { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps<T extends React.ElementType>{
    as?: T;
}

export default function Button<T extends React.ElementType = "button">({
    as,
    ...props
}: ButtonProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>) {
    const Component= as ||  "button";


  return (
    <Component
      {...props}
      className={twMerge("bg text flex items-center justify-center gap-2 rounded bg-yellow-500 to-black p-[0.875rem] hover:bg-yellow-600 active:bg-yellow-600 disabled:bg-gray-500",
      props.className
    )}
    />
  );
}
