"use client";

import { isServer } from "@/utils/utils";
import React, { useEffect, useMemo, useState, useContext, createContext } from "react";


type Theme = "light" | "dark";

interface ThemeContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContext | null>(null);

export default function ThemeProvider({
  children
}: { children: React.ReactNode; }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (isServer()) return "light";
    return (localStorage.getItem("theme") as Theme) || "light"
  })

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);

    localStorage.setItem("theme", theme);
  }, [theme])

  const providerValue=useMemo<ThemeContext>(
    ()=>({ theme, setTheme}),
    [theme]
  );




  return(
    <ThemeContext.Provider value={providerValue}>
        {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(){
    const context= useContext(ThemeContext);
    if(!context) throw Error("useTheme must be used within a ThemeProvider"); 
        return context;
}
