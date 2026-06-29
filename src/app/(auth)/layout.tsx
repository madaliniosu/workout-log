import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-[#111111] p-20">
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <Image src="/Logo-BeFitus.svg" alt="" width={48} height={48} />
            <span className="font-heading text-[32px] font-extrabold text-white">
              BeFitus
            </span>
          </div>
          <p className="font-heading w-[480px] text-[56px] font-extrabold leading-[1.1] text-white">
            Train smarter. Track better.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex size-[392px] items-center justify-center">
            <div className="rotate-[15deg]">
              <div className="flex size-[320px] rounded-[64px] border-[40px] border-[#c8ff57]">
                <div className="h-full flex-1 rounded-3xl bg-[#c8ff57] opacity-10" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-base text-white opacity-50">
          © {new Date().getFullYear()} Madalin. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-10 items-center justify-center bg-white">
        <div className="lg:hidden flex items-center justify-center">
          <Image src="/Logo-BeFitus.svg" alt="logo" width={90} height={90} />
        </div>
        <div className="w-[400px] pl-2 pr-4">{children}</div>
      </div>
    </div>
  );
}
