import { useEffect } from "react";
import { createRoot } from "react-dom/client";

function App() {
  useEffect(() => {
    const legacyScript = document.getElementById("legacyScript");
    if (!legacyScript) return;

    const script = document.createElement("script");
    script.textContent = legacyScript.textContent;
    document.body.appendChild(script);

    return () => script.remove();
  }, []);

  const pageMarkup = document.getElementById("pageMarkup")?.innerHTML ?? "";

  return (
    <div
      className="react-page"
      dangerouslySetInnerHTML={{ __html: pageMarkup }}
    />
  );
}

createRoot(document.getElementById("root")).render(<App />);
