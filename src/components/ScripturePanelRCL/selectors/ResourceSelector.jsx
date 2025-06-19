/**
 * ResourceSelector.jsx
 * Resource selection component with organization grouping and search
 * Shows ALL Bible resources from ALL organizations
 */
import React, { useState, useMemo, useEffect } from 'react';
import { searchResourcesAcrossOrgs } from '../../../services/catalogService';
import { getResourceIcon, getOrganizationAvatar } from "../../../utils/visualHelpers";
import styles from './ResourceSelector.module.css';

export function ResourceSelector({ onSelect, onBack, languageId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allResources, setAllResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ALL Bible-related resources from all organizations
  useEffect(() => {
    const loadResources = async () => {
      if (!languageId) {
        setAllResources({});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('📚 Fetching all Bible resources for language:', languageId);
        
        // Fetch all Bible resources (Bible and Aligned Bible) in one call
        const bibleResources = await searchResourcesAcrossOrgs(languageId, 'Aligned Bible,Bible');
        
        console.log('📚 All Bible resources:', Object.keys(bibleResources).length, 'organizations');
        
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
        
        const totalResources = Object.values(bibleResources).reduce((sum, orgResources) => sum + orgResources.length, 0);
        console.log(`✅ Loaded ${totalResources} Bible resources from ${Object.keys(bibleResources).length} organizations`);
        
        setAllResources(bibleResources);
      } catch (err) {
        console.error('Failed to load resources:', err);
        setError('Failed to load resources. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [languageId]);

  // Group resources by organization
  const groupedResources = useMemo(() => {
    return Object.entries(allResources)
      .filter(([org, orgResources]) => orgResources && orgResources.length > 0)
      .map(([org, orgResources]) => {
        // Get organization metadata from the first resource in the group
        const firstResource = orgResources[0];
        const organizationData = firstResource?.organizationData || null;
        
        return {
          organization: { 
            id: org, 
            name: org,
            avatar_url: organizationData?.avatar_url,
            full_name: organizationData?.full_name || org,
            login: organizationData?.login || org
          },
          resources: orgResources.map(resource => ({
            ...resource,
            organization: org,
            organizationName: org
          }))
        };
      })
      .sort((a, b) => a.organization.name.localeCompare(b.organization.name));
  }, [allResources]);

  // Filter resources based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedResources;
    
    const term = searchTerm.toLowerCase();
    return groupedResources.map(group => ({
      ...group,
      resources: group.resources.filter(resource =>
        resource.name?.toLowerCase().includes(term) ||
        resource.id?.toLowerCase().includes(term) ||
        resource.title?.toLowerCase().includes(term) ||
        resource.description?.toLowerCase().includes(term)
      )
    })).filter(group => group.resources.length > 0);
  }, [groupedResources, searchTerm]);

  const handleResourceSelect = (resource) => {
    onSelect({
      id: resource.id,
      organization: resource.organization,
      name: resource.name || resource.title || resource.id.toUpperCase(),
      type: resource.type || resource.subject
    });
  };

  const getResourceTypeLabel = (resource) => {
    const type = resource.type || resource.subject || resource.id;
    
    // Common scripture resource types
    const typeLabels = {
      'ult': 'Literal',
      'ust': 'Simplified', 
      'udb': 'Dynamic',
      'ugnt': 'Original Greek',
      'uhb': 'Original Hebrew',
      'glt': 'Gateway',
      'f10': 'First 10',
      'Bible': 'Scripture',
      'Aligned Bible': 'Aligned'
    };
    
    const lowerType = type.toLowerCase();
    return typeLabels[lowerType] || typeLabels[type] || 'Scripture';
  };

  const isAlignedResource = (resource) => {
    const alignedTypes = ['ult', 'ugnt', 'uhb'];
    const type = (resource.type || resource.id).toLowerCase();
    return alignedTypes.includes(type) || resource.subject === 'Aligned Bible';
  };

  return (
    <div className={styles.selectorContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <h3 className={styles.title}>Select Resource</h3>
        <div className={styles.spacer} />
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          autoFocus
        />
      </div>

      {/* Resource Groups */}
      <div className={styles.listContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading resources...</div>
        ) : error ? (
          <div className={styles.emptyState}>Failed to load resources. Please try again.</div>
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <div key={group.organization.id} className={styles.resourceGroup}>
              <div className={styles.groupHeader}>
                {group.organization.avatar_url ? (
                  <img 
                    src={group.organization.avatar_url} 
                    alt={group.organization.full_name || group.organization.name}
                    className={styles.organizationLogo}
                    onError={(e) => {
                      console.log(`❌ Avatar failed to load for ${group.organization.name}:`, group.organization.avatar_url);
                      // Hide the image and show initials fallback
                      e.target.style.display = 'none';
                      const fallback = e.target.parentNode.querySelector('.fallback-initials');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className={styles.organizationInitials}>
                    {getOrganizationAvatar(group.organization).value}
                  </div>
                )}
                {/* Fallback initials (hidden by default, shown on image error) */}
                <div 
                  className={`${styles.organizationInitials} fallback-initials`}
                  style={{ display: 'none' }}
                >
                  {getOrganizationAvatar(group.organization).value}
                </div>
                <h4 className={styles.organizationName}>{group.organization.name}</h4>
              </div>
              
              {group.resources.map(resource => (
                <button
                  key={`${resource.organization}-${resource.id}`}
                  onClick={() => handleResourceSelect(resource)}
                  className={styles.resourceItem}
                >
                  <div className={styles.resourceInfo}>
                    <div className={styles.resourceName}>
                      {resource.avatarUrl ? (
                        <img 
                          src={resource.avatarUrl} 
                          alt={resource.name || resource.id}
                          className={styles.resourceAvatar}
                        />
                      ) : (
                        getResourceIcon(resource.id)
                      )} {resource.name || resource.title || resource.id.toUpperCase()}
                    </div>
                    <div className={styles.resourceDescription}>
                      {resource.description || `${getResourceTypeLabel(resource)} Translation`}
                    </div>
                  </div>
                  <div className={styles.resourceLabels}>
                    <span className={styles.typeLabel}>
                      {getResourceTypeLabel(resource)}
                    </span>
                    {isAlignedResource(resource) && (
                      <span className={styles.alignedLabel}>Aligned</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            {searchTerm ? 'No resources found' : 'No resources available for this language'}
          </div>
        )}
      </div>
    </div>
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
