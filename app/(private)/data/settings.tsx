export const initialSettingsData = {
    layout: {
        dashboard: {
            value: "0",
            options: [
                { label: "Layout 0", value: "0" },
                { label: "Layout 1", value: "1" },
            ],
        }
    },
};

export type SettingsDataType = typeof initialSettingsData;