import { useTheme } from "../contexts/ThemeContext.jsx";
import { Sun, Moon, Code2 } from "lucide-react";
import Button from "./forms/Button.jsx";

export default function Header() {
  const { toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <Code2 size={28} />
        </div>
        <h1 className="header-title">Embedded SDK Playground</h1>
        <span className="header-version">v0.2.3</span>
      </div>
      <div className="header-right">
        <Button
          id="theme-toggle"
          size="icon"
          title="Toggle Theme"
          onClick={toggleTheme}
        >
          <Sun className="icon-sun" size={20} />
          <Moon className="icon-moon" size={20} />
        </Button>
      </div>
    </header>
  );
}
