/**
 * Translation Helps Discovery Service
 * Discovers available translation helps across all organizations
 */

import { searchResourcesAcrossOrgs } from './catalogService.js';

/**
 * Discovers ALL available translation helps across ALL organizations
 * Returns complete availability matrix for a language
 */
export async function discoverAllTranslationHelps(languageId) {
    console.log(`🔍 Discovering all translation helps for language: ${languageId}`);
    
    const availability = {
        tn: {},
        tq: {},
        tw: {},
        twl: {}
    };

    if (!languageId) {
        console.warn('No languageId provided to discoverAllTranslationHelps');
        return availability;
    }

    try {
        // Search for each resource type across all organizations - now returns enhanced structure
        const searchPromises = [
            searchResourcesAcrossOrgs(languageId, 'Translation Notes')
                .then(result => {
                    // Handle enhanced structure: result.resources contains the resources
                    const resources = result?.resources || result;
                    if (resources && Object.keys(resources).length > 0) {
                        availability.tn = resources;
                        // Log metadata for Translation Notes
                        if (result?.metadata) {
                            console.log(`📊 Translation Notes metadata: ${result.metadata.totalResources} resources from ${result.metadata.organizations.length} organizations`);
                        }
                    }
                })
                .catch(err => console.warn('Failed to discover Translation Notes:', err)),
                
            searchResourcesAcrossOrgs(languageId, 'Translation Questions')
                .then(result => {
                    // Handle enhanced structure: result.resources contains the resources
                    const resources = result?.resources || result;
                    if (resources && Object.keys(resources).length > 0) {
                        availability.tq = resources;
                        // Log metadata for Translation Questions
                        if (result?.metadata) {
                            console.log(`📊 Translation Questions metadata: ${result.metadata.totalResources} resources from ${result.metadata.organizations.length} organizations`);
                        }
                    }
                })
                .catch(err => console.warn('Failed to discover Translation Questions:', err)),
                
            searchResourcesAcrossOrgs(languageId, 'Translation Words')
                .then(result => {
                    // Handle enhanced structure: result.resources contains the resources
                    const resources = result?.resources || result;
                    if (resources && Object.keys(resources).length > 0) {
                        availability.tw = resources;
                        // Log metadata for Translation Words
                        if (result?.metadata) {
                            console.log(`📊 Translation Words metadata: ${result.metadata.totalResources} resources from ${result.metadata.organizations.length} organizations`);
                        }
                    }
                })
                .catch(err => console.warn('Failed to discover Translation Words:', err))
        ];
        
        // TWL discovery is more complex - it's not a standard subject
        // For now, we'll leave it empty but the structure is ready
        
        await Promise.all(searchPromises);
        
        console.log('📊 Discovery results:', availability);
        
    } catch (error) {
        console.error('Error discovering translation helps:', error);
    }

    return availability;
}

/**
 * Selects best organization for each resource type based on priority:
 * 1. User's primary organization preference (if available)
 * 2. Scripture organization (for consistency)
 * 3. Completeness/quality metrics
 * 4. Default priority order (unfoldingWord > Door43-Catalog > others)
 */
export function selectOptimalOrganizations(availability, primaryOrg = null, scriptureOrg = null) {
    console.log(`🎯 Selecting optimal organizations with primary: ${primaryOrg}, scripture: ${scriptureOrg}`);
    
    const selected = {};
    
    for (const [resourceType, orgData] of Object.entries(availability)) {
        const bestChoice = selectBestOrganization(orgData, primaryOrg, scriptureOrg);
        if (bestChoice) {
            selected[resourceType] = bestChoice;
        }
    }
    
    console.log('✅ Selected optimal organizations:', selected);
    return selected;
}

/**
 * Selects the best organization for a specific resource type
 */
function selectBestOrganization(orgData, primaryOrg, scriptureOrg) {
    if (!orgData || Object.keys(orgData).length === 0) {
        return null;
    }
    
    // Priority 1: Primary organization (if user selected and available)
    if (primaryOrg && orgData[primaryOrg]) {
        return { 
            organization: primaryOrg, 
            ...orgData[primaryOrg],
            selectionReason: 'primary'
        };
    }
    
    // Priority 2: Scripture organization (for consistency)
    if (scriptureOrg && orgData[scriptureOrg]) {
        return { 
            organization: scriptureOrg, 
            ...orgData[scriptureOrg],
            selectionReason: 'scripture-consistency'
        };
    }
    
    // Priority 3: Find most complete resource
    let bestOrg = null;
    let bestScore = 0;
    
    for (const [org, data] of Object.entries(orgData)) {
        const score = calculateResourceScore(data);
        if (score > bestScore) {
            bestScore = score;
            bestOrg = org;
        }
    }
    
    if (bestOrg) {
        return { 
            organization: bestOrg, 
            ...orgData[bestOrg],
            selectionReason: 'best-quality'
        };
    }
    
    // Priority 4: Default fallback - just pick the first available
    const firstOrg = Object.keys(orgData)[0];
    return { 
        organization: firstOrg, 
        ...orgData[firstOrg],
        selectionReason: 'fallback'
    };
}

/**
 * Calculate a quality score for a resource to help with selection
 */
function calculateResourceScore(resourceData) {
    if (!resourceData) return 0;
    
    let score = 0;
    
    // Book count (more books = higher score)
    const bookCount = resourceData.books?.length || 0;
    score += bookCount;
    
    // Checking level (higher level = higher score)
    const checkingLevel = parseInt(resourceData.checking_level) || 0;
    score += checkingLevel * 10; // Weight checking level heavily
    
    // Release status bonus
    if (resourceData.stage === 'prod') score += 20;
    else if (resourceData.stage === 'preprod') score += 10;
    
    // Completion status
    if (resourceData.status === 'complete') score += 15;
    
    // Recency bonus (newer versions preferred)
    const version = parseFloat(resourceData.version) || 0;
    score += version;
    
    return score;
}

/**
 * Get a human-readable status for a resource
 */
export function getResourceStatus(resourceData) {
    if (!resourceData) return 'Not Available';
    
    const checkingLevel = parseInt(resourceData.checking_level) || 0;
    const bookCount = resourceData.books?.length || 0;
    const stage = resourceData.stage || 'unknown';
    
    if (checkingLevel >= 3 && stage === 'prod') {
        return 'Complete';
    } else if (checkingLevel >= 2) {
        return 'In Review';
    } else if (bookCount > 0) {
        return 'In Progress';
    } else {
        return 'Not Available';
    }
}

/**
 * Get organization priority for display ordering
 */
export function getOrganizationPriority(org) {
    const priorities = {
        'unfoldingWord': 1,
        'Door43-Catalog': 2,
        'MVHS': 3
    };
    
    return priorities[org] || 999;
}
