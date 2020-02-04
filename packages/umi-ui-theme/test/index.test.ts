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

  it('dark theme', () => {
    expect(dark).toEqual({
      light: '#fff',
      dark: '#000',
      'background-color-light': '#3b3b4d',
      'background-color-base': '#23232d',
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
      'zindex-modal': '1001',
      'zindex-modal-mask': '1001',
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
      'select-background': '#3b3b4d',
      'input-number-hover-border-color': '#40a9ff',
    });
  });
});
