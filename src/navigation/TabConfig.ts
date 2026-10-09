import type { ComponentType } from "react";

import {
  FolderIcon,
  HomeIcon,
  MessageIcon,
  SettingsIcon,
  UploadIcon,
} from "../assets/icons";
import { Strings, TAB_ROUTES, type TabRoute } from "../constants";

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
  { name: TAB_ROUTES.documents, title: Strings.TabBar.documents, Icon: FolderIcon },
  { name: TAB_ROUTES.upload, title: Strings.TabBar.upload, Icon: UploadIcon },
  { name: TAB_ROUTES.messages, title: Strings.TabBar.messages, Icon: MessageIcon },
  { name: TAB_ROUTES.more, title: Strings.TabBar.more, Icon: SettingsIcon },
]);
