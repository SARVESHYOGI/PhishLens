import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Upload', end: true },
    { to: '/investigation', label: 'Investigation' },
    { to: '/evidence', label: 'Evidence' },
    { to: '/report', label: 'Report' },
    { to: '/ioc', label: 'IOC Search' },
    { to: '/history', label: 'History' },
  ];

  return (
    <header className="border-border bg-background/90 sticky top-0 z-50 h-16 border-b backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="from-primary to-primary-dark shadow-glow flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br">
            <Shield className="text-background h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-foreground text-[15px] font-bold tracking-tight">MailSleuth</span>
            <span className="text-primary text-[10px] font-medium tracking-widest uppercase">
              AI
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg p-2 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-border bg-background/95 space-y-1 border-t px-6 py-4 backdrop-blur-xl md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
