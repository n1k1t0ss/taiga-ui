(window.webpackJsonp=window.webpackJsonp||[]).push([[653],{XakA:function(n,t,i){"use strict";i.r(t),t.default="@import 'taiga-ui-local';\n\n:host {\n    position: relative;\n    display: flex;\n    flex: 1;\n    align-items: center;\n    max-width: 100%;\n    height: var(--tui-height-l);\n    box-sizing: border-box;\n    outline: none;\n\n    &[data-size='m'] {\n        height: var(--tui-height-m);\n    }\n}\n\n:host-context(*:focus) {\n    .icon-content {\n        background-color: var(--tui-base-01);\n        color: var(--tui-text-03);\n    }\n}\n\n.icon {\n    margin: 0 @space * 2 0 calc(-1px - @space);\n\n    :host[data-size='m'] & {\n        transform: scale(0.75);\n    }\n}\n\n.info {\n    min-width: 0;\n    margin-right: @space * 2;\n    overflow: hidden;\n}\n\n.icon-content {\n    display: flex;\n}\n\n.card {\n    max-width: 2rem;\n    max-height: 2rem;\n    margin: 0 0.375rem 0 auto;\n    flex-shrink: 0;\n}\n\n.name {\n    .text-overflow();\n    display: block;\n    font: var(--tui-font-text-s);\n    color: var(--tui-text-02);\n    margin-bottom: -0.125rem;\n\n    :host[data-size='m'] & {\n        font: var(--tui-font-text-xs);\n    }\n}\n\n.value {\n    font: var(--tui-font-text-m);\n\n    :host[data-size='m'] & {\n        font: var(--tui-font-text-s);\n    }\n}\n"}}]);