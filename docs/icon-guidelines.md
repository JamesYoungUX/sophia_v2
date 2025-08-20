# Icon Usage Guidelines

## Overview

This project uses **lucide-react** exclusively for all icons to maintain consistency, performance, and a cohesive visual design. No full-color icons or other icon libraries should be used.

## Why Lucide-React?

- **Consistency**: All icons follow the same design language
- **Performance**: Lightweight SVG icons with tree-shaking support
- **Accessibility**: Built-in accessibility features
- **Customization**: Easy to style with CSS/Tailwind classes
- **No Color**: Monochrome icons that adapt to theme colors

## Installation

Lucide-react is already installed in the project:

```json
// packages/ui/package.json
"lucide-react": "^0.539.0"

// apps/app/package.json  
"lucide-react": "^0.539.0"
```

## Usage

### Basic Import and Usage

```tsx
import { Home, Settings, Users, Activity } from "lucide-react";

function Navigation() {
  return (
    <nav>
      <Home className="w-5 h-5" />
      <Settings className="w-5 h-5" />
      <Users className="w-5 h-5" />
      <Activity className="w-5 h-5" />
    </nav>
  );
}
```

### Styling with Tailwind

```tsx
// Size variants
<Icon className="w-4 h-4" />     // Small
<Icon className="w-5 h-5" />     // Default
<Icon className="w-6 h-6" />     // Large
<Icon className="w-8 h-8" />     // Extra large

// Color variants
<Icon className="text-muted-foreground" />
<Icon className="text-primary" />
<Icon className="text-destructive" />
<Icon className="text-success" />

// Interactive states
<Icon className="hover:text-primary transition-colors" />
<Icon className="group-hover:text-accent-foreground" />
```

### Common Patterns

```tsx
// Button with icon
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Add Item
</Button>

// Icon-only button
<Button variant="ghost" size="icon">
  <Settings className="w-4 h-4" />
</Button>

// Navigation item
<Link className="flex items-center gap-2">
  <Home className="w-5 h-5" />
  Dashboard
</Link>
```

## Configuration

The project is configured to use lucide as the default icon library:

```json
// components.json
{
  "iconLibrary": "lucide"
}
```

## Prohibited Practices

❌ **DO NOT** use other icon libraries:
```tsx
// ❌ Don't do this
import { FaHome } from "react-icons/fa";
import { HomeIcon } from "@heroicons/react/24/outline";
```

❌ **DO NOT** use full-color icons or images as icons:
```tsx
// ❌ Don't do this
<img src="/icons/colorful-icon.png" alt="Icon" />
```

❌ **DO NOT** use emoji as functional icons:
```tsx
// ❌ Don't do this
<span>🏠</span> // Use <Home /> instead
```

## Approved Practices

✅ **DO** use lucide-react icons:
```tsx
// ✅ Correct
import { Home, Settings, User } from "lucide-react";
```

✅ **DO** use consistent sizing:
```tsx
// ✅ Correct - consistent sizing
<Home className="w-5 h-5" />
<Settings className="w-5 h-5" />
```

✅ **DO** use semantic icon names:
```tsx
// ✅ Correct - semantic and clear
<Trash2 className="w-4 h-4" />        // For delete actions
<Edit className="w-4 h-4" />          // For edit actions
<Eye className="w-4 h-4" />           // For view actions
```

## Available Icons

Lucide provides 1000+ icons. Common categories include:

- **Navigation**: Home, Menu, ChevronDown, ArrowLeft
- **Actions**: Plus, Minus, Edit, Trash2, Save
- **Status**: Check, X, AlertCircle, Info
- **Media**: Play, Pause, Volume2, Image
- **Communication**: Mail, Phone, MessageCircle
- **Files**: File, Folder, Download, Upload

Browse all available icons at: https://lucide.dev/icons/

## Logo and Branding

For logos and branding elements:
- Use simple SVG graphics based on lucide icons when possible
- Maintain monochrome design (no full-color logos)
- Current project logos use the `Zap` icon as a base

## Maintenance

- Keep lucide-react updated to the latest version
- Regularly audit the codebase for non-lucide icon usage
- When adding new features, always check lucide first for appropriate icons
- If a specific icon isn't available in lucide, consider using a similar one or creating a custom SVG based on lucide's design principles

## Questions?

If you need an icon that doesn't exist in lucide-react:
1. Check if there's a similar icon that could work
2. Consider if the functionality really needs an icon
3. Create a custom SVG following lucide's design principles (24x24 viewBox, 2px stroke width, rounded line caps)
4. Document any custom icons in this file