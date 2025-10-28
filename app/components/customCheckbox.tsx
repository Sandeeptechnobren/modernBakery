export default function CustomCheckbox({
    id,
    label,
    checked,
    indeterminate = false,
    disabled,
    width,
    onChange,
}: {
    id?: string;
    label: string | React.ReactNode;
    checked: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    width?: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    const checkboxClass = `relative flex items-center justify-center w-[20px] h-[20px] cursor-pointer rounded-[6px] transition-all duration-200 ease-in-out ${
        checked || indeterminate
            ? "border-[1px] border-[#EA0A2A] bg-[#FFF0F2]"
            : "border-[1px] border-[#D5D7DA]"
    }`;

    const icon = indeterminate ? (
        // minus svg
        <svg 
        className="w-3 h-[2px] bg-[#EA0A2A]"
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 12a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1"/></svg>
    ) : (
        // check svg
        <svg
            className={`w-3 h-3 text-[#EA0A2A] transition-opacity duration-200 ease-in-out ${
                checked ? "opacity-100" : "opacity-0"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
        >
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                d="M20 6L9 17l-5-5"
            />
        </svg>
    );

    return (
        <div className={`flex items-center ${label && "gap-3"}`}>
            <input
                type="checkbox"
                id={id}
                checked={checked || indeterminate}
                onChange={onChange}
                className="peer hidden"
                disabled={disabled}
            />
            <label htmlFor={id} className={checkboxClass}>
                {" "}
                {icon}{" "}
            </label>
            <label
                htmlFor={id}
                className="text-gray-700 select-none cursor-pointer"
            >
                {label}
            </label>
        </div>
    );
}
