import { SettingsDataType } from "../data/settings";

type Action = {
  type: string;
  payload?: { [key: string]: string };
};

export default function SettingsReducer(
  state: SettingsDataType,
  action: Action
): SettingsDataType {
  switch (action.type) {
    case "layoutToggle":
      return {
        ...state,
        layout: {
          ...state.layout,
          dashboard: {
            ...state.layout.dashboard,
            value: state.layout.dashboard.value === "0" ? "1" : "0",
          },
        },
      };
      case "themeChange":
      return {
        ...state,
        theme: action.payload?.theme || state.theme,
      };


    default:
      return state;
  }
}
