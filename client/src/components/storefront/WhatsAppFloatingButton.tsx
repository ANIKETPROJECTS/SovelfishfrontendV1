const WHATSAPP_URL = `https://wa.me/919619590694?text=${encodeURIComponent(
  "Hi Fresh Stock Xchange, I need help with an order.",
)}`;

export function WhatsAppFloatingButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Fresh Stock Xchange on WhatsApp"
      title="Chat with us on WhatsApp"
      data-testid="floating-whatsapp-button"
      className="fixed bottom-3 right-3 z-[45] flex h-12 w-12 items-center justify-center rounded-full bg-transparent p-0 transition duration-200 hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E8883A]/60 sm:bottom-4 sm:right-4"
    >
      <img
        src="/icons/whatsapp.png"
        alt=""
        className="h-full w-full object-contain"
        decoding="async"
      />
    </a>
  );
}
