import { Outlet } from 'react-router';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
