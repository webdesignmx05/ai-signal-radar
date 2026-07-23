import { useEffect, useRef, useState } from "react";

export default function TurnstileWidget({ siteKey, onToken }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [message, setMessage] = useState("Loading bot verification…");

  useEffect(() => {
    let cancelled = false;
    let retryTimer;

    onToken("");

    if (!siteKey) {
      setMessage("Turnstile is not configured for this environment.");
      return undefined;
    }

    function renderWidget() {
      if (cancelled) return;

      if (!window.turnstile || !containerRef.current) {
        retryTimer = window.setTimeout(renderWidget, 100);
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        size: "flexible",
        action: "submit_question",

        callback(token) {
          setMessage("");
          onToken(token);
        },

        "expired-callback"() {
          onToken("");
          setMessage("Verification expired. Please complete it again.");
        },

        "error-callback"() {
          onToken("");
          setMessage("Verification could not load. Refresh the page and try again.");
        }
      });
    }

    renderWidget();

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);

      if (
        widgetIdRef.current !== null &&
        window.turnstile
      ) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, onToken]);

  return (
    <div className="turnstile-block">
      <div ref={containerRef} />

      {message && (
        <p className="turnstile-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}