# Design System Quick Reference

**Premium Gym Admin Dashboard - Gold Theme**

---

## 🎨 Color Palette

### **Primary Colors**
```css
--color-gold-primary: #D4AF37    /* Main brand gold */
--color-gold-secondary: #C8A23F  /* Hover states */
--color-gold-light: #F5E6B8      /* Backgrounds */
--color-gold-hover: #B8982F      /* Active states */
```

### **Semantic Colors**
```css
--color-success: #2EC97A         /* Green - positive actions */
--color-success-light: #E8F8F0   /* Success backgrounds */

--color-warning: #F5A623         /* Orange - caution */
--color-warning-light: #FEF6E7   /* Warning backgrounds */

--color-error: #FF4D4D           /* Red - errors/delete */
--color-error-light: #FFEBEB     /* Error backgrounds */

--color-info: #4A90D9            /* Blue - information */
--color-info-light: #EBF3FC      /* Info backgrounds */
```

### **Neutral Colors**
```css
--color-text-primary: #222222    /* Main text */
--color-text-secondary: #6D6D6D  /* Subtitles */
--color-text-muted: #9A9A9A      /* Hints, placeholders */
--color-text-inverse: #FFFFFF    /* Text on dark backgrounds */

--color-bg-primary: #FAF7F0      /* Page background */
--color-bg-card: #FFFFFF         /* Card backgrounds */
--color-bg-cream: #FFF9EE        /* Subtle highlights */
--color-bg-sidebar: #FFFFFF      /* Sidebar background */

--color-border: #E4DFD2          /* Default borders */
--color-border-light: #F0EBE0    /* Subtle dividers */
```

---

## 📏 Spacing Scale

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

**Usage Examples**:
```css
padding: var(--space-4);           /* 16px padding */
margin-bottom: var(--space-8);     /* 32px bottom margin */
gap: var(--space-6);               /* 24px gap in flexbox */
```

---

## 🔤 Typography

### **Font Families**
```css
--font-heading: 'Poppins', sans-serif  /* Bold, impactful */
--font-body: 'Inter', sans-serif       /* Clean, readable */
```

### **Font Sizes**
```css
--text-xs: 0.75rem    /* 12px - badges, hints */
--text-sm: 0.875rem   /* 14px - body text, labels */
--text-base: 1rem     /* 16px - default */
--text-lg: 1.125rem   /* 18px - subtitles */
--text-xl: 1.25rem    /* 20px - section titles */
--text-2xl: 1.5rem    /* 24px - page subtitles */
--text-3xl: 1.875rem  /* 30px - page titles */
--text-4xl: 2.25rem   /* 36px - hero text */
```

### **Font Weights**
- **400**: Normal body text
- **600**: Headings, labels
- **700**: Section titles, buttons
- **800**: Page titles, emphasis

---

## 🔘 Border Radius

```css
--radius-sm: 0.5rem    /* 8px - small elements */
--radius-md: 0.75rem   /* 12px - inputs, cards */
--radius-lg: 1rem      /* 16px - large cards */
--radius-xl: 1.25rem   /* 20px - modals */
--radius-full: 9999px  /* Fully rounded (pills) */
```

---

## 🌟 Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08)
--shadow-gold: 0 4px 12px rgba(212, 175, 55, 0.25)
```

**When to Use**:
- `sm`: Subtle elevation (inputs)
- `md`: Cards, dropdowns
- `lg`: Modals, hover states
- `gold`: Premium elements, CTAs

---

## ⏱️ Transitions

```css
--transition-fast: 150ms ease-out      /* Quick interactions */
--transition-normal: 250ms ease-in-out /* Standard animations */
--transition-slow: 350ms ease-in-out   /* Smooth, noticeable */
```

**Usage**:
```css
transition: all var(--transition-fast);
transition: color var(--transition-normal);
```

---

## 🎭 Animations

### **Fade In** (Page Load)
```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.page {
    animation: fadeIn var(--transition-normal);
}
```

### **Slide In** (Cards)
```css
@keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
}

.card {
    animation: slideIn var(--transition-slow);
}
```

### **Hover Effects**
```css
.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.button:hover {
    background: var(--color-gold-hover);
    transform: scale(1.02);
}
```

---

## 🧩 Component Patterns

### **Premium Input**
```html
<div class="premium-form-group">
    <label class="premium-label">
        <Icon size={16} /> Label Text
    </label>
    <input 
        type="text" 
        class="premium-input" 
        placeholder="Placeholder..."
    />
</div>
```

**Styles**:
```css
.premium-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.premium-input {
    width: 100%;
    height: 48px;
    padding: 12px 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    transition: all var(--transition-fast);
}

.premium-input:focus {
    outline: none;
    border-color: var(--color-gold-primary);
    box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
    transform: translateY(-1px);
}
```

### **Badge**
```html
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Failed</span>
```

**Styles**:
```css
.badge {
    font-size: var(--text-xs);
    font-weight: 700;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: var(--radius-full);
}

.badge-success {
    background: var(--color-success-light);
    color: var(--color-success);
}
```

### **Card**
```html
<Card padding="lg">
    <CardHeader title="Section Title" />
    <!-- Content -->
</Card>
```

**Styles**:
```css
.card {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
}

.card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## ✅ Best Practices

### **DO**:
- ✅ Use CSS variables for all colors, spacing, and typography
- ✅ Apply consistent hover states (gold glow, slight lift)
- ✅ Add smooth transitions (150-350ms)
- ✅ Use semantic color names (success, error, warning)
- ✅ Maintain 4px spacing grid
- ✅ Use Poppins for headings, Inter for body

### **DON'T**:
- ❌ Hardcode colors like `#FF0000`
- ❌ Use arbitrary spacing like `padding: 17px`
- ❌ Mix font families randomly
- ❌ Forget focus states on interactive elements
- ❌ Use transitions longer than 500ms
- ❌ Ignore hover states on clickable elements

---

## 🎯 Quick Copy-Paste Snippets

### **Page Container**
```css
.page {
    padding: var(--space-8);
    max-width: 1400px;
    margin: 0 auto;
    animation: fadeIn var(--transition-normal);
}
```

### **Section Header**
```css
.header {
    margin-bottom: var(--space-10);
}

.title {
    font-size: var(--text-3xl);
    font-weight: 800;
    color: var(--color-text-primary);
    font-family: var(--font-heading);
}

.subtitle {
    color: var(--color-text-secondary);
    font-size: var(--text-lg);
}
```

### **Action Button**
```css
.actionBtn {
    padding: var(--space-3) var(--space-6);
    background: var(--color-gold-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.actionBtn:hover {
    background: var(--color-gold-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-gold);
}
```

---

**Last Updated**: December 20, 2025  
**Version**: 1.0  
**Maintained by**: Development Team
