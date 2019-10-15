import * as path from 'path';
import * as fs from 'fs';
import less from 'less';
import LessPluginCleanCSS from 'less-plugin-clean-css';
import { dark, light } from '../lib';

const cleanCSSPlugin = new LessPluginCleanCSS({ advanced: true });
const darkLess = fs.readFileSync(path.resolve(__dirname, '..', 'dark.less'), 'utf8');

describe('theme', () => {
  let render;
  beforeAll(() => {
    render = str => {
      return less.render(
        `
        ${darkLess}
        ${str}
      `,
        {
          plugins: [cleanCSSPlugin],
        },
      );
    };
  });
  // it('index less', async () => {
  //   const { css } = await render(`
  //     .a {
  //       font: @light;
  //       font: @dark;
  //       font: @heading-color;
  //       font: @text-color;
  //       font: @text-color-secondary;
  //       font: @disabled-color;
  //       font: @primary-5;
  //       font: @primary-color;
  //       font: @outline-color;
  //       font: @icon-color;
  //       font: @icon-color-hover;
  //       font: @primary-6;
  //       font: @border-color-base;
  //       font: @btn-default-color;
  //       font: @btn-default-bg;
  //       font: @btn-default-border;
  //       font: @btn-ghost-color;
  //       font: @btn-ghost-border;
  //       font: @input-color;
  //       font: @input-bg;
  //       font: @input-disabled-bg;
  //       font: @input-placeholder-color;
  //       font: @input-hover-border-color;
  //       font: @checkbox-check-color;
  //       font: @checkbox-color;
  //       font: @select-border-color;
  //       font: @item-active-bg;
  //       font: @border-color-split;
  //       font: @menu-dark-bg;
  //       font: @body-background;
  //       font: @component-background;
  //       font: @layout-sider-background;
  //       font: @layout-body-background;
  //       font: @tooltip-bg;
  //       font: @tooltip-arrow-color;
  //       font: @popover-bg;
  //       font: @success-color;
  //       font: @info-color;
  //       font: @warning-color;
  //       font: @error-color;
  //       font: @menu-bg;
  //       font: @menu-item-active-bg;
  //       font: @menu-highlight-color;
  //       font: @card-background;
  //       font: @card-hover-border;
  //       font: @card-actions-background;
  //       font: @tail-color;
  //       font: @radio-button-bg;
  //       font: @radio-button-checked-bg;
  //       font: @radio-dot-color;
  //       font: @box-shadow-base;
  //       font: @shadow-2;
  //       font: @shadow-1-right;
  //       font: @border-radius-base;
  //       font: @zindex-notification;
  //       font: @zindex-popover;
  //       font: @zindex-tooltip;
  //       font: @anchor-border-width;
  //       font: @form-item-margin-bottom;
  //       font: @menu-item-vertical-margin;
  //       font: @menu-item-boundary-margin;
  //       font: @font-size-base;
  //       font: @font-size-lg;
  //       font: @screen-xl;
  //       font: @screen-lg;
  //       font: @screen-md;
  //       font: @screen-sm;
  //       font: @screen-xs;
  //       font: @table-row-hover-bg;
  //       font: @tabs-horizontal-padding;
  //       font: @item-hover-bg;
  //     }
  //   `);
  //   expect(css).toBe(
  //     `.a{font:#000;font:rgba(255,255,255,.25);font:#40a9ff;font:#096dd9;font:rgba(255,255,255,.85);font:#444457;font:rgba(255,255,255,.65);font:#4c4c61;font:rgba(255,255,255,.45);font:#272733;font:#17171f;font:#3b3b4d;font:#23232e;font:#191922;font:#2d2d3b;font:#00a854;font:#ffbf00;font:#f04134;font:rgba(255,255,255,.05);font:#fff;font:#30303d;font:rgba(255,255,255,.1);font:transparent;font:#1890ff;font:0 2px 20px 0 rgba(0,0,0,.45);font:0 -4px 12px 0 rgba(0,0,0,.12);font:2px;font:1063;font:1061;font:1060;font:1px;font:24px;font:0;font:14px;font:16px;font:1208px;font:1024px;font:768px;font:767.9px;font:375px;font:12px 0;font:#383847}`,
  //   );
  // });

  it('dark theme', () => {
    expect(dark).toEqual({
      light: '#fff',
      dark: '#000',
      'select-item-active-bg': '#4c4c61',
      'heading-3-size': '16px',
      'btn-font-size-sm': '12px',
      'heading-color': 'fade(@light, 85)',
      'text-color': 'fade(@light, 65)',
      'text-color-secondary': 'fade(@light, 45)',
      'disabled-color': 'fade(@light, 25)',
      'primary-5': '#40a9ff',
      'primary-color': '#1890ff',
      'outline-color': '#1890ff',
      'icon-color': 'fade(@light, 65)',
      'icon-color-hover': 'fade(@light, 85)',
      'primary-6': '#096dd9',
      'border-color-base': 'transparent',
      'btn-default-color': 'fade(@light, 85)',
      'btn-default-bg': '#444457',
      'btn-default-border': '#444457',
      'btn-ghost-color': 'fade(@light, 45)',
      'btn-ghost-border': 'fade(@light, 45)',
      'input-color': 'fade(@light, 65)',
      'input-bg': '#17171f',
      'input-disabled-bg': '#4c4c61',
      'input-placeholder-color': 'fade(@light, 45)',
      'input-hover-border-color': 'fade(@light, 10)',
      'checkbox-check-color': '#3b3b4d',
      'checkbox-color': '#1890ff',
      'select-border-color': '#3b3b4d',
      'item-active-bg': '#272733',
      'border-color-split': '#17171f',
      'menu-dark-bg': '#3b3b4d',
      'body-background': '#23232e',
      'component-background': '#23232e',
      'layout-sider-background': '#30303d',
      'layout-body-background': '#23232e',
      'layout-header-background': '#30303d',
      'layout-header-height': '40px',
      'layout-header-padding': '16px',
      'tooltip-bg': '#191922',
      'tooltip-arrow-color': '#191922',
      'popover-bg': '#2d2d3b',
      'success-color': '#00a854',
      'info-color': '#1890ff',
      'warning-color': '#ffbf00',
      'error-color': '#f04134',
      'menu-bg': '#30303d',
      'menu-collapsed-width': '64px',
      'menu-item-active-bg': 'fade(@light, 5)',
      'menu-highlight-color': '#fff',
      'card-background': '#30303d',
      'card-hover-border': '#383847',
      'card-actions-background': '#30303d',
      'tail-color': 'fade(@light, 10)',
      'radio-button-bg': 'transparent',
      'radio-button-checked-bg': 'transparent',
      'radio-dot-color': '#1890ff',
      'box-shadow-base': '0 2px 20px 0 fade(@dark, 45)',
      'shadow-2': '0 2px 20px 0 fade(@dark, 45)',
      'shadow-1-right': '0 -4px 12px 0 fade(@dark, 12)',
      'border-radius-base': '2px',
      'zindex-notification': '1063',
      'zindex-popover': '1061',
      'zindex-tooltip': '1060',
      'anchor-border-width': '1px',
      'form-item-margin-bottom': '24px',
      'menu-item-vertical-margin': '0px',
      'menu-item-boundary-margin': '0px',
      'font-size-base': '14px',
      'font-size-lg': '16px',
      'font-size-sm': '12px',
      'screen-xl': '1208px',
      'screen-lg': '1024px',
      'screen-md': '768px',
      'screen-sm': '767.9px',
      'screen-xs': '375px',
      'table-row-hover-bg': '#383847',
      'item-hover-bg': '#383847',
      'tabs-horizontal-padding': '12px 0',
    });
  });
});
