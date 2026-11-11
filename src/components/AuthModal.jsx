import React from 'react';
import { createPortal } from 'react-dom';
import AuthExperience from './auth/AuthExperience';

function AuthModal({ onClose, onSuccess, initialTab = 'login', initialEmail = '', contextNote = '' }) {
  return createPortal(
    <div className="ax-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="ax-modal-shell" onClick={(e) => e.stopPropagation()}>
        <AuthExperience
          initialTab={initialTab}
          initialEmail={initialEmail}
          isModal={true}
          contextNote={contextNote}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>,
    document.body
  );
}

export default AuthModal;
