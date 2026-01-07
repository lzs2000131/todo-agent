import { 
  Folder, 
  Briefcase, 
  Home, 
  Book, 
  Target, 
  Lightbulb, 
  Palette, 
  Gamepad2,
  LucideIcon
} from 'lucide-react'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'folder': Folder,
  'work': Briefcase,
  'home': Home,
  'study': Book,
  'target': Target,
  'idea': Lightbulb,
  'art': Palette,
  'game': Gamepad2,
}

export const DEFAULT_ICON = 'folder'

interface CategoryIconProps {
  name?: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function CategoryIcon({ name, size = 16, className, style }: CategoryIconProps) {
  const IconComponent = name && CATEGORY_ICONS[name] ? CATEGORY_ICONS[name] : CATEGORY_ICONS[DEFAULT_ICON]
  return <IconComponent size={size} className={className} style={style} />
}
