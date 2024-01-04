import React from 'react';
import { TextLoop } from 'react-text-loop-next';
import styled from 'styled-components';
import { Link } from 'umi';
import { GithubStar } from './GithubStar';
import {
  BG_IMAGE,
  BIG_LOGE_IMAGE,
  BIG_SLOGAN1_IMAGE,
  BIG_SLOGAN2_IMAGE,
  BOW_IMAGE,
  GITHUB_STAR_IMAGE,
} from './image';

const HeroWrapper = styled.div`
  height: 640px;
  position: relative;
  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: url('${BG_IMAGE}') repeat-x;
    background-position: 0 -40px;
    background-size: 140px 700px;
    height: 640px;
    z-index: 1;
  }
  .wrapper {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    z-index: 2;
    .left {
      flex: 1;
      padding-top: 130px;
      padding-left: 90px;
      .bigLogo {
        width: 460px;
        height: 213px;
        background: url('${BIG_LOGE_IMAGE}') no-repeat;
        background-size: 460px 213px;
      }

      .actions {
        margin-top: 87px;
        display: flex;
        .button {
          background-image: linear-gradient(
            224deg,
            #0071da 0%,
            #1890ff 100%,
            #1890ff 100%
          );
          width: 180px;
          height: 54px;
          line-height: 54px;
          text-align: center;
          color: #fff;
          font-size: 22px;
          margin-left: 27px;
        }
        .button:hover {
          background-image: linear-gradient(
            224deg,
            #48a4fe 0%,
            #6fbafe 100%,
            #8dc9ff 100%
          );
        }
        .githubStar {
          display: flex;
          font-size: 18px;
          color: #4a5e71;
          margin-left: 40px;
          line-height: 54px;
          /*padding-left: 28px;*/
          /*background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTEyIDBDNS4zNzQgMCAwIDUuMzczIDAgMTJjMCA1LjMwMiAzLjQzOCA5LjggOC4yMDcgMTEuMzg3LjU5OS4xMTEuNzkzLS4yNjEuNzkzLS41Nzd2LTIuMjM0Yy0zLjMzOC43MjYtNC4wMzMtMS40MTYtNC4wMzMtMS40MTYtLjU0Ni0xLjM4Ny0xLjMzMy0xLjc1Ni0xLjMzMy0xLjc1Ni0xLjA4OS0uNzQ1LjA4My0uNzI5LjA4My0uNzI5IDEuMjA1LjA4NCAxLjgzOSAxLjIzNyAxLjgzOSAxLjIzNyAxLjA3IDEuODM0IDIuODA3IDEuMzA0IDMuNDkyLjk5Ny4xMDctLjc3NS40MTgtMS4zMDUuNzYyLTEuNjA0LTIuNjY1LS4zMDUtNS40NjctMS4zMzQtNS40NjctNS45MzEgMC0xLjMxMS40NjktMi4zODEgMS4yMzYtMy4yMjEtLjEyNC0uMzAzLS41MzUtMS41MjQuMTE3LTMuMTc2IDAgMCAxLjAwOC0uMzIyIDMuMzAxIDEuMjNBMTEuNTA5IDExLjUwOSAwIDAgMSAxMiA1LjgwM2MxLjAyLjAwNSAyLjA0Ny4xMzggMy4wMDYuNDA0IDIuMjkxLTEuNTUyIDMuMjk3LTEuMjMgMy4yOTctMS4yMy42NTMgMS42NTMuMjQyIDIuODc0LjExOCAzLjE3Ni43Ny44NCAxLjIzNSAxLjkxMSAxLjIzNSAzLjIyMSAwIDQuNjA5LTIuODA3IDUuNjI0LTUuNDc5IDUuOTIxLjQzLjM3Mi44MjMgMS4xMDIuODIzIDIuMjIydjMuMjkzYzAgLjMxOS4xOTIuNjk0LjgwMS41NzZDMjAuNTY2IDIxLjc5NyAyNCAxNy4zIDI0IDEyYzAtNi42MjctNS4zNzMtMTItMTItMTJ6Ii8+PC9zdmc+) no-repeat 0 center;*/
          /*background-size: 24px 24px;*/
        }
        .githubStar:before {
          background: url('${GITHUB_STAR_IMAGE}') no-repeat 0 center;
          background-size: 24px 24px;
          width: 24px;
          height: 54px;
          display: inline-block;
          content: '';
          margin-right: 6px;
        }
      }
      .actions a {
        text-decoration: none;
      }
    }
    .right {
      width: 460px;
      padding-top: 90px;
      margin-right: 40px;
      .bigSlogan1 {
        background: url('${BIG_SLOGAN1_IMAGE}') no-repeat;
        width: 234px;
        height: 76px;
        background-size: 234px 76px;
        margin: 0 auto 6px;
      }

      .bigSlogan2 {
        background: url('${BIG_SLOGAN2_IMAGE}') no-repeat;
        width: 350px;
        height: 58px;
        background-size: 350px 58px;
        margin: 0 auto 14px;
      }

      .slogan {
        font-size: 25px;
        color: #708293;
        text-align: center;
        width: 460px;
      }
      .slogan strong {
        color: #0273dc;
        font-weight: normal;
      }
      .bow {
        background: url('${BOW_IMAGE}') no-repeat;
        width: 380px;
        height: 193px;
        background-size: 380px 193px;
        margin: 8px auto 0;
      }
    }
  }
`;
export const Hero = () => {
  // TODO: github stars 存 localStorage
  //  采用 stale-while-revalidate 的策略
  localStorage.length;
  return (
    <HeroWrapper>
      <div className="bg"></div>
      <div className="wrapper">
        <div className="left">
          <div className="bigLogo" />
          <div className="actions">
            <Link to="/docs/tutorials/getting-started">
              <div className="button">快速上手 →</div>
            </Link>
            <div className="githubStar">
              <GithubStar />
            </div>
          </div>
        </div>
        <div className="right">
          <div className="bigSlogan1"></div>
          <div className="bigSlogan2"></div>
          <div className="slogan">
            用 Umi 构建你的下一个{' '}
            <TextLoop>
              <strong>React</strong>
              <strong>Vue</strong>
              <strong>PC</strong>
              <strong>Mobile</strong>
              <strong>SPA</strong>
              <strong>SSR</strong>
              <strong>CSR</strong>
              <strong>中后台</strong>
            </TextLoop>{' '}
            应用
          </div>
          <div className="slogan">
            带给你<strong>简单</strong>而<strong>愉悦</strong>的 Web 开发体验
          </div>
          <div className="bow" />
        </div>
      </div>
    </HeroWrapper>
  );
};
