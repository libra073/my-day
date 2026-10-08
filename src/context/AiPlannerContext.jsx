import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { processMessage } from '../services/aiPlannerService';
import { generatePlans } from '../services/budgetCalculatorService';
import { useAppContext } from './AppContext';

const STORAGE_KEY = 'myday_ai_planner_v1';

const DEFAULT_CHECKLIST = [
  { id: 'chk-1', task: 'Choose wedding venue (Kumbi)', category: 'venue', completed: false },
  { id: 'chk-2', task: 'Confirm estimated guest count', category: 'general', completed: false },
  { id: 'chk-3', task: 'Select catering service and sample menu', category: 'catering', completed: false },
  { id: 'chk-4', task: 'Select decoration & floral theme (Wapambaji)', category: 'decoration', completed: false },
  { id: 'chk-5', task: 'Hire Master of Ceremonies (MC) & DJ', category: 'entertainment', completed: false },
  { id: 'chk-6', task: 'Book professional wedding photographer & video', category: 'photography', completed: false },
  { id: 'chk-7', task: 'Confirm bridal transport & convoy', category: 'transport', completed: false },
  { id: 'chk-8', task: 'Confirm advance bookings (30% deposit guarantee)', category: 'general', completed: false },
];

const DEFAULT_STATE = {
  messages: [
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Habari! Welcome to MY DAY AI Planner. I can help you plan your wedding or event in Tanzania. Tell me your budget (e.g. 500k, 5m, or TSh 15,000,000), guest count, or location to get a realistic budget plan and verified vendor matches!",
      timestamp: new Date().toISOString(),
    }
  ],
  eventType: 'wedding',
  budget: null,
  guestCount: null,
  location: null,
  eventDate: null,
  language: 'en',
  planType: 'balanced',
  requirements: {},
  budgetPlan: null,
  vendorMatches: null,
  selectedVendors: [],
  checklist: DEFAULT_CHECKLIST,
  timeline: [],
};

const AiPlannerContext = createContext();

export const AiPlannerProvider = ({ children }) => {
  const { wedding } = useAppContext();

  // 1. Initial State Restoration with Corrupted JSON Protection
  const [plannerState, setPlannerState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_STATE,
            ...parsed,
            // ensure essential arrays are always valid arrays
            messages: Array.isArray(parsed.messages) && parsed.messages.length > 0 ? parsed.messages : DEFAULT_STATE.messages,
            checklist: Array.isArray(parsed.checklist) && parsed.checklist.length > 0 ? parsed.checklist : DEFAULT_CHECKLIST,
            selectedVendors: Array.isArray(parsed.selectedVendors) ? parsed.selectedVendors : [],
            timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
          };
        }
      }
    } catch (err) {
      console.warn('Corrupted MY DAY planner state in localStorage, safely resetting to default:', err);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    return DEFAULT_STATE;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync event date or wedding details if available from profile
  useEffect(() => {
    if (wedding?.date && !plannerState.eventDate) {
      setPlannerState(prev => ({ ...prev, eventDate: wedding.date }));
    }
    if (wedding?.location && !plannerState.location) {
      setPlannerState(prev => ({ ...prev, location: wedding.location }));
    }
    if (wedding?.guests && !plannerState.guestCount) {
      setPlannerState(prev => ({ ...prev, guestCount: wedding.guests }));
    }
  }, [wedding, plannerState.eventDate, plannerState.location, plannerState.guestCount]);

  // 2. Persist on any state changes
  useEffect(() => {
    try {
      const stateToSave = {
        messages: plannerState.messages,
        eventType: plannerState.eventType,
        budget: plannerState.budget,
        guestCount: plannerState.guestCount,
        location: plannerState.location,
        eventDate: plannerState.eventDate,
        language: plannerState.language,
        planType: plannerState.planType,
        requirements: plannerState.requirements,
        budgetPlan: plannerState.budgetPlan,
        vendorMatches: plannerState.vendorMatches,
        selectedVendors: plannerState.selectedVendors,
        checklist: plannerState.checklist,
        timeline: plannerState.timeline,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Failed to save planner state to localStorage:', err);
    }
  }, [plannerState]);

  // 3. Clean Context Exposed Functions
  const sendMessage = useCallback(async (userText) => {
    if (!userText || !userText.trim()) return;
    const cleanText = userText.trim();
    setError(null);

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    setPlannerState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
    }));

    setIsLoading(true);

    try {
      // Pass previous context to the business-logic source of truth
      const currentContext = {
        eventType: plannerState.eventType,
        eventDate: plannerState.eventDate,
        budget: plannerState.budget,
        guestCount: plannerState.guestCount,
        location: plannerState.location,
        language: plannerState.language,
        planType: plannerState.planType,
        requirements: plannerState.requirements,
        customAllocations: plannerState.customAllocations,
        removedServices: plannerState.removedServices,
        lastRemoved: plannerState.lastRemoved,
        lastTopic: plannerState.lastTopic,
      };

      const result = await processMessage(currentContext, cleanText);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.message,
        timestamp: new Date().toISOString(),
        actions: result.actions || [],
      };

      setPlannerState(prev => {
        const updated = result.updatedContext || {};
        return {
          ...prev,
          messages: [...prev.messages, aiMsg],
          eventType: updated.eventType || prev.eventType,
          eventDate: updated.eventDate || prev.eventDate,
          budget: updated.budget !== undefined ? updated.budget : prev.budget,
          guestCount: updated.guestCount !== undefined ? updated.guestCount : prev.guestCount,
          location: updated.location !== undefined ? updated.location : prev.location,
          language: updated.language || prev.language,
          planType: updated.planType || prev.planType,
          requirements: updated.requirements || prev.requirements,
          customAllocations: updated.customAllocations || prev.customAllocations,
          removedServices: updated.removedServices || prev.removedServices,
          lastRemoved: updated.lastRemoved || prev.lastRemoved,
          lastTopic: updated.lastTopic || prev.lastTopic,
          budgetPlan: result.plan || prev.budgetPlan,
          vendorMatches: result.vendorMatches || prev.vendorMatches,
        };
      });
    } catch (err) {
      console.error('Error processing AI Planner message:', err);
      setError('An error occurred while analyzing your request. Please try again.');
      const fallbackAiMsg = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "Samahani, kuna hitilafu ya mtandao imetokea. Tafadhali jaribu tena au weka bajeti yako upya.",
        timestamp: new Date().toISOString(),
      };
      setPlannerState(prev => ({
        ...prev,
        messages: [...prev.messages, fallbackAiMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [plannerState]);

  const updateEventDetails = useCallback((details) => {
    setPlannerState(prev => ({
      ...prev,
      ...details,
    }));
  }, []);

  const setLanguage = useCallback((lang) => {
    setPlannerState(prev => ({ ...prev, language: lang }));
  }, []);

  const setPlanType = useCallback((type) => {
    setPlannerState(prev => {
      let newPlan = prev.budgetPlan;
      if (prev.budget) {
        const plans = generatePlans({
          eventType: prev.eventType,
          guestCount: prev.guestCount || 150,
          totalBudget: prev.budget,
          location: prev.location || 'Dar es Salaam',
        });
        if (plans[type]) {
          newPlan = plans[type];
        }
      }
      return { ...prev, planType: type, budgetPlan: newPlan };
    });
  }, []);

  const selectVendor = useCallback((vendor) => {
    if (!vendor || !vendor.id) return;
    setPlannerState(prev => {
      const exists = prev.selectedVendors.some(v => v.id === vendor.id);
      if (exists) return prev;
      return {
        ...prev,
        selectedVendors: [...prev.selectedVendors, vendor],
      };
    });
  }, []);

  const deselectVendor = useCallback((vendorId) => {
    setPlannerState(prev => ({
      ...prev,
      selectedVendors: prev.selectedVendors.filter(v => v.id !== vendorId),
    }));
  }, []);

  const toggleChecklistItem = useCallback((itemId) => {
    setPlannerState(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));
  }, []);

  const resetPlanner = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setPlannerState({
      ...DEFAULT_STATE,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: "Planner reset successfully. How can I help you plan your next event in Tanzania? What is your target budget?",
          timestamp: new Date().toISOString(),
        }
      ],
      selectedVendors: [],
      checklist: DEFAULT_CHECKLIST,
    });
    setError(null);
  }, []);

  const value = {
    ...plannerState,
    isLoading,
    error,
    sendMessage,
    updateEventDetails,
    setLanguage,
    setPlanType,
    selectVendor,
    deselectVendor,
    toggleChecklistItem,
    resetPlanner,
  };

  return (
    <AiPlannerContext.Provider value={value}>
      {children}
    </AiPlannerContext.Provider>
  );
};

export const useAiPlanner = () => {
  const context = useContext(AiPlannerContext);
  if (!context) {
    throw new Error('useAiPlanner must be used within an AiPlannerProvider');
  }
  return context;
};
export default AiPlannerContext;
