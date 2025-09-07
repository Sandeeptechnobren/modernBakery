import { SettingsDataType } from "../data/settings";

export default function SettingsReducer(state: SettingsDataType, action: { type: string; payload: object }) {
    console.log("hi from settings reducer");
    switch (action.type) {
        case "layoutToggle":
            // Return a new state based on the dispatched action
            return {
                ...state,
                layout: {
                    ...state.layout,
                    dashboard: {
                        ...state.layout.dashboard,
                        value: state.layout.dashboard.value === "0" ? "1" : "0"
                    }
                }
            };
        default:
            return state;
    }
};