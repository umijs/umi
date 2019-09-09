# umi-ui-theme

## Usage
theme config:

```js
// .umirc.js
import { dark, light } from 'umi-ui-theme';

{
  theme: dark
}
```

less vars:

```less
// dark
@import "~@umi-ui-theme/dark.less";

// light
@import "~@umi-ui-theme/light.less";
```

dark theme might use global style, because of the lack of vars in antd theme.

```less

@btn-disable-bg: transparent;
@btn-disable-color: fade(@light, 25);
@btn-disable-border: fade(@light, 10);
@btn-default-hover-bg: #4c4c61;
@btn-default-active-bg: #272733;
@btn-primary-color: @light;
@btn-primary-hover-bg: #40a9ff;
@btn-primary-active-bg: #096dd9;
@btn-ghost-hover-border: fade(@light, 65);
@select-background: #3b3b4d;
@select-dropdown-bg: #3b3b4d;
@select-dropdown-hover-bg: #4c4c61;
@select-dropdown-active-bg: #4c4c61;
@select-item-selected-bg: #272733;
@checkbox-check-inner-color: @light;
@anchor-border-color: fade(@light, 15);
@modal-footer-border-color-split: #17171f;
@card-bg-color: #30303d;
@radio-button-border-color: #86868c;
@message-background: #2d2d3b;
@notification-background: #2d2d3b;

body {
  .ant-select-selection {
    // TODO: antd less
    background-color: @select-background;
  }
  .ant-message-notice-content {
    background-color: @message-background;
  }
  .ant-notification-notice {
    background-color: @notification-background;
  }
  .ant-radio-button-wrapper:first-child {
    border-left-color: @radio-button-border-color;
  }
  .ant-radio-button-wrapper {
    border-color: @radio-button-border-color;
  }
  .anticon {
    transition: color 0.3s;
  }
  a {
    .anticon {
      &:hover {
        color: @icon-color-hover;
      }
    }
  }

  .ant-card {
    background-color: @card-bg-color;
  }
  .ant-steps-item-process > .ant-steps-item-content > .ant-steps-item-title::after {
    background-color: @process-tail-color;
  }
  .ant-tooltip-placement-top .ant-tooltip-arrow {
    border-right-color: @tooltip-arrow-color;
    border-bottom-color: @tooltip-arrow-color;
  }
  .ant-card-head {
    border-bottom: none;
  }
  .ant-modal-footer {
    border-color: @modal-footer-border-color-split;
  }
  .ant-checkbox-checked .ant-checkbox-inner::after {
    border-color: @checkbox-check-inner-color;
  }
  .ant-switch-loading-icon,
  .ant-switch::after {
    background-color: @light;
  }
  .ant-anchor-ink {
    &::before {
      background-color: @anchor-border-color;
    }
    .ant-anchor-ink-ball {
      display: none;
    }
  }
  .ant-select-dropdown {
    background-color: @select-dropdown-bg;
  }
  .ant-select-dropdown-menu-item-selected {
    background-color: @select-item-selected-bg;
  }
  .ant-dropdown-menu-dark {
    .ant-dropdown-menu-item:hover {
      background-color: @ui-sidebar-menu-hover-bg;
      color: @text-color;
    }
  }

  .ant-select-dropdown-menu-item {
    transition: all @duration-fast @ease-base-out;
  }
  .ant-select-dropdown-menu-item:hover:not(.ant-select-dropdown-menu-item-disabled) {
    background-color: @select-dropdown-hover-bg;
  }
  .ant-select-dropdown-menu-item-active:hover:not(.ant-select-dropdown-menu-item-disabled) {
    background-color: @select-dropdown-active-bg;
  }

  .ant-btn {
    &:hover,
    &:focus {
      color: @heading-color;
      background-color: @btn-default-hover-bg;
      border-color: @btn-default-hover-bg;
    }
    &:active,
    &.active {
      color: @heading-color;
      background-color: @btn-default-active-bg;
      border-color: @btn-default-active-bg;
    }
  }
  .ant-btn-dashed {
    &:hover,
    &:focus {
      border-color: @btn-ghost-hover-border;
    }
  }
  .ant-btn-background-ghost {
    color: @btn-ghost-color;
    border-color: @btn-ghost-border;
  }
  .ant-btn-primary {
    &:hover,
    &:focus {
      color: @btn-primary-color;
      background-color: @btn-primary-hover-bg;
      border-color: @btn-primary-hover-bg;
    }
    &:active,
    &.active {
      color: @btn-primary-color;
      background-color: @btn-primary-active-bg;
      border-color: @btn-primary-active-bg;
    }
  }
}
```
