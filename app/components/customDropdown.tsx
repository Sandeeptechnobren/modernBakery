export default function CustomDropdown({ children }: { children ?: React.ReactNode }) {
    return (
        <div className={`rounded-[8px] border-[1px] border-[#E9EAEB] bg-white py-[4px] w-full`}>
            {children}
        </div>
    )
}