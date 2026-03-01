# Event Banner Specification (1200x660 px)

## Layout (Absolute Positioning)
The export template uses fixed coordinates to ensure consistent rendering across browsers and environments.

### 1. Left Content Area (Common)
- **Background**: Purple-to-White gradient.
- **Logo**: `Top: 40px`, `Left: 40px`, `Height: 48px`.
- **"Zoom Call" text**: `Top: 160px`, `Left: 40px`, `Font: 32px Bold`.
- **Title**: `Top: 200px` approx (relative to Zoom Call), `Font: 36-48px Extra-Bold`.
- **Date/Time**: `Top: 440px`, `Left: 40px`. Includes calendar icon (28px height).
- **Slogan (Bottom)**: `Bottom: 40px`, `Left: 40px`. Words separated by 10px dots.

### 2. Right Content Area (Speaker)
- **Speaker Photo**: Circular, `320px x 320px`, centered vertically at `Top: 50%`.
- **Border**: 4px purple semi-transparent.
- **Name Box**: White background, `Bottom: 24px` relative to photo, centered horizontally with photo.

## Technical Notes
- **html2canvas**: Renders at 2x scale for high resolution (2400x1320 output).
- **Image CrossOrigin**: All images (logo, speaker) must support anonymous CORS.
- **Fonts**: Montserrat and Inter must be loaded in the system.
