import { useRequest } from 'ahooks';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Building2,
  Users,
  LogOut,
  Bed,
  HandPlatter,
  BookOpenCheck,
} from 'lucide-react';

import { logoutService } from '@/services/auth';
import { cn } from '@/lib/utils';
import { useBreadcrumbStore } from '@/stores/breadcrumbs/useBreadcrumbStore';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Text } from '@/components/ui/text';
import { ROUTE_PATH } from '@/routes/route.constant';
import { useAuth } from '@/stores/auth/useAuth';
import { useTheme } from '@/components/Theme/theme-provider';

export const adminItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: ROUTE_PATH.DASHBOARD },
  { icon: GitBranch, label: 'Chi nhánh', to: ROUTE_PATH.BRANCH },
  { icon: Building2, label: 'Khách sạn', to: ROUTE_PATH.HOTEL },
  { icon: HandPlatter, label: 'Tiện ích', to: ROUTE_PATH.AMENITY },
  { icon: Users, label: 'Người dùng', to: ROUTE_PATH.USER },
  { icon: BookOpenCheck, label: 'Đơn đặt phòng', to: ROUTE_PATH.BOOKING },
];

export const staffItems = [{ icon: Bed, label: 'Phòng', to: ROUTE_PATH.ROOMS }];

const logo = {
  light: '/logos/logo-large-light.png',
  dark: '/logos/logo-large-dark.png',
};

interface SidebarProps {
  isAdmin: boolean;
}

export function Sidebar({ isAdmin }: Readonly<SidebarProps>) {
  const { onLogout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  const navigate = useNavigate();
  const { onNavigate } = useBreadcrumbStore((state) => state);

  const { run: handleLogout } = useRequest(logoutService, {
    manual: true,
    onSuccess: () => {
      onLogout();
    },
    onError: () => {
      toast.error('Đăng xuất thất bại. Có lỗi xảy ra');
    },
  });

  const logoSrc = theme === 'light' ? logo.dark : logo.light;

  return (
    <ShadcnSidebar>
      <SidebarHeader className='flex items-center justify-center py-5'>
        <img title='logo' alt='logo' src={logoSrc} className='h-10 w-auto' />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {(isAdmin ? adminItems : staffItems).map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    className={cn(
                      'py-3 h-auto',
                      location.pathname.includes(item.to) && 'bg-sidebar-accent',
                    )}
                    onClick={() => onNavigate(item.to, 0, navigate)}
                  >
                    <div className='flex items-center gap-3'>
                      <item.icon className='h-5 w-5' />
                      <Text type='title1-semi-bold' className='!font-medium'>
                        {item.label}
                      </Text>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className='mt-auto'>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className='h-5 w-5' />
                  <Text type='title1-semi-bold' className='!font-medium'>
                    Logout
                  </Text>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </ShadcnSidebar>
  );
}
