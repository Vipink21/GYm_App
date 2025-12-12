# Premium Gym Design System

## Brand Identity

A sophisticated, light-themed design system with gold accents conveying premium quality.

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Gold Primary | `#D4AF37` | CTAs, accents, active states |
| Gold Secondary | `#C8A23F` | Hover states, gradients |
| Gold Light | `#F5E6B8` | Highlights, badges |

### Backgrounds
| Name | Hex | Usage |
|------|-----|-------|
| Off-White | `#FAF7F0` | Page background |
| Card White | `#FFFFFF` | Cards, modals |
| Light Cream | `#FFF9EE` | Sections, hover |

### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| Text Dark | `#222222` | Headlines |
| Text Secondary | `#6D6D6D` | Body text |
| Text Light | `#9A9A9A` | Placeholders |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#2EC97A` | Confirmations |
| Warning | `#F5A623` | Alerts |
| Error | `#FF4D4D` | Errors |
| Info | `#4A90D9` | Information |
| Divider | `#E4DFD2` | Lines, borders |

---

## Typography

### Fonts
- **Headings**: Poppins (SemiBold/Bold)
- **Body**: Inter (Regular/Medium)

### Scale
| Style | Font | Size | Line Height |
|-------|------|------|-------------|
| Display | Poppins Bold | 32px | 40px |
| H1 | Poppins SemiBold | 24px | 32px |
| H2 | Poppins Medium | 20px | 28px |
| H3 | Poppins Medium | 18px | 24px |
| Body | Inter Regular | 16px | 24px |
| Small | Inter Regular | 14px | 20px |
| Caption | Inter Regular | 12px | 16px |

---

## Spacing

Base unit: **4px**

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

---

## Components

### Primary Button
- Height: 54px
- Radius: 14px
- Gradient: `#D4AF37` → `#C8A23F`
- Text: White, Poppins SemiBold 14px
- Shadow: `0 4px 12px rgba(212,175,55,0.25)`

### Secondary Button
- Height: 54px
- Radius: 14px  
- Border: 2px solid `#D4AF37`
- Background: Transparent
- Text: `#D4AF37`

### Cards
- Radius: 18px
- Background: `#FFFFFF`
- Padding: 20px
- Shadow: `0 2px 8px rgba(0,0,0,0.06)`

### Input Fields
- Height: 56px
- Radius: 12px
- Border: 1px `#E4DFD2`
- Focus: 2px `#D4AF37`

### Bottom Navigation
- Height: 80px
- Background: `#FFFFFF`
- Active: Gold icon + dot
- Inactive: `#9A9A9A`

---

## Icons

Use **Lucide Icons** (line style, 1.5px stroke)
Standard size: 24px

---

## Animations

| Type | Duration |
|------|----------|
| Micro | 150ms |
| Standard | 250ms |
| Complex | 350ms |

---

## CSS Variables

```css
:root {
  --color-gold: #D4AF37;
  --color-bg: #FAF7F0;
  --color-card: #FFFFFF;
  --color-text: #222222;
  --color-text-muted: #6D6D6D;
  --radius-lg: 18px;
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06);
}
```
