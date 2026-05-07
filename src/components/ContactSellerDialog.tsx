import { X } from 'lucide-react';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import type { Listing } from '../types';
import { ApiError, sendContact } from '../lib/api';

type ContactSellerDialogProps = {
  listing: Listing | null;
  onClose: () => void;
};

export function ContactSellerDialog({ listing, onClose }: ContactSellerDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [message, setMessage] = useState('');
  const [contactHint, setContactHint] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!listing) return;
    setMessage('');
    setContactHint('');
    setStatus('idle');
    setErrorText(null);
  }, [listing?.id]);

  useEffect(() => {
    if (!listing) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [listing]);

  useEffect(() => {
    if (!listing) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [listing, onClose]);

  if (listing === null) return null;
  const activeListing = listing;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    setErrorText(null);
    try {
      await sendContact({
        listingId: activeListing.id,
        message: message.trim(),
        contactHint: contactHint.trim() || undefined,
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setErrorText('Too many messages sent. Wait a minute and try again.');
        } else if (err.status === 404) {
          setErrorText('That listing is no longer available.');
        } else {
          setErrorText(err.message);
        }
      } else {
        setErrorText('Something went wrong. Try again.');
      }
    }
  }

  function handleBackdropMouseDown(event: React.MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="dialog-backdrop"
      role="dialog"
      onMouseDown={handleBackdropMouseDown}
    >
      <div className="dialog-panel">
        <div className="dialog-head">
          <h2 id={titleId}>Contact seller</h2>
          <button
            ref={closeRef}
            aria-label="Close contact form"
            className="dialog-close"
            type="button"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="dialog-lede">
          {activeListing.title} · {activeListing.artist}
        </p>
        {status === 'success' ? (
          <div className="dialog-success">
            <p>Message sent. The seller will follow up outside the app.</p>
            <button className="contact-button" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className="dialog-form" onSubmit={handleSubmit}>
            <label className="dialog-field">
              <span>Message</span>
              <textarea
                required
                maxLength={2000}
                placeholder="Introduce yourself and propose how you’d like to meet."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <label className="dialog-field">
              <span>Preferred contact (optional)</span>
              <input
                maxLength={500}
                placeholder="Signal username, email, or phone — whatever you’re comfortable sharing."
                type="text"
                value={contactHint}
                onChange={(e) => setContactHint(e.target.value)}
              />
            </label>
            {errorText && (
              <p className="dialog-error" role="alert">
                {errorText}
              </p>
            )}
            <div className="dialog-actions">
              <button className="ghost-button" disabled={status === 'submitting'} type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="contact-button" disabled={status === 'submitting'} type="submit">
                {status === 'submitting' ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
