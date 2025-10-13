export default function CustomSecurityCode({label, value, onChange,placeholder}: {label: string; value: string; placeholder:string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;}) {
    return (
        <div className="max-w-[406px]">
            <label htmlFor="Code" className=" text-gray-700  font-medium ">
                {label}
            </label>
            <input
                value={value}
                onChange={onChange}
                type="number"
                id="Date"
                placeholder={placeholder}
                className="border border-gray-300 h-[44px] rounded-md p-2 w-full mt-[12px]"
              
            />
        </div>
    );
}
