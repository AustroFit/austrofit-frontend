// src/lib/design-system/block-styles.js
// Tailwind safelist: dynamic bg classes generated from Directus color slugs
// bg-darkblue bg-white bg-light-grey bg-beige bg-dark-blue-1 bg-light-blue-1
// text-dark-kvb-blue text-white

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

  // Padding – always applied (advanced_styling field does not exist in Directus)
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

  sectionClasses.push(paddingTopMap[block.padding_top] || 'py-28');
  if (block.padding_top) {
    // padding_top was set, also apply padding_bottom separately
    sectionClasses.push(paddingBottomMap[block.padding_bottom] || 'pb-28');
  }

  // Container width – always applied
  const containerMap = {
    standard: 'container-standard',
    wide: 'container-wide',
    narrow: 'container-narrow',
    full: 'container-full',
    very_small: 'container-narrow'
  };
  const containerClass = containerMap[block.content_width] || 'container-standard';

  return {
    section: sectionClasses.join(' '),
    container: containerClass
  };
}
