import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  emotion?: string;
  timestamp: string;
  conversationTitle: string;
  relevanceScore: number;
}

export interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  emotion?: string;
  role?: 'user' | 'assistant';
  conversationType?: 'text' | 'voice' | 'mixed';
}

export const useConversationSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { toast } = useToast();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('zoxaa-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 10);
      localStorage.setItem('zoxaa-recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Search conversations
  const searchConversations = useCallback(async (query: string, searchFilters: SearchFilters = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    saveRecentSearch(query);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to search your conversations.",
          variant: "destructive"
        });
        return;
      }

      // Build the search query
      let supabaseQuery = supabase
        .from('messages')
        .select(`
          id,
          content,
          role,
          emotion_data,
          created_at,
          conversation_id,
          conversations!inner(
            title,
            type,
            user_id
          )
        `)
        .eq('conversations.user_id', user.id)
        .ilike('content', `%${query}%`);

      // Apply filters
      if (searchFilters.dateRange) {
        supabaseQuery = supabaseQuery
          .gte('created_at', searchFilters.dateRange.start.toISOString())
          .lte('created_at', searchFilters.dateRange.end.toISOString());
      }

      if (searchFilters.emotion) {
        supabaseQuery = supabaseQuery.contains('emotion_data', { primaryEmotion: searchFilters.emotion });
      }

      if (searchFilters.role) {
        supabaseQuery = supabaseQuery.eq('role', searchFilters.role);
      }

      if (searchFilters.conversationType) {
        supabaseQuery = supabaseQuery.eq('conversations.type', searchFilters.conversationType);
      }

      // Execute search
      const { data, error } = await supabaseQuery
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Failed",
          description: "Failed to search conversations. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Process and rank results
      const processedResults: SearchResult[] = (data || []).map((item: any) => {
        const emotionData = item.emotion_data || {};
        const conversation = item.conversations;
        
        // Simple relevance scoring based on query match
        const contentLower = item.content.toLowerCase();
        const queryLower = query.toLowerCase();
        let relevanceScore = 0;
        
        // Exact phrase match
        if (contentLower.includes(queryLower)) {
          relevanceScore += 10;
        }
        
        // Word matches
        const queryWords = queryLower.split(' ').filter(word => word.length > 2);
        queryWords.forEach(word => {
          if (contentLower.includes(word)) {
            relevanceScore += 2;
          }
        });
        
        // Recency bonus
        const daysAgo = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysAgo < 7) relevanceScore += 1;
        if (daysAgo < 30) relevanceScore += 0.5;

        return {
          id: item.id,
          conversationId: item.conversation_id,
          content: item.content,
          role: item.role,
          emotion: emotionData.primaryEmotion,
          timestamp: item.created_at,
          conversationTitle: conversation.title,
          relevanceScore
        };
      });

      // Sort by relevance score
      processedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setSearchResults(processedResults);

      if (processedResults.length === 0) {
        toast({
          title: "No Results Found",
          description: "Try adjusting your search terms or filters.",
        });
      }

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [saveRecentSearch, toast]);

  // Semantic search using embeddings (if available)
  const semanticSearch = useCallback(async (query: string, searchFilters: SearchFilters = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    saveRecentSearch(query);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to search your conversations.",
          variant: "destructive"
        });
        return;
      }

      // For now, use full-text search with PostgreSQL
      // In the future, this could use embeddings for semantic search
      const { data, error } = await supabase
        .rpc('search_messages', {
          search_query: query,
          user_id_param: user.id,
          emotion_filter: searchFilters.emotion || null,
          role_filter: searchFilters.role || null,
          type_filter: searchFilters.conversationType || null,
          date_start: searchFilters.dateRange?.start?.toISOString() || null,
          date_end: searchFilters.dateRange?.end?.toISOString() || null
        });

      if (error) {
        console.error('Semantic search error:', error);
        // Fallback to regular search
        await searchConversations(query, searchFilters);
        return;
      }

      const processedResults: SearchResult[] = (data || []).map((item: any) => ({
        id: item.id,
        conversationId: item.conversation_id,
        content: item.content,
        role: item.role,
        emotion: item.emotion_data?.primaryEmotion,
        timestamp: item.created_at,
        conversationTitle: item.conversation_title,
        relevanceScore: item.similarity || 0
      }));

      setSearchResults(processedResults);

    } catch (error) {
      console.error('Semantic search error:', error);
      // Fallback to regular search
      await searchConversations(query, searchFilters);
    } finally {
      setIsSearching(false);
    }
  }, [saveRecentSearch, searchConversations, toast]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setFilters({});
  }, []);

  // Get conversation context for a search result
  const getConversationContext = useCallback(async (conversationId: string, messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to get conversation context:', error);
        return null;
      }

      const messageIndex = data.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return null;

      // Get surrounding messages for context
      const startIndex = Math.max(0, messageIndex - 3);
      const endIndex = Math.min(data.length, messageIndex + 4);
      
      return data.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return null;
    }
  }, []);

  // Export search results
  const exportSearchResults = useCallback(() => {
    if (searchResults.length === 0) {
      toast({
        title: "No Results to Export",
        description: "Search for something first to export results.",
        variant: "default"
      });
      return;
    }

    const exportData = {
      query: searchQuery,
      filters,
      results: searchResults,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zoxaa-search-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Search Results Exported",
      description: `Exported ${searchResults.length} search results.`,
    });
  }, [searchResults, searchQuery, filters, toast]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    filters,
    setFilters,
    recentSearches,
    searchConversations,
    semanticSearch,
    clearSearch,
    getConversationContext,
    exportSearchResults
  };
};

