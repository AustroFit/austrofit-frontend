// src/lib/design-system/block-styles.js
export function getBlockStyles(block) {

    const sectionClasses = [];
  
  // Background color
  const activeColor = block.background === 'light'
    ? block.background_color_light?.slug
    : block.background_color_dark?.slug;
  
  if (activeColor) {
    sectionClasses.push(`bg-${activeColor}`);
  } else {
    sectionClasses.push('bg-light-grey');
  }
  
  // Text color
  const textColor = block.background === 'dark' 
    ? 'text-white' 
    : 'text-dark-kvb-blue';
  sectionClasses.push(textColor);
  
  // Padding - only if advanced styling enabled 
  if (block.advanced_styling) {
    const paddingTopMap = {
      none: 'pt-0',
      small: 'pt-14',
      standard: 'pt-28',
      large: 'pt-42'
    };
    const paddingBottomMap = {
      none: 'pb-0',
      small: 'pb-14',
      standard: 'pb-28',
      large: 'pb-42'
    };
    
    sectionClasses.push(paddingTopMap[block.padding_top] || paddingTopMap.standard);
    sectionClasses.push(paddingBottomMap[block.padding_bottom] || paddingBottomMap.standard);
  } else {
    sectionClasses.push('py-28'); // Default standard padding
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