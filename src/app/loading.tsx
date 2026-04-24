export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 relative">
          <div
            className="absolute inset-0 rounded-full border-2 border-[#1e3a5f]/50"
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"
          />
        </div>
        <p className="text-xs text-[#4a5e78] font-medium tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
}
