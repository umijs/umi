import cx from 'classnames';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '../context';
import Github from '../icons/github.svg';
import HeroBackground from '../icons/hero-bg.svg';
import Star from '../icons/star.png';

interface HeroProps {
  title?: string | string[];
  description?: string;
  githubRepo?: string;
  buttons?: {
    label: string;
    href: string;
  }[];
}

function Hero(props: HeroProps) {
  const { components } = useThemeContext()!;
  return (
    <div
      className="w-full h-[calc(100vh-60px)] bg-[rgb(16,37,62)] flex
              flex-row items-center justify-center overflow-hidden"
    >
      <img
        src={HeroBackground}
        className="w-full h-full absolute top-0 left-0
           z-10 object-cover blur-xl"
        alt=""
      />

      <div className="px-8 container lg:px-32 xl:px-64 z-20">
        <div className="flex flex-col items-center">
          {typeof props.title === 'string' && (
            <h1 className="text-white text-xl lg:text-7xl font-extrabold text-center">
              {props.title}
            </h1>
          )}

          {props.title instanceof Array &&
            props.title.map((t, i) => (
              <h1
                className="text-white text-xl lg:text-7xl
                  font-extrabold text-center"
                key={i}
              >
                {t}
              </h1>
            ))}

          {!props.title && <DefaultTitle />}

          <p
            className="text-white text-center my-12
               opacity-70 text-lg text-center"
          >
            {props.description}
          </p>

          <div className="flex flex-row items-center">
            {props.buttons?.map((button, i) => (
              <components.Link to={button.href}>
                <button
                  key={i}
                  className="text-white text-lg bg-blue-600 py-2 min-w-36 mx-4 px-4 rounded-xl shadow-xl
                  shadow-blue-900 hover:shadow-blue-700 transition-all"
                >
                  {button.label}
                </button>
              </components.Link>
            ))}

            {props.githubRepo && <GithubStars repo={props.githubRepo} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultTitle() {
  const [isPlugged, setPlugged] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setPlugged(true);
    }, 100);
  }, []);

  return (
    <>
      <div className="flex flex-row mb-4">
        <h1
          className="text-white text-5xl lg:text-7xl
              font-extrabold text-center"
        >
          一款
        </h1>
        <h1
          className={cx(
            'text-blue-300 text-5xl lg:text-7xl font-extrabold mx-1',
            'transition-all duration-700 delay-100 text-center',
            !isPlugged && 'translate-y-[-5rem]',
          )}
        >
          插件化
        </h1>
        <h1
          className="text-center text-white text-5xl
              lg:text-7xl font-extrabold"
        >
          的
        </h1>
      </div>
      <h1
        className="text-center text-white text-3xl
            lg:text-7xl font-extrabold"
      >
        企业级前端应用框架
      </h1>
    </>
  );
}

function GithubStars(props: { repo: string }) {
  const [stars, setStars] = useState<number>();

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      const res = await fetch('https://api.github.com/repos/' + props.repo);
      setStars((await res.json()).stargazers_count);
    } catch (err) {
      console.error(err);
    }
  }

  if (!stars) return null;

  return (
    <div className="flex flex-row items-center">
      <img src={Github} className="w-4 h-4 mr-2 invert" alt="" />
      <p className="text-white">{stars}</p>
      <img src={Star} className="w-4 h-4 ml-2 invert" alt="" />
    </div>
  );
}

export default Hero;
