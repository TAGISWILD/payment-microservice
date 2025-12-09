import { createContext, useContext, useState, useCallback } from 'react';

const BackendActivityContext = createContext(null);

export function BackendActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const addActivity = useCallback((activity) => {
    const newActivity = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...activity,
    };
    setActivities((prev) => [...prev, newActivity]);
    return newActivity.id;
  }, []);

  const updateActivity = useCallback((id, updates) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  // Helper to log API calls
  const logApiCall = useCallback(async (method, endpoint, requestBody, apiCall) => {
    const activityId = addActivity({
      type: 'request',
      method,
      endpoint,
      requestBody,
      status: 'pending',
    });

    const startTime = Date.now();

    try {
      const response = await apiCall();
      const duration = Date.now() - startTime;

      updateActivity(activityId, {
        status: 'success',
        responseBody: response,
        duration,
        statusCode: 200,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      updateActivity(activityId, {
        status: 'error',
        error: error.message,
        responseBody: error.response || error.message,
        duration,
        statusCode: error.status || 500,
      });

      throw error;
    }
  }, [addActivity, updateActivity]);

  return (
    <BackendActivityContext.Provider
      value={{
        activities,
        isExpanded,
        setIsExpanded,
        addActivity,
        updateActivity,
        clearActivities,
        logApiCall,
      }}
    >
      {children}
    </BackendActivityContext.Provider>
  );
}

export function useBackendActivity() {
  const context = useContext(BackendActivityContext);
  if (!context) {
    throw new Error('useBackendActivity must be used within BackendActivityProvider');
  }
  return context;
}


