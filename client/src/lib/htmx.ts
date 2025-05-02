// Function to load HTMX on the client side
export const loadHtmx = () => {
  if (typeof window !== 'undefined') {
    // Dynamically import HTMX
    import('htmx.org').then((htmx) => {
      // Make HTMX available globally for debugging
      (window as any).htmx = htmx.default;
      
      // Initialize HTMX
      document.addEventListener('DOMContentLoaded', () => {
        htmx.default.process(document.body);
      });
      
      // Process HTMX on any new content
      htmx.default.process(document.body);
    });
  }
};