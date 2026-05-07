import { useMutation } from '@tanstack/react-query';
import { Send, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { sendContactRequest } from '../lib/api';
import type { Listing } from '../types';

type ContactSellerDialogProps = {
  listing: Listing;
  onClose: () => void;
};

export function ContactSellerDialog({ listing, onClose }: ContactSellerDialogProps) {
  const [message, setMessage] = useState('');
  const [contactHint, setContactHint] = useState('');
  const contactMutation = useMutation({
    mutationFn: () =>
      sendContactRequest({
        listingId: listing.id,
        message,
        contactHint,
      }),
  });

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    contactMutation.mutate();
  }

  const canSubmit = message.trim().length > 0 && !contactMutation.isPending;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="contact-title"
        aria-modal="true"
        className="contact-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="dialog-close"
          type="button"
          aria-label="Close contact form"
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>

        <p className="section-note">Offline meetup.</p>
        <h2 id="contact-title">Contact seller</h2>
        <p>
          Send a short note about <strong>{listing.title}</strong>. Keep payment and pickup details
          for a safe in-person conversation.
        </p>

        {contactMutation.isSuccess ? (
          <div className="contact-success" role="status">
            <ShieldCheck size={22} aria-hidden="true" />
            <h3>Note sent</h3>
            <p>The seller contact stub accepted your request.</p>
            <button className="contact-button" type="button" onClick={onClose}>
              Back to artwork
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submitContact}>
            <label>
              Message
              <textarea
                maxLength={2000}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about availability, condition, or a public meetup time..."
                required
                rows={6}
                value={message}
              />
            </label>

            <label>
              Contact hint
              <input
                maxLength={500}
                onChange={(event) => setContactHint(event.target.value)}
                placeholder="Email, phone, or social handle"
                value={contactHint}
              />
            </label>

            {contactMutation.isError && (
              <p className="form-error" role="alert">
                Could not send that note. Check the API server and try again.
              </p>
            )}

            <button className="contact-button" type="submit" disabled={!canSubmit}>
              {contactMutation.isPending ? 'Sending...' : 'Send note'}
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
