"use client";
import { ActionDispatch, createContext, useReducer, useState } from "react";
import SettingsReducer from "../utils/settingsReducer";
import { initialSettingsData, SettingsDataType } from "../data/settings";

export interface SettingsContextValue {
  settings: SettingsDataType;
  dispatchSettings: ActionDispatch<[action: { type: string; payload: object; }]>;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export default function Contexts({ children }: { children: React.ReactNode }) {
    const [settings, dispatchSettings] = useReducer(
        SettingsReducer,
        initialSettingsData
    );

    return (
        <SettingsContext.Provider value={{ settings, dispatchSettings }}>
                {children}
        </SettingsContext.Provider>
    );
}
