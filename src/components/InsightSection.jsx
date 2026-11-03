const InsightSection = ({ kicker, title, text, reverse = false, dark = false, children }) => {
  return (
    <section className={dark ? "bg-[#1c1c1c]" : "bg-[#141414]"}>
      <div className={`mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-20 sm:px-6 lg:gap-16 lg:px-8 
        ${ reverse ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
            
        {/* cột biểu đồ */}
        <div className="w-full lg:w-1/2">{children}</div>

        {/* cột chữ */}
        <div className="w-full lg:w-1/2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#E50914]">
            {kicker}
          </p>
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
          <div className="space-y-3 leading-relaxed text-neutral-400">{text}</div>
        </div>
      </div>
    </section>
  );
}

export default InsightSection;