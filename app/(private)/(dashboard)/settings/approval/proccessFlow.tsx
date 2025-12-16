// components/VerticalArrow.tsx

export  function VerticalArrow({rowType,verticalHeight,horizontalHeight}: {rowType?:string,verticalHeight?:string,horizontalHeight?:string}) {
  return (
    <div className="flex flex-col h-full items-center mt-20">
      {/* Top Arrow */}
      {rowType === "right" ? (
      <div className="flex items-center">
        <div className="h-[2px] w-21 bg-gray-400"></div>
        <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-gray-400"></div>
      </div>
      ):""}
        {rowType === "both" ? (
          <div className="items-center">
 <div className="flex items-center">
        <div className="h-[2px] w-21 bg-gray-400"></div>
        <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-gray-400"></div>
      </div>
      <section className="flex items-baseline justicy-center ml-[20px]">
        
      <div className={`w-[2px] bg-gray-400 h-[${verticalHeight}]  mt-[-5px]`}></div>
      
      <div className="flex items-center">
        <div className="h-[2px] w-16 bg-gray-400"></div>
        <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-gray-400"></div>
      </div>
      </section>
      </div>
        ):""}
    </div>
  );
}
    