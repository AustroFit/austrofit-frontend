export function buildNavigationTree(items) {
  if (!items || !Array.isArray(items)) return [];

  const itemMap = new Map();
  const rootItems = [];
  const trees = {};

  for (const item of items) {
    itemMap.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const mappedItem = itemMap.get(item.id);
    if (item.parent) {
      const parent = itemMap.get(item.parent);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(mappedItem);
      }
    } else {
      const navigation = item.navigation;
      if (!trees[navigation]) trees[navigation] = [];
      trees[navigation].push(mappedItem);
    }
  }
  return trees;
}
