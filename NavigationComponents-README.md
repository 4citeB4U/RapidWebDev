# Navigation Components

This package contains reusable navigation components for the Rapid Web Development website. These components provide a consistent navigation experience across all pages of the website.

## Components

### CommonHeader

The `CommonHeader` component provides a sticky navigation bar at the top of the page with:

- Main Navigation links
- Resources links
- Contact information
- Back to Top button

### CommonFooter

The `CommonFooter` component provides a comprehensive footer with:

- Company information
- Main Navigation links
- Resources links
- Contact information
- Social media links
- Copyright information

## Usage

To use these components in your React application:

```jsx
import CommonHeader from './CommonHeader';
import CommonFooter from './CommonFooter';

function YourPage() {
  return (
    <>
      <CommonHeader />
      {/* Your page content here */}
      <CommonFooter />
    </>
  );
}
```

## Integration with index.html

To integrate these components into the single-file architecture of `index.html`:

1. Copy the component code into the React components section of your file
2. Add the components to your main App or page components
3. Ensure all necessary icons and styles are included

## Customization

You can customize these components by:

- Modifying the links to point to the correct sections of your website
- Changing the styling to match your brand colors
- Adding or removing sections as needed

## Responsive Design

Both components are fully responsive and will adapt to different screen sizes:

- On mobile devices, the navigation links will stack vertically
- On desktop devices, the navigation links will display horizontally
- The Back to Top button is always accessible

## Accessibility

These components are designed with accessibility in mind:

- All interactive elements are keyboard accessible
- Proper ARIA attributes are used where necessary
- Color contrast meets WCAG standards

## Dependencies

These components use:

- React
- Tailwind CSS for styling
- SVG icons from Lucide React (included inline)
