"use client";

export function TickerBar() {
  const text =
    "ONE SHOWER AT A TIME \u2022 HOT WATER IS PRECIOUS \u2022 RESPECT THE QUEUE \u2022 NO COLD SHOWERS \u2022 ";
  return (
    <div className="brutal-card-sm bg-[#1a1a1a] text-[#F5F0E8] overflow-hidden rounded-xl py-2 mb-6">
      <div className="marquee whitespace-nowrap font-mono text-xs font-bold uppercase tracking-widest">
        <span>{text.repeat(4)}</span>
      </div>
    </div>
  );
}
