import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem/MenuItem';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en-US', labelFull: 'English', labelShort: 'En' },
  { code: 'uk-UA', labelFull: 'Українська', labelShort: 'Укр' },
];

interface LangButtonProps {
  className?: string;
  variant?: 'short' | 'full';
}

export default function LangButton({
  className,
  variant = 'full',
}: Readonly<LangButtonProps>): React.ReactElement {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const getCaption = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
    return variant === 'full' ? currentLang.labelFull : currentLang.labelShort;
  };

  return (
    <>
      <button
        className={`${className || ''} flex select-none items-center justify-between ${variant === 'full' ? 'w-[180px]' : ''}`}
        onClick={e => setAnchorEl(anchorEl ? null : e.currentTarget)}
        type="button"
      >
        <span>
          <i className="fa-solid fa-globe"></i>
          <span className="ml-2.5">{getCaption()}</span>
        </span>
        <i className={`fa-solid fa-angle-down dropdown-icon ${anchorEl ? 'open' : ''}`}></i>
      </button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        style={{ width: anchorEl?.clientWidth }}
      >
        {languages.map(lang => (
          <MenuItem
            key={lang.code}
            selected={i18n.language === lang.code}
            onClick={() => {
              i18n.changeLanguage(lang.code);
              setAnchorEl(null);
            }}
          >
            {variant === 'full' ? lang.labelFull : lang.labelShort}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
