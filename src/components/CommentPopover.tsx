import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactDOM from 'react-dom';

interface CommentPopoverProps {
  id?: string;
  itemName: string;
  comment?: string;
  mode: 'edit' | 'readonly';
  onSaveComment?: (newComment: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  buttonClassName?: string;
}

export const CommentPopover: React.FC<CommentPopoverProps> = ({
  id,
  itemName,
  comment = '',
  mode,
  onSaveComment,
  ariaLabel,
  placeholder = 'Add a comment (e.g. 90 € + 90 €)...',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; position: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    position: 'bottom',
  });

  const hasComment = Boolean(comment && comment.trim().length > 0);

  // Position calculation relative to trigger
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(280, window.innerWidth - 24);
    const popoverHeight = 100;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    // Keep within window bounds
    if (left < 12) left = 12;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }

    // Determine whether to show above or below
    const spaceBelow = window.innerHeight - rect.bottom;
    const showBelow = spaceBelow >= popoverHeight || rect.top < popoverHeight;

    const top = showBelow ? rect.bottom + 6 : rect.top - 6;

    setPopoverPos({
      top,
      left,
      position: showBelow ? 'bottom' : 'top',
    });
  };

  // Focus textarea when popover opens
  useEffect(() => {
    if (isOpen && mode === 'edit') {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Move cursor to end of text
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
      }, 40);
    }
  }, [isOpen, mode]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    updatePosition();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const popoverContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Transparent Backdrop to capture outside clicks */}
          <div 
            className="fixed inset-0 pointer-events-auto"
            onClick={handleClose}
          />

          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: popoverPos.position === 'bottom' ? -4 : 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: popoverPos.position === 'bottom' ? -4 : 4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              transform: popoverPos.position === 'top' ? 'translateY(-100%)' : 'none',
            }}
            className="fixed w-[calc(100vw-24px)] max-w-[280px] bg-white rounded-lg shadow-lg border border-neutral-300 p-2 z-50 pointer-events-auto font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {mode === 'edit' ? (
              <textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => {
                  if (onSaveComment) {
                    onSaveComment(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleClose();
                  }
                }}
                placeholder={placeholder}
                rows={2}
                className="w-full text-xs font-medium text-neutral-900 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded p-1.5 focus:outline-none transition resize-none leading-normal block"
              />
            ) : (
              <textarea
                readOnly
                value={comment || 'No comment added.'}
                rows={2}
                className={`w-full text-xs font-medium border border-transparent rounded p-1.5 focus:outline-none resize-none leading-normal block select-text cursor-default ${
                  hasComment ? 'text-neutral-900 bg-neutral-50/90' : 'text-neutral-400 italic bg-neutral-50/50'
                }`}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={handleOpen}
        aria-label={ariaLabel || (mode === 'edit' ? `Edit comment for ${itemName}` : `View comment for ${itemName}`)}
        title={hasComment ? `${itemName}: ${comment}` : (mode === 'edit' ? 'Add comment' : 'No comment')}
        className={`inline-flex items-center justify-center shrink-0 rounded-full transition cursor-pointer select-none ${
          hasComment
            ? 'w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 font-black shadow-3xs'
            : 'w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/80 border border-transparent hover:border-neutral-300 font-bold'
        } ${buttonClassName}`}
      >
        <span className="text-[10px] sm:text-[11px] font-mono leading-none tracking-tight">?</span>
      </button>

      {typeof document !== 'undefined' && ReactDOM.createPortal(popoverContent, document.body)}
    </>
  );
};
