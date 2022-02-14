import cx from 'classnames';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '../context';

function Announcement() {
  const { themeConfig } = useThemeContext()!;

  if (!themeConfig.announcement) {
    return null;
  }

  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!themeConfig.announcement) return;
    const item = localStorage.getItem('closed_announcements');
    const closed: string[] = item ? JSON.parse(item) : [];
    if (closed.includes(themeConfig.announcement.title)) {
      setClosed(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--anchor-offset',
      (closed ? 0 : 28) + 'px',
    );
  }, [closed]);

  function close(e: React.MouseEvent) {
    e.preventDefault();
    if (!themeConfig.announcement) return;
    const item = localStorage.getItem('closed_announcements');
    const closed: string[] = item ? JSON.parse(item) : [];
    closed.push(themeConfig.announcement.title);
    localStorage.setItem('closed_announcements', JSON.stringify(closed));
    setClosed(true);
  }

  if (closed) return null;

  return (
    <div className="w-full py-1 bg-blue-200 dark:bg-blue-900 animate-pulse">
      <p
        className={cx(
          'text-center dark:text-white text-sm font-bold ',
          themeConfig.announcement.link && 'cursor-pointer',
        )}
        onClick={() => {
          window.open(themeConfig.announcement?.link, '_blank');
        }}
      >
        {themeConfig.announcement.title}
      </p>
      <button className="absolute right-2 top-0 px-8" onClick={close}>
        x
      </button>
    </div>
  );
}

export default Announcement;
