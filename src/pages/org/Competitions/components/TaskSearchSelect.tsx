import { taskService } from '@services/taskService';
import type { TaskDTO } from '@shared/models/task';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface TaskSearchSelectProps {
  readonly value: number | '';
  readonly onChange: (task: TaskDTO | null) => void;
  readonly assignedTaskBodyIds?: number[];
  readonly error?: string;
  readonly disabled?: boolean;
}

const PAGE_SIZE = 20;

export const TaskSearchSelect: React.FC<TaskSearchSelectProps> = ({
  value,
  onChange,
  assignedTaskBodyIds = [],
  error,
  disabled = false,
}) => {
  const { t } = useTranslation('admin');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);

  const prevValueRef = useRef<number | '' | undefined>(undefined);

  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const latestRequestIdRef = useRef(0);

  // Sync with external value changes (e.g. initial load, edit mode)
  useEffect(() => {
    if (prevValueRef.current === value) {
      return;
    }
    prevValueRef.current = value;

    if (!value) {
      setSelectedTask(null);
      setInputValue('');
      return;
    }

    let isMounted = true;
    taskService
      .getTaskById(value)
      .then(res => {
        if (isMounted && res) {
          setSelectedTask(res);
          setInputValue(res.title);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSelectedTask(null);
          setInputValue('');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value]);

  // Debounce input value changes when typing
  useEffect(() => {
    // If the input value exactly matches the currently selected task,
    // we don't treat it as a restrictive search query so the user sees all options
    if (selectedTask && inputValue === selectedTask.title) {
      setDebouncedSearch('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, selectedTask]);

  // Fetch tasks helper
  const fetchTasks = useCallback(
    async (pageToLoad: number, search: string, isAppend: boolean) => {
      const requestId = ++latestRequestIdRef.current;

      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoadingInitial(true);
      }

      try {
        const res = await taskService.getMyTasks(pageToLoad, PAGE_SIZE, search || undefined);
        if (requestId !== latestRequestIdRef.current) return;

        const newItems = res?.content ?? [];
        setTotalPages(res?.totalPages ?? 0);
        setPage(pageToLoad);

        setTasks(prev => {
          if (!isAppend) return newItems;
          const existingIds = new Set(prev.map(i => i.id));
          const filteredNew = newItems.filter(i => !existingIds.has(i.id));
          return [...prev, ...filteredNew];
        });
      } catch {
        if (requestId === latestRequestIdRef.current && !isAppend) {
          setTasks([]);
        }
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  // Fetch when dropdown is opened or search query changes
  useEffect(() => {
    if (isOpen) {
      fetchTasks(0, debouncedSearch, false);
    }
  }, [isOpen, debouncedSearch, fetchTasks]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If a task is selected, reset input display to its title; otherwise clear input text
        if (selectedTask) {
          setInputValue(selectedTask.title);
        } else {
          setInputValue('');
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, selectedTask]);

  // Infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    const canLoadMore = page + 1 < totalPages;

    if (scrollHeight - scrollTop - clientHeight < 40 && !loadingMore && !loadingInitial && canLoadMore) {
      fetchTasks(page + 1, debouncedSearch, true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!isOpen) {
      setIsOpen(true);
    }

    // If text was modified and no longer matches selected task title, clear selection
    if (selectedTask && val !== selectedTask.title) {
      setSelectedTask(null);
      prevValueRef.current = '';
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    if (!disabled && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelect = (task: TaskDTO) => {
    if (assignedTaskBodyIds.includes(task.id)) return;
    setSelectedTask(task);
    setInputValue(task.title);
    prevValueRef.current = task.id;
    onChange(task);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setInputValue('');
    setSelectedTask(null);
    prevValueRef.current = '';
    onChange(null);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      if (selectedTask) {
        setInputValue(selectedTask.title);
      } else {
        setInputValue('');
      }
    } else {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  const getInputBorderClass = () => {
    if (error) {
      return 'border-red-500 focus:ring-1 focus:ring-red-500';
    }
    if (isOpen) {
      return 'border-emerald-500 focus:ring-1 focus:ring-emerald-500';
    }
    return 'border-gray-300 focus:ring-1 focus:ring-emerald-500';
  };

  const getItemClass = (isAssigned: boolean, isSelected: boolean) => {
    if (isAssigned) {
      return 'text-gray-400 bg-gray-50 cursor-not-allowed';
    }
    if (isSelected) {
      return 'bg-emerald-50 text-emerald-900 font-medium cursor-pointer';
    }
    return 'text-gray-700 hover:bg-gray-50 cursor-pointer';
  };

  const renderDropdownContent = () => {
    if (loadingInitial) {
      return (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span className="text-xs">{t('tours.tasks.loadingTasks')}</span>
        </div>
      );
    }

    if (tasks.length === 0) {
      const emptyMessage = debouncedSearch
        ? t('tours.tasks.noTasksFound')
        : t('tours.tasks.noTasksInBank');

      return (
        <div className="py-6 text-center text-xs text-gray-400">
          {emptyMessage}
        </div>
      );
    }

    return tasks.map(tItem => {
      const isAssigned = assignedTaskBodyIds.includes(tItem.id);
      const isSelected = selectedTask?.id === tItem.id;

      return (
        <button
          type="button"
          key={tItem.id}
          disabled={isAssigned}
          onMouseDown={e => {
            // Prevent blur on input before click triggers
            e.preventDefault();
          }}
          onClick={() => handleSelect(tItem)}
          className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between transition-colors ${getItemClass(
            isAssigned,
            isSelected,
          )}`}
        >
          <span className="truncate pr-2">{tItem.title}</span>

          <div className="shrink-0 flex items-center gap-1.5 text-[11px]">
            {isAssigned && (
              <span className="text-gray-400 italic">
                ({t('tours.tasks.alreadyAssignedOption')})
              </span>
            )}
            {isSelected && !isAssigned && (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
        </button>
      );
    });
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* The Single Input Field */}
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={t('tours.tasks.selectTaskPlaceholder')}
          className={`w-full text-xs pl-3 pr-16 py-2 bg-white border rounded focus:outline-none transition-colors ${
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
          } ${getInputBorderClass()}`}
        />

        {/* Action icons on the right */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              title={t('tours.tasks.cancelButton')}
              aria-label={t('tours.tasks.cancelButton')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            onClick={toggleDropdown}
            className="p-1 hover:text-gray-600 transition-colors"
            aria-label={t('tours.tasks.selectTaskPlaceholder')}
            aria-expanded={isOpen}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && <span className="text-[11px] text-red-500 font-medium block mt-1">{error}</span>}

      {/* Direct Dropdown List — No extra search fields */}
      {isOpen && (
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-56 overflow-y-auto divide-y divide-gray-50"
        >
          {renderDropdownContent()}

          {/* Loading more on scroll */}
          {loadingMore && (
            <div className="py-2.5 bg-gray-50 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5 border-t border-gray-100">
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
              <span>{t('tours.tasks.loadingMoreTasks')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

