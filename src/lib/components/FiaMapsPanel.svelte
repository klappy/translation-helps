<script>
  import FiaPanel from './FiaPanel.svelte';

  export let reference;

  // Filter to show only maps from FIA data
  function filterFiaData(fiaData) {
    if (!fiaData) return null;
    
    return {
      ...fiaData,
      images: [], // Hide images for this panel
      hasContent: fiaData?.maps && fiaData.maps.length > 0
    };
  }
</script>

<FiaPanel {reference} filterData={filterFiaData} />