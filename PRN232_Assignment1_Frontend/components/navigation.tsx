'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Package, Home, Menu, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const navItems = [
    {
      href: '/',
      label: 'Trang chủ',
      icon: Home,
    },
    {
      href: '/products',
      label: 'Sản phẩm',
      icon: Package,
    },
  ];

  return (
    <nav className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="text-lg sm:text-xl font-bold hover:text-primary transition-colors">
              Cửa hàng
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'flex items-center gap-2 transition-colors rounded-lg',
                        isActive 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'hover:bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Right side - Auth buttons or user menu */}
          <div className="flex items-center space-x-2">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Link href="/cart">
                      <Button variant="ghost" size="sm">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </Link>
                    <UserMenu />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Cửa hàng</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 flex flex-col gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                      return (
                        <Link 
                          key={item.href} 
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button
                            variant={isActive ? 'default' : 'ghost'}
                            className={cn(
                              'w-full justify-start gap-2 rounded-lg',
                              isActive 
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                : 'hover:bg-accent'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Button>
                        </Link>
                      );
                    })}
                    <div className="pt-2 border-t">
                      {!loading && (
                        user ? (
                          <div className="flex items-center gap-2">
                            <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button variant="ghost" size="sm" className="w-full justify-start">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Cart
                              </Button>
                            </Link>
                            <UserMenu />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                            </Link>
                            <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button size="sm" className="w-full">Sign Up</Button>
                            </Link>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        {/* Mobile menu handled by Sheet */}
      </div>
    </nav>
  );
}
