"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckIcon, MessageIcon } from "./Icon";

type Props = {
  certificateId: string;
  certificateUrl: string;
  moduleTitle: string;
};

export function CertificateActions({ certificateId, certificateUrl, moduleTitle }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    window.alert(
      "Fitur unduh PDF/PNG sedang disiapkan — integrasi dengan engine PDF akan aktif di fase produksi."
    );
  };

  const encodedUrl = encodeURIComponent(certificateUrl);
  const encodedTitle = encodeURIComponent(`Saya baru saja menyelesaikan ${moduleTitle} di Senopati Academy`);

  return (
    <div className="certificate-actions">
      <div className="certificate-actions__primary">
        <button type="button" className="button button--primary" onClick={handleDownload}>
          Unduh PDF
          <ArrowRightIcon size={16} />
        </button>
        <button type="button" className="button button--secondary" onClick={handleDownload}>
          Unduh PNG
        </button>
      </div>

      <div className="certificate-actions__share">
        <span className="certificate-actions__label">Bagikan:</span>
        <a
          className="certificate-share certificate-share--linkedin"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          LinkedIn
        </a>
        <a
          className="certificate-share certificate-share--twitter"
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          Twitter / X
        </a>
        <a
          className="certificate-share certificate-share--whatsapp"
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          WhatsApp
        </a>
        <button
          type="button"
          className="certificate-share certificate-share--copy"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <CheckIcon size={14} />
              Tersalin
            </>
          ) : (
            <>Salin Link</>
          )}
        </button>
      </div>

      <div className="certificate-actions__verify">
        <MessageIcon size={14} />
        <span>
          Verifikasi sertifikat kapan saja di <strong>asksenopati.com/verify/{certificateId}</strong>
        </span>
      </div>
    </div>
  );
}
