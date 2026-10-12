import { useEffect, useState } from 'react';

/** Keep centered notifications below the navigation, including when its buttons wrap. */
export default function AdminToast({ toast }) {
  const [top, setTop] = useState(null);

  useEffect(() => {
    const nav = document.querySelector('nav');
    const updatePosition = () => setTop((nav?.getBoundingClientRect().height || 80) + 16);
    updatePosition();

    if (!nav) return;
    const observer = new ResizeObserver(updatePosition);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  if (!toast || top === null) return null;

  return (
    <div
      className={`toast toast-${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
      style={{
        top,
        maxWidth: 'min(480px, calc(100vw - 32px))',
        overflowWrap: 'anywhere',
        maxHeight: `calc(100dvh - ${top + 20}px)`,
        overflowY: 'auto',
      }}
    >
      {toast.msg}
    </div>
  );
}
