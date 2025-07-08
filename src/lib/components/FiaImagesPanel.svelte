<script>
  import FiaPanel from './FiaPanel.svelte';

  export let reference;

  // Filter to show only images from FIA data
  function filterFiaData(fiaData) {
    if (!fiaData) return null;
    
    return {
      ...fiaData,
      maps: [], // Hide maps for this panel
      hasContent: fiaData?.images && fiaData.images.length > 0
    };
  }
</script>

<FiaPanel {reference} filterData={filterFiaData} />