import { useEffect, useRef } from 'react';

/**
 * Broadcasts a synchronization event to other open tabs on the same origin.
 * @param {string} event - The name of the event (e.g. 'products_updated').
 */
export const broadcastSyncEvent = (event) => {
  try {
    const channel = new BroadcastChannel('sni_cms_sync');
    channel.postMessage({ event });
    channel.close();
  } catch (err) {
    console.error('Failed to broadcast sync event:', err);
  }
};

/**
 * Custom React hook that fetches data on mount, and refetches automatically when:
 * 1. The window gains focus.
 * 2. The document becomes visible (tab switch).
 * 3. A broadcast message matching the specified event types is received.
 * 
 * @param {Function} fetchFunction - The fetch callback (doesn't need memoization).
 * @param {string|string[]} eventType - Event type or array of event types to listen for.
 */
export const useSyncRefetch = (fetchFunction, eventType) => {
  const fetchRef = useRef(fetchFunction);

  // Keep the ref updated with the latest function reference to avoid stale closures
  useEffect(() => {
    fetchRef.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    // Initial fetch
    fetchRef.current();

    // Refetch on focus
    const handleFocus = () => {
      fetchRef.current();
    };
    window.addEventListener('focus', handleFocus);

    // Refetch when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchRef.current();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Refetch on broadcast channel event
    const channel = new BroadcastChannel('sni_cms_sync');
    const handleMessage = (event) => {
      const isMatch = Array.isArray(eventType)
        ? eventType.includes(event.data.event)
        : event.data.event === eventType;

      if (isMatch || event.data.event === 'all_updated') {
        fetchRef.current();
      }
    };
    channel.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [eventType]);
};
