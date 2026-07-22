import {
  Utensils,
  Clapperboard,
  Gift,
  Heart,
  Car,
  Book,
  Check,
  Bolt,
  Flame,
  Zap,
  Lock,
  Trophy,
  Building2,
  Code2,
  Palette,
  Headset,
  TrendingUp,
  User,
  Droplet,
  CircleCheck,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  Ticket,
  Clock,
  Ban,
  Phone,
  Wifi,
  LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  utensils: Utensils,
  clapperboard: Clapperboard,
  gift: Gift,
  heart: Heart,
  car: Car,
  book: Book,
  check: Check,
  bolt: Bolt,
  flame: Flame,
  zap: Zap,
  lock: Lock,
  trophy: Trophy,
  building: Building2,
  code: Code2,
  palette: Palette,
  headset: Headset,
  trending: TrendingUp,
  user: User,
  droplet: Droplet,
  circlecheck: CircleCheck,
  sparkles: Sparkles,
  shieldalert: ShieldAlert,
  shieldcheck: ShieldCheck,
  wallet: Wallet,
  ticket: Ticket,
  clock: Clock,
  ban: Ban,
  phone: Phone,
  wifi: Wifi,
};

export default function Icon({
  name,
  size = 18,
  className,
  color,
}: {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}) {
  const Cmp = map[name] || Gift;
  return <Cmp size={size} className={className} color={color} />;
}
