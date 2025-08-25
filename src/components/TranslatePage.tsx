import React from 'react';
import TranslationForm from './TranslationForm';

const TranslatePage = () => {
  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  return <TranslationForm onBack={handleBack} />;
};

export default TranslatePage;