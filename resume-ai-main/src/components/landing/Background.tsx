export function Background() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden size-full">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Subtle glow effects */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      
      {/* Animated accent orb */}
      <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-amber-600/10 to-emerald-600/10 rounded-full blur-2xl animate-pulse opacity-40 transform -translate-x-1/2" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  );
}