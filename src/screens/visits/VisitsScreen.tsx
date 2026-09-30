import type { ReactElement } from "react";

import FindADoctorScreen from "../find-a-doctor/FindADoctorScreen";

/**
 * Visits tab: the Find a doctor screen embedded as the tab root.
 * No back button here — a tab root has nothing to go back to.
 * @returns {ReactElement} A React Element.
 */
export default function VisitsScreen(): ReactElement {
  return <FindADoctorScreen showBackButton={false} />;
}
