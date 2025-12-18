// components/VerticalArrow.tsx

export  function VerticalArrow({rowType,verticalHeight,horizontalHeight,status}: {rowType?:string,verticalHeight?:string,horizontalHeight?:string,status?:string}) {
  return (
    <div className="flex flex-col h-full items-center  justify-center">
      {/* Top Arrow */}
      {rowType === "right" ? (
      <div className="flex items-center">
        <div className="h-[2px] w-[15px] bg-gray-400"></div>
        <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-gray-400"></div>
      </div>
      ):""}
      {rowType === "down" ? (
      <div className="flex flex-col items-center">
  {/* Vertical line */}
  <div className={status == "Completed" || status == "Shipped" ? "w-[2px] h-12 bg-green-400" : "w-[2px] h-12 bg-gray-400"}></div>

  {/* Arrow head */}
  <div className={status == "Completed" || status == "Shipped" ? `w-0 h-0 
    border-l-[6px] border-r-[6px] border-t-[10px]
    border-l-transparent border-r-transparent border-t-green-400` : `w-0 h-0 
    border-l-[6px] border-r-[6px] border-t-[10px]
    border-l-transparent border-r-transparent border-t-gray-400`}>
  </div>
</div>

      ):""}
      {rowType === "top" ? (
      <div className="flex flex-col items-center">
  {/* Vertical line */}
  <div className="w-0 h-0 
    border-l-[6px] border-r-[6px] border-t-[10px]
    border-l-transparent border-r-transparent border-t-gray-400">
  </div>
  <div className="w-[2px] h-12 bg-gray-400"></div>

  {/* Arrow head */}
</div>

      ):""}
        {rowType === "both" ? (
          <div className="items-center">
            <div className="w-0 h-0 
    border-l-[6px] border-r-[6px] border-t-[10px]
    border-l-transparent border-r-transparent border-t-gray-400">
  </div>
      <div className={`w-[2px] bg-gray-400 h-[${verticalHeight}]`}></div>
 <div className="flex items-center">
        <div className="h-[2px] w-21 bg-gray-400"></div>
        <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-gray-400"></div>
      </div>
      <section className="flex items-baseline justicy-center ml-[20px]">
        
      
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
    