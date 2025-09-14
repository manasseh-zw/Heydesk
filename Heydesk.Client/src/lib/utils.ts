import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Clear authentication cookies from the browser
 * This is useful when authorization fails to prevent stale cookies
 */
export function clearAuthCookies() {
  const cookiesToClear = [
    'access_token',
    'customer_access_token'
  ];
  
  cookiesToClear.forEach(cookieName => {
    // Clear cookie for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    // Clear cookie for parent domain (in case of subdomains)
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    // Clear cookie for root domain
    const domainParts = window.location.hostname.split('.');
    if (domainParts.length > 1) {
      const rootDomain = domainParts.slice(-2).join('.');
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${rootDomain}`;
    }
  });
}
