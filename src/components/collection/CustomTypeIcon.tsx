import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { IconProps } from "@tabler/icons-react";
import {
  IconStar, IconHeart, IconMusic, IconBook, IconMovie, IconDeviceGamepad2,
  IconCamera, IconCar, IconPlane, IconHome, IconShirt, IconTrophy,
  IconPalette, IconLeaf, IconFlame, IconBolt, IconDiamond, IconCrown,
  IconGlobe, IconPackage,
} from "@tabler/icons-react";

type TablerIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

const ICON_MAP: Record<string, TablerIcon> = {
  star: IconStar,
  heart: IconHeart,
  music: IconMusic,
  book: IconBook,
  movie: IconMovie,
  game: IconDeviceGamepad2,
  camera: IconCamera,
  car: IconCar,
  plane: IconPlane,
  home: IconHome,
  shirt: IconShirt,
  trophy: IconTrophy,
  palette: IconPalette,
  leaf: IconLeaf,
  flame: IconFlame,
  bolt: IconBolt,
  diamond: IconDiamond,
  crown: IconCrown,
  globe: IconGlobe,
  package: IconPackage,
};

interface Props {
  iconName: string;
  size?: number;
  color?: string;
}

export function CustomTypeIcon({ iconName, size = 20, color }: Props) {
  const Icon = ICON_MAP[iconName] ?? IconPackage;
  return <Icon size={size} color={color} />;
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
