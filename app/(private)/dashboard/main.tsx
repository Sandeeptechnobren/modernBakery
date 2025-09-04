export default function Main({horizontalSidebar, children}: {horizontalSidebar: boolean, children: React.ReactNode}){
    return (
        <div className={`flex peer-hover:ml-[250px] ${horizontalSidebar ? "mt-[104px] ml-0 w-full h-[calc(100%-60px-44px)]" : "mt-[60px] ml-[80px] w-[calc(100%-80px)] h-[calc(100%-60px)]"} transition-all duration-300 ease-in-out`}>
            <div className="p-[20px] pb-[22px] w-full h-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}