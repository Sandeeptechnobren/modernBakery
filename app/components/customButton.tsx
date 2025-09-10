const Button = ({ onClick, children }: { onClick: (event: React.FormEvent) => void; children: React.ReactNode }) => {
    return (
        <button className="rounded-lg bg-[#EA0A2A] text-white w-full px-4 py-[10px] cursor-pointer" onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;
