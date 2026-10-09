import { Tabs } from "expo-router/js-tabs";

import { TAB_ICON_SIZE, TABS, useTabScreenOptions } from "../../navigation";

/**
 * Bottom tab navigator for the main app.
 */
export default function TabLayout() {
  const screenOptions = useTabScreenOptions();

  return (
    <Tabs screenOptions={screenOptions}>
      {TABS.map(({ name, title, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Icon color={String(color)} size={TAB_ICON_SIZE} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
