// ThemeContext.js
import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from "@mui/material";
import "@fontsource/manrope"; // Importa la fuente por defecto (peso 400)
import "@fontsource/manrope/500.css"; // (opcional) pesos adicionales
import "@fontsource/manrope/700.css"; // (opcional)

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggleTheme = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(() => 
    createTheme({ 
      palette: {
        mode, // 👈 importante
        ...(mode === "light"
          ? {
              // 🎨 Colores para modo claro
              background: {
                default: "#f6f7f8",
                primary: "#ffffff",
                paper: "#ffffff",
                secondary: "#f6f6f6",
              },
              text: {
                primary: "#1a1a1a",
                secondary: "#555555",
              },
              primary: {
                main: "#fff",
                light: '#f8fafc',
                dark: '#f8fafc',
                contrastText: '#333',
              },
              info : {
                main: "#85C9FF",
                light: '#f8fafc',
                dark: '#1e293b99',
                contrastText: '#fff',
              },
              border : "#e2e8f0",
              red: "#ec407b",
              green : "#81c784",
              orange : "#ec7807"
            }
          : {
              // 🌙 Colores para modo oscuro
              background: {
                default: "#101922",
                primary: "#101922",
                paper: "#1e1e1e",
                secondary: "#101929",
              },
              text: {
                primary: "#ffffff",
                secondary: "#b3b3b3",
              },
              primary: {
                main: "#0f172a",
                light: '#f8fafc',
                dark: '#1e293b99',
                contrastText: '#fff',
              },
              info : {
                main: "#85C9FF",
                light: '#f8fafc',
                dark: '#1e293b99',
                contrastText: '#fff',
              },
              border : "#1e293b",
              red: "#ec407a",
              green : "#81c784",
              orange : "#ec7839"
            }),
      },
      typography: { 
        fontFamily: "Manrope, sans-serif",
        h1: { fontWeight: 700 },
        h2: { fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 500 }
      }
    }), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
