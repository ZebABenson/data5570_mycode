import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <Link href="/" className="flex items-center" aria-label="ARLO home">
      <Image
        src="/arlo-logo.png"
        alt="ARLO"
        width={2172}
        height={724}
        className={className}
        priority
      />
    </Link>
  );
}
