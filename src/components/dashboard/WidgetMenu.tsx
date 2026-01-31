import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useDashboardLayoutContext } from '~/context/DashboardLayoutContext';
import { useAuth } from '~/context/AuthContext';
import {
  WIDGET_CATEGORIES,
  getWidgetsByCategory,
  type WidgetDefinition,
  type WidgetCategory,
} from '~/config/widgetRegistry';

export const WidgetMenu: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { addWidget, setDroppingWidget, currentLayoutData } = useDashboardLayoutContext();

  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<WidgetCategory>>(
    new Set(['air-quality', 'ring', 'data', 'actions'])
  );

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const toggleCategory = (category: WidgetCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleWidgetClick = (widget: WidgetDefinition) => {
    addWidget(widget.id);
    setIsOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, widget: WidgetDefinition) => {
    // Set the widget type in data transfer
    e.dataTransfer.setData('text/plain', widget.id);
    e.dataTransfer.effectAllowed = 'copy';

    // Set the dropping widget in context so DashboardCanvas knows what's being dragged
    setDroppingWidget(widget);
  };

  const handleDragEnd = () => {
    // Clear the dropping widget
    setDroppingWidget(null);
  };

  // Check if we can add widgets (need layout data)
  const canAddWidgets = !!currentLayoutData;

  return (
    <div ref={menuRef} className="fixed bottom-4 left-16 z-50">
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 flex items-center justify-center border border-airq-dark shadow-card transition-all ${
          isOpen
            ? 'bg-airq-primary text-airq-light'
            : 'bg-airq-dark text-airq-light hover:bg-airq-primary'
        }`}
        title="Add Widget"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>

      {/* Menu panel */}
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-64 bg-airq-light border border-airq-dark shadow-card max-h-96 flex flex-col">
          {/* Header */}
          <div className="px-3 py-2 bg-airq-dark text-airq-light text-sm font-medium flex-shrink-0">
            Add Widget
          </div>

          {/* Widget list */}
          <div className="overflow-y-auto flex-1">
            {!canAddWidgets ? (
              <div className="px-3 py-4 text-sm text-airq-dark/70 text-center">
                Load or create a layout first to add widgets.
              </div>
            ) : (
              WIDGET_CATEGORIES.map((category) => {
                const widgets = getWidgetsByCategory(category.id);
                const isExpanded = expandedCategories.has(category.id);
                const CategoryIcon = category.icon;

                return (
                  <div key={category.id} className="border-b border-airq-dark/10 last:border-b-0">
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full px-3 py-2 text-sm text-airq-dark flex items-center justify-between hover:bg-airq-dark/5"
                    >
                      <span className="flex items-center">
                        <CategoryIcon className="w-4 h-4 mr-2" />
                        {category.name}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Category widgets */}
                    {isExpanded && (
                      <div className="bg-airq-dark/[0.02]">
                        {widgets.map((widget) => (
                          <WidgetListItem
                            key={widget.id}
                            widget={widget}
                            onClick={() => handleWidgetClick(widget)}
                            onDragStart={(e) => handleDragStart(e, widget)}
                            onDragEnd={handleDragEnd}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          {canAddWidgets && (
            <div className="px-3 py-2 text-xs text-airq-dark/50 border-t border-airq-dark/10 flex-shrink-0">
              Click to add or drag to position
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface WidgetListItemProps {
  widget: WidgetDefinition;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const WidgetListItem: React.FC<WidgetListItemProps> = ({
  widget,
  onClick,
  onDragStart,
  onDragEnd,
}) => {
  const Icon = widget.icon;

  return (
    <div
      className="flex items-center px-3 py-2 text-sm text-airq-dark hover:bg-airq-dark/5 cursor-pointer group"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      {/* Drag handle */}
      <GripVertical className="w-3 h-3 mr-1 text-airq-dark/30 group-hover:text-airq-dark/60 cursor-grab" />

      {/* Widget icon */}
      <Icon className="w-4 h-4 mr-2 text-airq-dark/70" />

      {/* Widget info */}
      <div className="flex-1 min-w-0">
        <div className="truncate">{widget.name}</div>
      </div>
    </div>
  );
};

export default WidgetMenu;
