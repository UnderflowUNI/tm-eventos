import Link from "next/link";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-contrast font-bold hover:opacity-90 active:opacity-80",
  outline:
    "border border-ink/25 text-ink font-semibold hover:border-accent hover:text-accent",
  ghost: "text-muted font-semibold hover:text-ink",
};

const SIZES: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm min-h-[2.75rem]",
  lg: "px-6 py-3.5 text-base min-h-[3rem]",
};

const BASE =
  "inline-flex items-center justify-center gap-2.5 rounded transition-colors duration-fast ease-base disabled:opacity-40 disabled:cursor-not-allowed";

export function buttonCls(variant: Variant = "primary", size: Size = "md") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]}`;
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${buttonCls(variant, size)} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  href,
  children,
  ...rest
}: CommonProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = `${buttonCls(variant, size)} ${className}`;
  const external = href.startsWith("http");
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
