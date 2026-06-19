export default function SplashPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F1A] px-6 text-center">
      <div className="mb-6">
        <h1 className="text-5xl font-medium tracking-tight text-[#F5F3ED]">
          i<span className="text-[#C9A84C]">Vest</span>
        </h1>
      </div>

      <p className="text-[#A8A6B8] text-sm md:text-base max-w-md mb-12">
        A global, verified investment ecosystem connecting investors and
        builders — securely, across borders.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button className="flex-1 bg-[#C9A84C] text-[#1A1A2E] font-medium text-sm py-3 rounded-lg hover:opacity-90 transition">
          Get Started
        </button>
        <button className="flex-1 border border-[#3A3A52] text-[#F5F3ED] font-medium text-sm py-3 rounded-lg hover:bg-[#1A1A2E] transition">
          Log In
        </button>
      </div>

      <p className="text-[#5C5A70] text-xs mt-10">
        Trusted · Verified · Borderless
      </p>
    </main>
  );
}