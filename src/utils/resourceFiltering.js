export function filterResourcesClientSide(allResources, criteria) {
  // Pre-filter massive API responses before React processing
  return allResources.filter(resource => {
    // Only process resources we can actually use
    const supportedSubjects = ['Bible', 'Aligned Bible', 'Translation Notes', 'Translation Questions', 'Translation Words', 'TSV Translation Words Links'];
    return supportedSubjects.includes(resource.subject);
  }).map(resource => ({
    // Strip unnecessary fields before React gets them
    id: resource.id,
    name: resource.name,
    owner: resource.owner,
    subject: resource.subject,
    title: resource.title,
    abbreviation: resource.abbreviation,
    language: resource.language
  }));
} 