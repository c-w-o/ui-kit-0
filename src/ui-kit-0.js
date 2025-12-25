// src/ui-kit-0.js
export const UI_KIT_NAME = "ui-kit";
export const UI_KIT_MAJOR = 0;
export const UI_KIT_MINOR = 1;
export const UI_KIT_PATCH = 0;

export const UI_KIT_VERSION = `${UI_KIT_MAJOR}.${UI_KIT_MINOR}.${UI_KIT_PATCH}`;

export * from "./ui/base.js";
export * from "./ui/layout.js";
export * from "./ui/controls.js";
export * from "./ui/table.js";
export * from "./ui/selection.js";
export * from "./ui/tabs.js";
export * from "./ui/json-editor.js";
export * from "./ui/chart.js";
export * from "./ui/validation.js";
export * from "./ui/store.js";

// src/ui-kit-0.js (am Ende)
export const UI = {
  version: UI_KIT_VERSION,
};