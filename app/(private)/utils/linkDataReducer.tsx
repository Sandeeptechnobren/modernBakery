import { LinkDataType, SidebarDataType } from "../data/dashboardLinks";

export default function LinkDataReducer(
    state: SidebarDataType[],
    action: { type: string; payload: string }
) {
    switch (action.type) {
        case "activate":
            // Return a new state based on the dispatched action
            return state.map((group: SidebarDataType) => ({
                ...group,
                data: group.data.map((link: LinkDataType) => ({
                    ...link,
                    isActive: link.href === action.payload,
                })),
            }));
        default:
            return state;
    }
};