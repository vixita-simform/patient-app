// Navigation is asserted through these spies; tests set params via useLocalSearchParams.
// useFocusEffect runs its callback like a mount effect (a test screen is always focused).
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    router: {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
      canGoBack: jest.fn(() => true)
    },
    useLocalSearchParams: jest.fn(() => ({})),
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect])
  };
});
