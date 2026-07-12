"use client";

import { Phone, MessageCircle, Mail, Calendar } from "lucide-react";
import { T } from "../lib/constants";

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function StickyContactBar({ phone, isOwnListing }) {
  if (isOwnListing) return null;

  const digits = (phone || "").replace(/\D/g, "");
  const whatsappNumber = digits.startsWith("0") ? `233${digits.slice(1)}` : digits;

  return (
    <div className="homio-sticky-contact-bar">
      <a href={`tel:${phone}`} className="homio-sticky-btn" aria-label="Call">
        <Phone size={18} />
        <span>Call</span>
      </a>
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="homio-sticky-btn"
        aria-label="WhatsApp"
      >
        <MessageCircle size={18} />
        <span>WhatsApp</span>
      </a>
      <button onClick={() => scrollToSection("enquiry-section")} className="homio-sticky-btn" aria-label="Message">
        <Mail size={18} />
        <span>Message</span>
      </button>
      <button onClick={() => scrollToSection("viewing-section")} className="homio-sticky-btn homio-sticky-btn-primary" aria-label="Book Viewing">
        <Calendar size={18} />
        <span>Book Viewing</span>
      </button>
    </div>
  );
}