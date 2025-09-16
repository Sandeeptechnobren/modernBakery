// data/settings.ts
export const initialSettingsData = {
  layout: {
    dashboard: {
      value: "0",
      horizontalSidebar: false
    },
  },
  theme: "layoutTheme"
};

export type SettingsDataType = typeof initialSettingsData;
