export function getCDNBase() {
  if (typeof window !== 'undefined' && window.__RUNTIME_ENV__) {
    return window.__RUNTIME_ENV__.NEXT_PUBLIC_CDN_BASE || 'https://cdn.example.com';
  }
  return 'https://cdn.example.com';
}

export function getCDNUrl(path) {
  const base = getCDNBase();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${cleanPath}`;
}

export function getMapImageUrl(index) {
  return getCDNUrl(`/mapban/ssbu/maps/image${index}.jpg`);
}

export function getIconUrl(iconName) {
  return getCDNUrl(`/mapban/ssbu/icons/${iconName}`);
}

