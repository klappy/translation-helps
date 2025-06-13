# Dynamic Book Listing and Fallback

The book selector step loads available books for each Bible resource using the
resource `manifest.yaml` from Door43. Network issues or missing manifest
entries can cause this lookup to fail. When this happens the wizard now falls
back to the default 66-book list so users can continue navigating.

The UI displays a notice at the top of the book grid whenever the fallback list
is in use.
