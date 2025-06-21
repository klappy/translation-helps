/**
 * ResourceSelector.jsx
 * Resource selection component with organization grouping and search
 * Shows ALL Bible resources from ALL organizations
 * Now uses shared ResourceGrid for consistent UI
 */
import React, { useState, useEffect } from 'react';
import { searchResourcesAcrossOrgs } from '../../../services/catalogService';
import { ResourceGrid } from '../../shared/ResourceGrid';

export function ResourceSelector({ onSelect, onBack, languageId }) {
  const [allResources, setAllResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLanguageId, setCurrentLanguageId] = useState(null); // Track which language we're loading

  // Fetch ALL Bible-related resources from all organizations
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    
    const loadResources = async () => {
      if (!languageId) {
        if (isMounted) {
          setAllResources({});
          setLoading(false);
          setCurrentLanguageId(null);
        }
        return;
      }

      // Prevent duplicate API calls for the same language
      if (currentLanguageId === languageId && Object.keys(allResources).length > 0) {
        console.log('🔄 Resources already loaded for language:', languageId);
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
          setCurrentLanguageId(languageId);
        }
        
        console.log('📚 Fetching all Bible resources for language:', languageId);
        
        // Fetch all Bible resources (Bible and Aligned Bible) in one call - now returns enhanced structure
        const result = await searchResourcesAcrossOrgs(languageId, 'Aligned Bible,Bible');
        const { resources: bibleResources, metadata } = result;
        
        console.log('📚 Enhanced API result:', {
          organizations: Object.keys(bibleResources).length,
          totalResources: metadata.totalResources,
          languages: metadata.languages.length,
          organizationMetadata: metadata.organizations.length
        });

        // Log language metadata extracted from API
        if (metadata.languages.length > 0) {
          const langInfo = metadata.languages[0];
          console.log(`🌐 Language info from API: ${langInfo.name} (${langInfo.code}) - ${langInfo.direction}, Gateway: ${langInfo.isGateway}`);
        }

        // Log organization metadata extracted from API (no need for separate fetchOrganizationDetails calls)
        metadata.organizations.forEach(org => {
          console.log(`🏢 Organization from API: ${org.login} - Avatar: ${org.avatarUrl ? 'Available' : 'None'}, Languages: ${org.repoLanguages.join(', ')}`);
        });
        
        // Debug: Log sample resource data to understand the enhanced structure
        Object.entries(bibleResources).forEach(([org, resources]) => {
          if (resources.length > 0) {
            const sample = resources[0];
            console.log(`📋 Enhanced resource from ${org}:`, {
              id: sample.id,
              name: sample.name,
              title: sample.title, // Now available from API
              abbreviation: sample.abbreviation, // Now available from API
              languageTitle: sample.languageTitle, // Now available from API
              books: sample.books?.length || 0, // Now available from API
              isValid: sample.isValid // Now available from API
            });
          }
        });
        
        // Remove duplicates within each organization
        Object.keys(bibleResources).forEach(org => {
          const seen = new Set();
          bibleResources[org] = bibleResources[org].filter(resource => {
            const key = `${resource.id || resource.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        });
        
        console.log(`✅ Loaded ${metadata.totalResources} Bible resources from ${Object.keys(bibleResources).length} organizations`);
        console.log('🔄 About to set allResources state:', Object.keys(bibleResources));
        
        if (isMounted && currentLanguageId === languageId) {
          setAllResources(bibleResources);
          setLoading(false); // Set loading to false immediately after setting resources
        }
        
      } catch (err) {
        console.error('Failed to load resources:', err);
        if (isMounted && currentLanguageId === languageId) {
          setError('Failed to load resources. Please try again.');
          setLoading(false);
        }
      }
    };

    loadResources();
    
    return () => {
      isMounted = false; // Cleanup function to prevent state updates on unmounted component
    };
  }, [languageId, currentLanguageId, allResources]); // Added dependencies to prevent unnecessary calls

  const handleResourceSelect = (resource) => {
    onSelect({
      id: resource.id,
      organization: resource.organization,
      name: resource.name || resource.title || resource.id.toUpperCase(),
      type: resource.type || resource.subject,
      books: resource.books // Pass through book data for context
    });
  };

  return (
    <ResourceGrid
      resources={allResources}
      onSelect={handleResourceSelect}
      onBack={onBack}
      title="Select Resource"
      searchPlaceholder="Search resources..."
      loading={loading}
      error={error}
      emptyMessage="No resources available for this language"
      resourceType="bible"
    />
  );
}

/**
 * Check if a resource is a scripture resource
 */
function isScriptureResource(identifier) {
  if (!identifier) return false;
  
  const scriptureTypes = [
    'bible', 'ult', 'ust', 'udb', 'ugnt', 'uhb', 'glt', 'f10',
    'asv', 'kjv', 'nasb', 'niv', 'esv', 'nlt', 'csb', 'nrsv'
  ];
  
  const id = identifier.toLowerCase();
  return scriptureTypes.some(type => id.includes(type));
}
