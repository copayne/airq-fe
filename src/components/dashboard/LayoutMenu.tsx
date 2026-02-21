import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Plus,
  Copy,
  Trash2,
  Edit3,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useDashboardLayoutContext } from '~/context/DashboardLayoutContext';
import { useAuth } from '~/context/AuthContext';
import LayoutSaveDialog from './LayoutSaveDialog';
import ConfirmDialog from '~/components/common/ConfirmDialog';

export const LayoutMenu: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isAuthenticated } = useAuth();
  const {
    layouts,
    currentLayoutId,
    currentLayout,
    isSaving,
    loadLayout,
    createNewLayout,
    renameLayout,
    deleteLayout,
    duplicateLayout,
  } = useDashboardLayoutContext();

  const [isOpen, setIsOpen] = useState(false);
  const [showLayoutList, setShowLayoutList] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLayoutList(false);
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

  const existingNames = layouts.map((l) => l.name);

  const handleCreate = async (name: string) => {
    await createNewLayout(name);
    setShowCreateDialog(false);
  };

  const handleRename = async (newName: string) => {
    if (selectedLayoutId) {
      await renameLayout(selectedLayoutId, newName);
    }
  };

  const handleDuplicate = async (newName: string) => {
    if (selectedLayoutId) {
      await duplicateLayout(selectedLayoutId, newName);
    }
  };

  const handleDelete = async () => {
    if (selectedLayoutId) {
      await deleteLayout(selectedLayoutId);
      setShowDeleteConfirm(false);
      setSelectedLayoutId(null);
    }
  };

  const handleLoadLayout = async (id: string) => {
    await loadLayout(id);
    setIsOpen(false);
    setShowLayoutList(false);
  };

  const selectedLayout = selectedLayoutId
    ? layouts.find((l) => l.id === selectedLayoutId)
    : null;

  return (
    <div ref={menuRef} className={`fixed z-50 ${compact ? 'bottom-5 left-5' : 'bottom-4 left-4'}`}>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center border border-airq-dark shadow-card transition-all ${
          compact ? 'w-14 h-14 rounded-lg' : 'w-10 h-10'
        } ${
          isOpen
            ? 'bg-airq-primary text-airq-light'
            : 'bg-airq-dark text-airq-light hover:bg-airq-primary'
        }`}
        title="Layout Manager"
      >
        <Layers className={compact ? 'w-6 h-6' : 'w-5 h-5'} />
      </button>

      {/* Menu panel */}
      {isOpen && (
        <div className={`absolute left-0 bg-airq-light border border-airq-dark shadow-card ${compact ? 'bottom-16 w-64' : 'bottom-12 w-56'}`}>
          {/* Header */}
          <div className="px-3 py-2 bg-airq-dark text-airq-light text-sm font-medium">
            Layouts
            {currentLayout && (
              <span className="ml-2 text-xs opacity-70">
                ({currentLayout.name})
              </span>
            )}
          </div>

          <div className="py-1">
            {/* Load Layout */}
            <div
              className="relative"
              onMouseEnter={() => setShowLayoutList(true)}
              onMouseLeave={() => setShowLayoutList(false)}
            >
              <button
                className="w-full px-3 py-2 text-sm text-airq-dark flex items-center justify-between hover:bg-airq-dark/5"
                disabled={layouts.length === 0}
              >
                <span className="flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  Load Layout
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Layout list submenu */}
              {showLayoutList && layouts.length > 0 && (
                <div className="absolute left-full top-0 ml-1 w-48 bg-airq-light border border-airq-dark shadow-card max-h-64 overflow-y-auto">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => handleLoadLayout(layout.id)}
                      className="w-full px-3 py-2 text-sm text-airq-dark text-left hover:bg-airq-dark/5 flex items-center justify-between"
                    >
                      <span className="truncate flex-1">{layout.name}</span>
                      {layout.id === currentLayoutId && (
                        <Check className="w-4 h-4 text-airq-primary flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-airq-dark/20 my-1" />

            {/* Create New Layout */}
            <button
              onClick={() => {
                setShowCreateDialog(true);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-sm text-airq-dark flex items-center hover:bg-airq-dark/5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={layouts.length >= 10}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Layout
              {layouts.length >= 10 && (
                <span className="ml-auto text-xs text-airq-tertiary">Max 10</span>
              )}
            </button>

            {/* Actions for current layout */}
            {currentLayout && (
              <>
                <div className="border-t border-airq-dark/20 my-1" />

                {/* Rename */}
                <button
                  onClick={() => {
                    setSelectedLayoutId(currentLayoutId);
                    setShowRenameDialog(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-airq-dark flex items-center hover:bg-airq-dark/5"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Rename
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => {
                    setSelectedLayoutId(currentLayoutId);
                    setShowDuplicateDialog(true);
                    setIsOpen(false);
                  }}
                  disabled={layouts.length >= 10}
                  className="w-full px-3 py-2 text-sm text-airq-dark flex items-center hover:bg-airq-dark/5 disabled:opacity-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </button>

                <div className="border-t border-airq-dark/20 my-1" />

                {/* Delete */}
                <button
                  onClick={() => {
                    setSelectedLayoutId(currentLayoutId);
                    setShowDeleteConfirm(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-airq-tertiary flex items-center hover:bg-airq-tertiary/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create New Dialog */}
      <LayoutSaveDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreate}
        existingNames={existingNames}
        isLoading={isSaving}
        mode="create"
      />

      {/* Rename Dialog */}
      <LayoutSaveDialog
        isOpen={showRenameDialog}
        onClose={() => {
          setShowRenameDialog(false);
          setSelectedLayoutId(null);
        }}
        onSave={handleRename}
        existingNames={existingNames}
        isLoading={isSaving}
        mode="rename"
        initialName={selectedLayout?.name ?? ''}
      />

      {/* Duplicate Dialog */}
      <LayoutSaveDialog
        isOpen={showDuplicateDialog}
        onClose={() => {
          setShowDuplicateDialog(false);
          setSelectedLayoutId(null);
        }}
        onSave={handleDuplicate}
        existingNames={existingNames}
        isLoading={isSaving}
        mode="duplicate"
        initialName={selectedLayout ? `${selectedLayout.name} (Copy)` : ''}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedLayoutId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Layout"
        message={`Are you sure you want to delete "${selectedLayout?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  );
};

export default LayoutMenu;
