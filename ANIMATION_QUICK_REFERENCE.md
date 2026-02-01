# Animation & Effects Quick Reference 🎬

## Quick Copy-Paste Patterns

### Interactive Button
```tsx
<motion.button
  className="button-interactive"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Hover Lift Button
```tsx
<motion.button
  className="button-hover-lift"
  whileHover={{ scale: 1.05, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
  whileTap={{ scale: 0.98 }}
>
  Lift on hover
</motion.button>
```

### Staggered List
```tsx
{items.map((item, idx) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 * idx }}
  >
    {item.name}
  </motion.div>
))}
```

### Pulsing Icon
```tsx
<motion.div
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  <Icon className="w-5 h-5" />
</motion.div>
```

### Bounce Entrance
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ 
    type: "spring",
    stiffness: 200,
    damping: 20
  }}
>
  Bouncy content
</motion.div>
```

### Success Checkmark
```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ 
    type: "spring",
    bounce: 0.6
  }}
>
  <Check className="w-6 h-6 text-green-500" />
</motion.div>
```

### Card Hover Effect
```tsx
<motion.div
  className="card-interactive"
  whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)' }}
>
  Card content
</motion.div>
```

### Floating Animation
```tsx
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
>
  Floating content
</motion.div>
```

### Slide In from Left
```tsx
<motion.div
  initial={{ opacity: 0, x: -100 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5 }}
>
  Slide in content
</motion.div>
```

### Confetti Animation
```tsx
{confetti.map((particle) => (
  <motion.div
    key={particle.id}
    initial={{ y: 0, opacity: 1 }}
    animate={{ y: window.innerHeight, opacity: 0, x: particle.x }}
    transition={{ duration: 2, delay: particle.delay }}
  >
    🎉
  </motion.div>
))}
```

---

## CSS Animation Classes

### Utility Classes to Apply
```jsx
// Interactive
className="button-interactive"        // Adds ripple effect
className="button-hover-lift"         // Lifts on hover
className="card-interactive"          // Card elevation

// Animations
className="animate-ripple"            // Click ripple
className="animate-bounce-in"         // Spring entrance
className="animate-slide-in-right"    // Right to left
className="animate-slide-in-left"     // Left to right
className="animate-stagger-fade"      // Fade with movement
className="animate-pulse-subtle"      // Gentle pulse

// Stagger Items
className="stagger-item-1"            // 0.1s delay
className="stagger-item-2"            // 0.2s delay
className="stagger-item-3"            // 0.3s delay
className="stagger-item-4"            // 0.4s delay
className="stagger-item-5"            // 0.5s delay
```

---

## Color Tokens (OKLch)

```css
Primary (Sage):     oklch(0.65 0.18 175)
Success:            oklch(0.7 0.18 145)
Pending:            oklch(0.75 0.12 85)
Warm:               oklch(0.75 0.15 55)
Blue:               oklch(0.65 0.12 220)
Background:         oklch(0.985 0.002 260)
Foreground:         oklch(0.18 0.02 260)
```

---

## Common Transitions

### Smooth Easing
```tsx
transition={{ duration: 0.3, ease: "easeOut" }}
transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}  // Spring
transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
```

### Stagger Timing
```tsx
transition={{ delay: 0.1 * index, duration: 0.4 }}
transition={{ delay: 0.2, staggerChildren: 0.1 }}
```

---

## Animation States

### Button States
```tsx
// Normal
className="p-3 bg-card border-2 border-border"

// Hover
whileHover={{ 
  scale: 1.05,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  borderColor: 'var(--primary)'
}}

// Tap/Press
whileTap={{ scale: 0.95 }}

// Disabled
disabled && className="opacity-50 cursor-not-allowed"
```

---

## Accessibility Best Practices

```tsx
// Respect reduced motion
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ 
    duration: window.matchMedia("(prefers-reduced-motion)").matches ? 0 : 0.3 
  }}
>
  Content
</motion.div>

// Always include ARIA labels
<motion.button aria-label="Close menu" />

// Focus visible
<motion.button className="focus:outline-none focus:ring-2 focus:ring-primary" />
```

---

## Performance Tips

1. **Use transform**: `scale`, `rotate`, `x`, `y` (GPU accelerated)
2. **Avoid animating**: `width`, `height`, `top`, `left` (reflow/repaint)
3. **Batch animations**: Group related motions together
4. **Reduce particles**: Keep confetti under 30 elements
5. **Lazy load**: Don't animate off-screen elements

---

## Common Mistakes to Avoid

❌ **Animating layout properties**
```tsx
// BAD - causes reflow
animate={{ width: "100%" }}

// GOOD - use transform
animate={{ scaleX: 1 }}
```

❌ **Too many simultaneous animations**
```tsx
// BAD - overwhelming
animate={{ scale: 1, rotate: 360, opacity: 1, x: 100 }}

// GOOD - sequence with stagger
transition={{ staggerChildren: 0.1 }}
```

❌ **Missing transition config**
```tsx
// BAD - instant jump
whileHover={{ scale: 1.1 }}

// GOOD - smooth transition
whileHover={{ scale: 1.1 }}
transition={{ duration: 0.3 }}
```

---

## Testing Animations

```jsx
// Disable animations in tests
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  }
}))
```

---

## Resources

- Framer Motion Docs: https://www.framer.com/motion/
- Easing Functions: https://easings.net/
- Color Space: https://oklch.com/
- Accessibility: https://www.a11y-101.com/

---

## Cheat Sheet

| Need | Pattern |
|------|---------|
| Button feedback | `whileTap={{ scale: 0.95 }}` |
| Hover effect | `whileHover={{ scale: 1.05 }}` |
| Entrance animation | `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` |
| Staggered list | `transition={{ delay: idx * 0.1 }}` |
| Pulsing element | `animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }}` |
| Smooth fade | `transition={{ duration: 0.3 }}` |
| Spring effect | `transition={{ type: "spring", stiffness: 200 }}` |
| Ripple effect | `className="button-interactive"` |
| Confetti | Map over array with falling animation |
| Success check | Use `CheckCircle` with scale animation |

---

**Happy Animating!** 🎬✨
