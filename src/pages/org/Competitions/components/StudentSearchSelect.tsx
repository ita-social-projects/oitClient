import Input from '@components/Input';
import type { EligibleStudentResponse } from '@shared/models/enrollment';
import { enrollmentService } from '@shared/services/enrollmentService';
import { Loader2, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface StudentSearchSelectProps {
  readonly competitionId: number;
  readonly stageId: number;
  readonly selectedStudents: EligibleStudentResponse[];
  readonly onChange: (students: EligibleStudentResponse[]) => void;
  readonly disabled?: boolean;
}

export const StudentSearchSelect: React.FC<StudentSearchSelectProps> = ({
  competitionId,
  stageId,
  selectedStudents,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation('admin');
  const containerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [options, setOptions] = useState<EligibleStudentResponse[]>([]);

  const latestRequestIdRef = useRef(0);

  const isDebouncing = search !== debouncedSearch;
  const isSearching = loadingInitial || isDebouncing;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudents = useCallback(
    async (pageToLoad: number, query: string, isAppend: boolean) => {
      const requestId = ++latestRequestIdRef.current;

      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoadingInitial(true);
      }

      try {
        const res = await enrollmentService.getEligibleStudents(competitionId, stageId, {
          search: query || undefined,
          page: pageToLoad,
          size: 20,
          sort: 'surname,asc',
        });
        if (requestId !== latestRequestIdRef.current) return;

        const newItems = res?.content ?? [];
        setTotalPages(res?.totalPages ?? 0);
        setPage(pageToLoad);

        setOptions((prev) => {
          if (!isAppend) return newItems;
          const existingIds = new Set(prev.map((s) => s.id));
          const filteredNew = newItems.filter((s) => !existingIds.has(s.id));
          return [...prev, ...filteredNew];
        });
      } catch {
        if (requestId === latestRequestIdRef.current && !isAppend) {
          setOptions([]);
        }
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      }
    },
    [competitionId, stageId]
  );

  useEffect(() => {
    if (isOpen) {
      const trimmed = debouncedSearch.trim();
      void fetchStudents(0, trimmed, false);
    }
  }, [debouncedSearch, isOpen, fetchStudents]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    const canLoadMore = page + 1 < totalPages;

    if (
      scrollHeight - scrollTop - clientHeight < 40 &&
      !loadingMore &&
      !loadingInitial &&
      canLoadMore
    ) {
      void fetchStudents(page + 1, debouncedSearch.trim(), true);
    }
  };

  const handleSelectStudent = (student: EligibleStudentResponse) => {
    if (!selectedStudents.some((s) => s.id === student.id)) {
      onChange([...selectedStudents, student]);
    }
    latestRequestIdRef.current++;
    setSearch('');
    setDebouncedSearch('');
    setIsOpen(false);
  };

  const handleRemoveStudent = (studentId: number) => {
    onChange(selectedStudents.filter((s) => s.id !== studentId));
  };

  const renderDropdownContent = () => {
    if (isSearching) {
      return (
        <div className="p-3 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <Loader2 size={14} className="animate-spin text-emerald-600" />
          <span>{t('general.loading', { defaultValue: 'Завантаження...' })}</span>
        </div>
      );
    }

    if (options.length === 0) {
      return (
        <div className="p-3 text-center text-xs text-gray-500">
          {t('enrollment.invitations.sendModal.noStudentsFound')}
        </div>
      );
    }

    return (
      <>
        {options.map((student) => {
          const isSelected = selectedStudents.some((s) => s.id === student.id);
          return (
            <button
              key={student.id}
              type="button"
              disabled={isSelected}
              onClick={() => handleSelectStudent(student)}
              className={`w-full text-left p-2.5 text-xs flex items-center justify-between transition-colors ${
                isSelected
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'hover:bg-emerald-50 cursor-pointer text-gray-800'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">
                  {student.firstName} {student.surname}
                </span>
                <span className="text-gray-500">{student.email}</span>
              </div>
              <span className="text-2xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                ID: {student.id}
              </span>
            </button>
          );
        })}

        {loadingMore && (
          <div className="p-2 text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 bg-gray-50">
            <Loader2 size={13} className="animate-spin text-emerald-600" />
            <span>{t('enrollment.invitations.sendModal.loadingMore')}</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2">
      {/* Selected Student Chips */}
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-gray-50 rounded-md border border-gray-200">
          {selectedStudents.map((student) => (
            <span
              key={student.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
            >
              <span>
                {student.firstName} {student.surname} ({student.email})
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveStudent(student.id)}
                  className="p-0.5 hover:bg-emerald-200 rounded-full cursor-pointer transition-colors"
                  aria-label={`Remove ${student.firstName} ${student.surname}`}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Autocomplete Input */}
      <div className="relative">
        <Input
          type="text"
          value={search}
          disabled={disabled}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            latestRequestIdRef.current++;
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={t('enrollment.invitations.sendModal.searchStudentsPlaceholder')}
          icon={<Search size={16} />}
          iconEnd={
            isSearching ? (
              <Loader2
                size={16}
                className="animate-spin text-emerald-600"
              />
            ) : undefined
          }
        />
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          onScroll={handleScroll}
          className="absolute z-50 left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg divide-y divide-gray-100"
        >
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
};

export default StudentSearchSelect;
