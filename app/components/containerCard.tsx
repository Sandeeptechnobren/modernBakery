export default function ContainerCard({ className, padding, children }: { children: React.ReactNode; className?: string; padding?: string }) {
    return (
        <div className={`bg-white border-[#E9EAEB] border-[1px] rounded-[8px] p-[${padding || '20px'}] mb-[20px] ${className} overflow-auto`}>
            {children}
        </div>
    );
}