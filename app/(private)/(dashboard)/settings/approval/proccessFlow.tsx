// components/VerticalArrow.tsx

export  function VerticalArrow() {
  return (
    <div className="flex flex-col items-center">
      {/* Top Arrow */}
      <div className="flex items-center">
        <div className="h-[2px] w-30 bg-gray-400"></div>
        <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-gray-400"></div>
      </div>

      {/* Vertical Line */}
      <section className="flex items-baseline justicy-center">
      <div className="w-[2px] bg-gray-400 h-[250px] mt-[-5px]"></div>

      {/* Bottom Arrow */}
      <div className="flex items-center">
        <div className="h-[2px] w-10 bg-gray-400"></div>
        <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-gray-400"></div>
      </div>
      </section>
    </div>
  );
}
    