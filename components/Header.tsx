import { BrandMark } from './Art';
import ThemeToggle from './ThemeToggle';
import { IMAGES, srcSet } from '@/lib/images';
import { BUSINESS } from '@/lib/site';

export function Brand({ href }: { href: string }) {
  const logo = IMAGES.logo;
  return (
    <a className="brand" href={href} aria-label={`${BUSINESS.name}, ir al inicio`}>
      {logo ? <img src={logo.srcs[0].src} srcSet={srcSet(logo)} sizes="34px" width={34} height={34} alt="" /> : <BrandMark />}
      <b>{BUSINESS.name}</b>
    </a>
  );
}

export default function Header({ children, home = '#' }: { children?: React.ReactNode; home?: string }) {
  return (
    <header className="top">
      <div className="wrap">
        <Brand href={home} />
        <nav aria-label="Secciones">
          {children}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
