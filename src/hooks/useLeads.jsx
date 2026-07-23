import { useState, useEffect, useCallback } from 'react';
import { fetchLeads, checkConnection, deleteLead, logoutAccount, syncScrape, initializeSession, connectCredentials, submitChallenge, connectCookie } from '../api/client';

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadLeads = useCallback(async () => {
    try {
      const data = await fetchLeads();
      if (data.status === 'success') {
        setLeads(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
  }, []);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const data = await checkConnection();
      setIsConnected(data.connected || false);
    } catch (err) {
      setIsConnected(false);
    }
  }, []);

  const addLeads = useCallback(async (keyword, maxPosts, mode, location) => {
    setIsLoading(true);
    
    const pollingTimer = setInterval(async () => {
      console.log("🔄 [POLL] Fetching updated database rows...");
      await loadLeads();
    }, 5000);
    
    window.activePollingTimerKey = pollingTimer;

    try {
      const linkDomain = "https://linkedin.com";
      let linkPath;
      if (mode === 'jobs') {
        linkPath = `/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
      } else {
        linkPath = `/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=CLUSTER_EXPANSION`;
      }
      
      const targetUrl = encodeURIComponent(linkDomain + linkPath);
      
      const res = await syncScrape({ targetUrl, maxPosts, mode });
      
      console.log("🔍 RAW BACKEND RESPONSE:", res);
      
      if (res.status === 'error') {
        alert(res.message);
      } else if (res.message && res.message !== "No jobs found" && res.message !== "No jobs found.") {
        alert(res.message);
      }
      
      await loadLeads();
    } catch (err) {
      console.error("Scraping error:", err);
    } finally {
      if (window.activePollingTimerKey) {
        console.log("🛑 [POLL] Stopping update interval.");
        clearInterval(window.activePollingTimerKey);
      }
      setIsLoading(false);
    }
  }, [loadLeads]);

  const removeLead = useCallback(async (jobTitle, companyName) => {
    try {
      await deleteLead({ jobTitle, companyName });
      await loadLeads();
    } catch (err) {
      alert("Network error processing record deletion.");
    }
  }, [loadLeads]);

  const connectAccount = useCallback(async () => {
    alert("Opening secure authentication view. Please sign in inside the popping automated Chromium view panel.");
    try {
      const res = await initializeSession();
      alert(res.message);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("API gateway exception.");
    }
  }, []);

  const disconnectAccount = useCallback(async () => {
    if (window.confirm("Are you sure you want to disconnect this LinkedIn profile?")) {
      try {
        const res = await logoutAccount();
        alert(res.message);
        window.location.reload();
      } catch (err) {
        alert("Failed to drop saved session profile safely.");
      }
    }
  }, []);

  useEffect(() => {
    Promise.all([loadLeads(), checkConnectionStatus()])
      .finally(() => {
        setInitialLoading(false);
      });
  }, [loadLeads, checkConnectionStatus]);

  return {
    leads,
    isConnected,
    isLoading,
    setIsLoading,
    initialLoading,
    loadLeads,
    addLeads,
    removeLead,
    connectAccount,
    disconnectAccount,
    checkConnectionStatus,
    connectCredentials,
    submitChallenge,
    connectCookie,
  };
}