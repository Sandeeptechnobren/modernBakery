export default function ContainerCard({ className, padding, margin, children }: { children: React.ReactNode; className?: string; padding?: string; margin?: string }) {
    return (
        <div className={`bg-white text-transform: capitalize border-[#E9EAEB] border-[1px] rounded-[8px] p-[${padding || '20px'}] mb-[${margin || '20px'}]  ${className} overflow-auto`}>
            {children}
        </div>
    );
}