"use client";

export default function Toggle({
    label,
    isChecked,
    onChange,
}: {
    label?: string;
    isChecked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <label className="inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="peer invisible"
                checked={isChecked}
                onChange={onChange}
            />
            <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#12B76A] dark:peer-checked:bg-[#12B76A]`}></div>
            {label && (
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {label}
                </span>
            )}
        </label>
    );
}
