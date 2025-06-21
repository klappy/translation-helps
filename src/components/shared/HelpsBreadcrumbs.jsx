/**
 * HelpsBreadcrumbs.jsx
 * Breadcrumbs for translation helps panels showing language and organization path
 * Reuses styling from NavigationBreadcrumbs but simplified for helps resources
 */

import React from 'react';
import { getLanguageFlag, getResourceIcon } from '../../utils/visualHelpers';

const RESOURCE_DISPLAY_NAMES = {
  tn: 'Translation Notes',
  tq: 'Translation Questions',
  tw: 'Translation Words',
  twl: 'Translation Word Links'
};

export function HelpsBreadcrumbs({
  resourceType,
  languageId,
  organization,
  onLanguageClick,
  onOrganizationClick,
  onStartNavigation // For triggering navigation when needed
}) {
  const getLanguageName = () => {
    if (!languageId) return 'Language';
    return languageId.toUpperCase(); // No icon here - icon is shown separately in breadcrumb
  };

  const getOrganizationName = () => {
    if (!organization) return 'Organization';
    return organization;
  };

  const getResourceName = () => {
    if (!resourceType) return 'Resource';
    const name = RESOURCE_DISPLAY_NAMES[resourceType] || resourceType.toUpperCase();
    return name; // No icon duplication - icon is shown separately
  };

  // Smart breadcrumb click handlers
  const handleLanguageClick = () => {
    console.log(`Language breadcrumb clicked for ${resourceType}`);
    if (onStartNavigation) {
      onStartNavigation('language'); // Start navigation at language step
    }
  };

  const handleOrganizationClick = () => {
    console.log(`Organization breadcrumb clicked for ${resourceType}`);
    if (languageId && onStartNavigation) {
      onStartNavigation('organization'); // Start navigation at organization step
    }
  };

  const breadcrumbSteps = [
    {
      id: 'language',
      label: getLanguageName(),
      completed: !!languageId,
      enabled: true,
      onClick: handleLanguageClick,
      icon: languageId ? (getLanguageFlag(languageId) || '🌐') : '🌐',
    },
    {
      id: 'organization',
      label: getOrganizationName(),
      completed: !!organization,
      enabled: !!languageId,
      onClick: handleOrganizationClick,
      icon: '🏢',
    },
    {
      id: 'resource',
      label: getResourceName(),
      completed: !!resourceType,
      enabled: true,
      onClick: null, // Resource type is fixed for each panel
      icon: getResourceIcon(resourceType),
    },
  ];

  const getStepClass = (step) => {
    if (!step.enabled) return 'breadcrumb-button breadcrumb-disabled';
    if (step.completed) return 'breadcrumb-button breadcrumb-completed';
    return 'breadcrumb-button breadcrumb-default';
  };

  return (
    <>
      <style>
        {`
          .breadcrumb-button {
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 500;
            transition: all 0.2s ease;
            border: 1px solid transparent;
            text-decoration: none;
            user-select: none;
            background: none;
          }
          
          .breadcrumb-disabled {
            color: var(--color-text-muted);
            cursor: not-allowed;
          }
          
          .breadcrumb-completed {
            background-color: var(--color-surface-hover);
            color: var(--color-text);
            border: 1px solid var(--color-border);
            cursor: pointer;
          }
          
          .breadcrumb-default {
            background-color: var(--color-surface);
            color: var(--color-text-muted);
            border: 1px solid var(--color-border);
            cursor: pointer;
          }
          
          .breadcrumb-completed:hover,
          .breadcrumb-default:hover {
            background-color: var(--color-surface-hover) !important;
            border-color: var(--color-border-hover) !important;
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
          }
          
          .breadcrumb-disabled:hover {
            transform: none;
            box-shadow: none;
          }
          
          .breadcrumb-non-clickable {
            cursor: default;
          }
          
          .breadcrumb-non-clickable:hover {
            transform: none;
            box-shadow: none;
            background-color: var(--color-surface-hover) !important;
          }
        `}
      </style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: 'var(--spacing-2)',
        }}
      >
        {breadcrumbSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => step.enabled && step.onClick && step.onClick()}
              className={`${getStepClass(step)} ${!step.onClick ? 'breadcrumb-non-clickable' : ''}`}
              title={
                step.onClick && step.enabled 
                  ? `Click to change ${step.label}`
                  : step.enabled 
                    ? step.label
                    : 'Complete previous steps first'
              }
              data-testid={`helps-breadcrumb-${step.id}`}
            >
              <span style={{ fontSize: '12px' }}>{step.icon}</span>
              <span>{step.label}</span>
              {step.completed && <span style={{ fontSize: '9px', marginLeft: '3px' }}>✓</span>}
            </button>

            {/* Separator Arrow */}
            {index < breadcrumbSteps.length - 1 && (
              <span
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '9px',
                  userSelect: 'none',
                }}
              >
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
} 