'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Video, Menu, X, User, Settings, LogOut, BarChart3, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
export function Header() {
    var _a, _b;
    var session = useSession().data;
    var _c = useState(false), mobileMenuOpen = _c[0], setMobileMenuOpen = _c[1];
    var navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
        { name: 'Jobs', href: '/jobs', icon: FileText },
    ];
    return (<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-primary"/>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SubtitlePro
            </span>
          </Link>

          {/* Desktop Navigation */}
          {session && (<nav className="hidden md:flex items-center space-x-6">
              {navigation.map(function (item) {
                var Icon = item.icon;
                return (<Link key={item.name} href={item.href} className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Icon className="h-4 w-4"/>
                    <span>{item.name}</span>
                  </Link>);
            })}
            </nav>)}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {session ? (<>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-4 w-4"/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {((_a = session.user) === null || _a === void 0 ? void 0 : _a.name) && (<p className="font-medium">{session.user.name}</p>)}
                        {((_b = session.user) === null || _b === void 0 ? void 0 : _b.email) && (<p className="w-[200px] truncate text-sm text-muted-foreground">
                            {session.user.email}
                          </p>)}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4"/>
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4"/>
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onSelect={function () { return signOut({ callbackUrl: '/' }); }}>
                      <LogOut className="mr-2 h-4 w-4"/>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu button */}
                <Button variant="ghost" className="md:hidden" onClick={function () { return setMobileMenuOpen(!mobileMenuOpen); }}>
                  {mobileMenuOpen ? (<X className="h-6 w-6"/>) : (<Menu className="h-6 w-6"/>)}
                </Button>
              </>) : (<div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>)}
          </div>
        </div>

        {/* Mobile Navigation */}
        {session && mobileMenuOpen && (<div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map(function (item) {
                var Icon = item.icon;
                return (<Link key={item.name} href={item.href} className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground" onClick={function () { return setMobileMenuOpen(false); }}>
                    <Icon className="h-4 w-4"/>
                    <span>{item.name}</span>
                  </Link>);
            })}
            </div>
          </div>)}
      </div>
    </header>);
}
//# sourceMappingURL=header.jsx.map