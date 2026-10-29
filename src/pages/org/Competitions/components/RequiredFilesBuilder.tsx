import type { RequiredFileRule } from '@shared/models/taskAssignment';
import { Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface RequiredFileRuleErrors {
  prompt?: string;
  namingRule?: string;
  allowedExtensions?: string;
  maxFileSizeMb?: string;
}

export interface RequiredFilesBuilderProps {
  readonly rules: RequiredFileRule[];
  readonly onChange: (rules: RequiredFileRule[]) => void;
  readonly disabled?: boolean;
  readonly ruleErrors?: Record<number, RequiredFileRuleErrors>;
}

const COMMON_PRESETS = ['.cpp', '.py', '.java', '.xlsx', '.zip', '.pdf', '.docx', '.sql'];

export const RequiredFilesBuilder: React.FC<RequiredFilesBuilderProps> = ({
  rules,
  onChange,
  disabled = false,
  ruleErrors,
}) => {
  const { t } = useTranslation('admin');
  const [customExtInputs, setCustomExtInputs] = useState<Record<string, string>>({});

  const handleUpdateRule = (index: number, patch: Partial<RequiredFileRule>) => {
    const next = rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange(next);
  };

  const handleAddRule = () => {
    const newRule: RequiredFileRule = {
      id: crypto.randomUUID(),
      prompt: '',
      namingRule: '',
      allowedExtensions: ['.zip'],
      maxFileSizeMb: 20,
    };
    onChange([...rules, newRule]);
  };

  const handleRemoveRule = (index: number) => {
    if (rules.length <= 1) return;
    onChange(rules.filter((_, i) => i !== index));
  };

  const handleTogglePreset = (ruleIndex: number, ext: string) => {
    const rule = rules[ruleIndex];
    const exists = rule.allowedExtensions.includes(ext);
    const nextExtensions = exists
      ? rule.allowedExtensions.filter(e => e !== ext)
      : [...rule.allowedExtensions, ext];

    handleUpdateRule(ruleIndex, { allowedExtensions: nextExtensions });
  };

  const handleAddCustomExt = (ruleIndex: number, ruleKey: string) => {
    const raw = (customExtInputs[ruleKey] ?? '').trim().toLowerCase();
    if (!raw) return;
    const formatted = raw.startsWith('.') ? raw : `.${raw}`;
    const rule = rules[ruleIndex];

    if (!rule.allowedExtensions.includes(formatted)) {
      handleUpdateRule(ruleIndex, {
        allowedExtensions: [...rule.allowedExtensions, formatted],
      });
    }

    setCustomExtInputs(prev => ({ ...prev, [ruleKey]: '' }));
  };

  const handleRemoveExt = (ruleIndex: number, ext: string) => {
    const rule = rules[ruleIndex];
    handleUpdateRule(ruleIndex, {
      allowedExtensions: rule.allowedExtensions.filter(e => e !== ext),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">
            {t('tours.tasks.requirementsTitle')}
          </h4>
          <p className="text-xs text-gray-500">{t('tours.tasks.requirementsSubtitle')}</p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleAddRule}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            <Plus size={14} />
            <span>{t('tours.tasks.addRequirementButton')}</span>
          </button>
        )}
      </div>

      {rules.map((rule, index) => {
        const ruleKey = rule.id || `rule-${index}`;
        return (
          <div
            key={ruleKey}
            className="p-3.5 bg-gray-50/80 rounded-lg border border-gray-200/80 flex flex-col gap-3 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                {t('tours.tasks.ruleTitle', { index: index + 1 })}
              </span>
            {rules.length > 1 && !disabled && (
              <button
                type="button"
                onClick={() => handleRemoveRule(index)}
                aria-label={t('tours.tasks.removeRuleButton')}
                className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                title={t('tours.tasks.removeRuleButton')}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('tours.tasks.promptLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={disabled}
                value={rule.prompt}
                onChange={e => handleUpdateRule(index, { prompt: e.target.value })}
                placeholder={t('tours.tasks.promptPlaceholder')}
                className={`w-full text-xs px-2.5 py-1.5 bg-white border rounded focus:outline-none transition-colors ${
                  ruleErrors?.[index]?.prompt
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
              {ruleErrors?.[index]?.prompt && (
                <span className="text-[11px] text-red-500 font-medium block mt-1">
                  {ruleErrors[index].prompt}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('tours.tasks.namingRuleLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={disabled}
                value={rule.namingRule}
                onChange={e =>
                  handleUpdateRule(index, {
                    namingRule: e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''),
                  })
                }
                placeholder={t('tours.tasks.namingRulePlaceholder')}
                className={`w-full text-xs px-2.5 py-1.5 bg-white border rounded focus:outline-none font-mono transition-colors ${
                  ruleErrors?.[index]?.namingRule
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
              {ruleErrors?.[index]?.namingRule ? (
                <span className="text-[11px] text-red-500 font-medium block mt-1">
                  {ruleErrors[index].namingRule}
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  {t('tours.tasks.namingRuleHint')}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('tours.tasks.allowedExtensionsLabel')} <span className="text-red-500">*</span>
            </label>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_PRESETS.map(ext => {
                const isSelected = rule.allowedExtensions.includes(ext);
                return (
                  <button
                    key={ext}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleTogglePreset(index, ext)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 font-medium'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {ext}
                  </button>
                );
              })}
            </div>

            {/* Active custom tags and input */}
            <div className="flex items-center gap-2 flex-wrap">
              {rule.allowedExtensions
                .filter(ext => !COMMON_PRESETS.includes(ext))
                .map(ext => (
                  <span
                    key={ext}
                    className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium"
                  >
                    {ext}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExt(index, ext)}
                        className="hover:text-indigo-900 cursor-pointer"
                        title={t('tours.tasks.removeExtension')}
                        aria-label={t('tours.tasks.removeExtension')}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}

              {!disabled && (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={customExtInputs[ruleKey] ?? ''}
                    onChange={e =>
                      setCustomExtInputs(prev => ({ ...prev, [ruleKey]: e.target.value }))
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomExt(index, ruleKey);
                      }
                    }}
                    placeholder={t('tours.tasks.customExtensionPlaceholder')}
                    className="text-xs px-2 py-0.5 bg-white border border-gray-300 rounded w-36 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomExt(index, ruleKey)}
                    className="text-xs px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded cursor-pointer"
                    title={t('tours.tasks.addCustomExtension')}
                    aria-label={t('tours.tasks.addCustomExtension')}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>
            {ruleErrors?.[index]?.allowedExtensions && (
              <span className="text-[11px] text-red-500 font-medium block mt-1">
                {ruleErrors[index].allowedExtensions}
              </span>
            )}
          </div>

          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('tours.tasks.maxFileSizeLabel')}
            </label>
            <input
              type="number"
              disabled={disabled}
              value={rule.maxFileSizeMb === 0 ? '' : rule.maxFileSizeMb}
              onChange={e => {
                const val = e.target.value;
                const num = val === '' ? 0 : Number.parseInt(val, 10);
                handleUpdateRule(index, { maxFileSizeMb: Number.isNaN(num) ? 0 : num });
              }}
              className={`w-full text-xs px-2.5 py-1.5 bg-white border rounded focus:outline-none transition-colors ${
                ruleErrors?.[index]?.maxFileSizeMb
                  ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
            {ruleErrors?.[index]?.maxFileSizeMb && (
              <span className="text-[11px] text-red-500 font-medium block mt-1">
                {ruleErrors[index].maxFileSizeMb}
              </span>
            )}
          </div>
        </div>
      );
    })}
  </div>
);
};

export default RequiredFilesBuilder;
