import type { ProfileMenuId, ProfileMenuTone } from '../../../../constants';
import type { ProfileIconComponent } from '../../ProfileScreenTypes';

export interface ProfileMenuRowProps {
  id: ProfileMenuId;
  title: string;
  tone: ProfileMenuTone;
  Icon: ProfileIconComponent;
  /** Count shown in a grey pill before the chevron. */
  badge?: string;
  /** Draws the hairline above the row (every row but the first). */
  isDivided: boolean;
  /** False while the destination isn't built; the row renders dimmed and ignores presses. */
  isEnabled?: boolean;
  /** Called with the row's `id` when pressed. */
  onPress?: (id: ProfileMenuId) => void;
}
