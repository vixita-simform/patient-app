import type { ComponentType } from 'react';

import { CalendarIcon, FileIcon, HomeIcon, UserIcon } from '../assets/icons';
import { Strings, TAB_ROUTES, type TabRoute } from '../constants';

export interface TabIconProps {
  size?: number;
  color?: string;
}

export interface TabConfig {
  name: TabRoute;
  title: string;
  Icon: ComponentType<TabIconProps>;
}

export const TABS: readonly TabConfig[] = Object.freeze([
  { name: TAB_ROUTES.home, title: Strings.TabBar.home, Icon: HomeIcon },
  { name: TAB_ROUTES.visits, title: Strings.TabBar.visits, Icon: CalendarIcon },
  { name: TAB_ROUTES.records, title: Strings.TabBar.records, Icon: FileIcon },
  { name: TAB_ROUTES.profile, title: Strings.TabBar.profile, Icon: UserIcon }
]);
