// src/lib/design-system/block-styles.js
export function getBlockStyles(block) {
  const sectionClasses = [];
  
  // Background color (unchanged)
  const activeColor = block.background === 'light'
    ? block.background_color_light?.slug
    : block.background_color_dark?.slug;
  
  if (activeColor) {
    sectionClasses.push(`bg-${activeColor}`);
  } else {
    sectionClasses.push('bg-light-white');
  }
  
  // Text color (unchanged)
  const textColor = block.background === 'dark' 
    ? 'text-white' 
    : 'text-slate-900';
  sectionClasses.push(textColor);
  
  // Spacing - only if advanced styling enabled
  if (block.advanced_styling) {
    const spacingMap = {
      small: 'py-8',
      medium: 'py-12',
      large: 'py-20'
    };
    sectionClasses.push(spacingMap[block.spacing] || spacingMap.medium);
  } else {
    sectionClasses.push('py-12'); // Default medium spacing
  }
  
  // Container width - only if advanced styling enabled
  let containerClass;
  if (block.advanced_styling) {
    const containerMap = {
      standard: 'container-standard',
      wide: 'container-wide',
      narrow: 'container-narrow',
      full: 'container-full'
    };
    containerClass = containerMap[block.content_width] || containerMap.standard;
  } else {
    containerClass = 'container-standard'; // Default standard width
  }
  
  return {
    section: sectionClasses.join(' '),
    container: containerClass
  };
}