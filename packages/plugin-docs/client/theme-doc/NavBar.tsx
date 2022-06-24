import React, { useState } from 'react';
import { useThemeContext } from './context';
import ExternalLink from './icons/link.svg';
import useLanguage from './useLanguage';

export default () => {
  const { themeConfig } = useThemeContext()!;
  return (
    <ul className="flex">
      {themeConfig.navs.map((nav: any) => (
        <NavItem nav={nav} key={nav.path} />
      ))}
    </ul>
  );
};

interface NavItemProps {
  nav: {
    path: string;
    title: string;
    type?: 'nav' | 'link';
    dropdown?: {
      title: string;
      path: string;
    }[];
  };
}

function NavItem(props: NavItemProps) {
  const { components } = useThemeContext()!;
  const { nav } = props;
  const lang = useLanguage();
  const [isExpanded, setExpanded] = useState(false);

  const isExternalLink = (n: NavItemProps['nav']) => {
    return (
      n.type === 'link' && /(https|http):\/\/([\w.]+\/?)\S*/.test(nav.path)
    );
  };

  return (
    <li
      className="ml-8 dark:text-white relative"
      onMouseEnter={() => nav.dropdown && setExpanded(true)}
      onMouseLeave={() => nav.dropdown && setExpanded(false)}
    >
      {isExternalLink(nav) ? (
        <a href={nav.path} target="_blank">
          <span className="flex">
            {nav.title}
            <img className="link-icon" src={ExternalLink} alt="ExternalLink" />
          </span>
        </a>
      ) : (
        <components.Link
          to={
            lang.isFromPath ? lang.currentLanguage?.locale + nav.path : nav.path
          }
        >
          {lang.render(nav.title)}
        </components.Link>
      )}
      {nav.dropdown && (
        <div
          style={{ maxHeight: isExpanded ? nav.dropdown.length * 48 : 0 }}
          className="absolute transition-all duration-300 w-32 rounded-lg
       cursor-pointer shadow overflow-hidden top-8"
        >
          {nav.dropdown.map((n) => (
            <>
              {isExternalLink(n) ? (
                <a href={n.path} target="_blank">
                  <span className="flex">
                    <span
                      className="p-2 bg-white dark:bg-gray-700 dark:text-white
            hover:bg-gray-50 transition duration-300"
                    >
                      {nav.title}
                    </span>
                    <img
                      className="link-icon"
                      src={ExternalLink}
                      alt="ExternalLink"
                    />
                  </span>
                </a>
              ) : (
                <components.Link
                  key={n.path}
                  to={
                    lang.isFromPath
                      ? lang.currentLanguage?.locale + n.path
                      : n.path
                  }
                >
                  <p
                    className="p-2 bg-white dark:bg-gray-700 dark:text-white
            hover:bg-gray-50 transition duration-300"
                  >
                    {n.title}
                  </p>
                </components.Link>
              )}
            </>
          ))}
        </div>
      )}
    </li>
  );
}
