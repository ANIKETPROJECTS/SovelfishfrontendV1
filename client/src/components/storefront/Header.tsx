import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { useHub } from "@/context/HubContext";
import { Button } from "@/components/ui/button";
import { MicOff } from "lucide-react";
import { CategoryMenuDropdown } from "@/components/storefront/CategoryMenu";
import { OtpModal } from "@/components/storefront/OtpModal";
import { LocationPicker } from "@/components/storefront/LocationPicker";

import { FreshStockXchangeLogo } from "@/components/storefront/FreshStockXchangeLogo";
import searchImg from "@assets/search-interface-symbol_1774706690468.png";
import micImg from "@assets/mic_1778182669857.png";

const cartImg = "/icons/cart.png";
const userImg = "/icons/user.png";
const locationImg = "/icons/location.png";
const menuIconImg = "/icons/category.png";

export function Header({
  onSearch,
  onSearchSubmit,
  collapsibleMobileSearch,
  hideMobileSearch,
  compactMobileHeader,
  onLogoClick,
  initialSearchValue,
}: {
  onSearch?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  collapsibleMobileSearch?: boolean;
  hideMobileSearch?: boolean;
  compactMobileHeader?: boolean;
  onLogoClick?: () => void;
  initialSearchValue?: string;
}) {
  const { totalItems, setIsCartOpen } = useCart();
  const { customer } = useCustomer();
  const { selectedSubHub, selectedSuperHub, openPicker } = useHub();
  const [, navigate] = useLocation();
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSearchValue ?? "");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const showSearchUI = !!(onSearch || onSearchSubmit);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.(searchValue.trim());
  };
  const handleChange = (val: string) => {
    setSearchValue(val);
    onSearch?.(val);
  };

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in your browser. Please try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchValue(transcript);
      onSearch?.(transcript);
    };
    recognition.start();
  }, [isListening, onSearch]);

  const locationLabel = selectedSubHub
    ? selectedSubHub.name
    : selectedSuperHub
    ? selectedSuperHub.name
    : "Select Area";

  const handleProfileClick = () => {
    if (customer) {
      navigate("/profile");
    } else {
      setOtpModalOpen(true);
    }
  };

  return (
    <>
    <header className="footer-wood-bg sticky top-0 z-50 border-b-2 border-white text-white">
      <div className={`max-w-7xl mx-auto ${compactMobileHeader ? "px-2 sm:px-6" : "px-4 max-[380px]:px-2 sm:px-6"} lg:px-8 h-16 sm:h-20 flex items-center justify-between ${compactMobileHeader ? "gap-1 max-[380px]:gap-0.5" : "gap-2 max-[380px]:gap-1"}`}>
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          {onLogoClick ? (
            <button onClick={onLogoClick} className="flex items-center gap-1.5 max-[380px]:gap-1 group focus:outline-none">
              <span className={`flex shrink-0 items-center justify-center rounded-full bg-white p-0.5 ${compactMobileHeader ? "h-10 w-10 sm:h-16 sm:w-16" : "h-12 w-12 sm:h-16 sm:w-16 max-[380px]:h-10 max-[380px]:w-10"}`}>
                <FreshStockXchangeLogo className="h-full w-full scale-[1.18]" />
              </span>
              <span className={`whitespace-nowrap font-display font-bold leading-none text-white ${compactMobileHeader ? "text-[15px] tracking-tight sm:text-2xl md:text-3xl" : "text-lg tracking-normal sm:text-2xl md:text-3xl max-[380px]:text-[15px]"}`}>
                Fresh Stock Xchange
              </span>
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-1.5 max-[380px]:gap-1 group">
              <span className={`flex shrink-0 items-center justify-center rounded-full bg-white p-0.5 ${compactMobileHeader ? "h-10 w-10 sm:h-16 sm:w-16" : "h-12 w-12 sm:h-16 sm:w-16 max-[380px]:h-10 max-[380px]:w-10"}`}>
                <FreshStockXchangeLogo className="h-full w-full scale-[1.18]" />
              </span>
              <span className={`whitespace-nowrap font-display font-bold leading-none text-white ${compactMobileHeader ? "text-[15px] tracking-tight sm:text-2xl md:text-3xl" : "text-lg tracking-normal sm:text-2xl md:text-3xl max-[380px]:text-[15px]"}`}>
                Fresh Stock Xchange
              </span>
            </Link>
          )}
        </div>

        {/* Center: Search bar — desktop only */}
        {showSearchUI && (
          <form onSubmit={handleSubmit} className="flex-1 max-w-md relative hidden sm:block">
            <img src={searchImg} alt="Search" className="header-theme-icon header-search-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 object-contain z-10" />
            <input
              type="search"
              value={searchValue}
              placeholder="Search fresh seafood & more"
              autoFocus={!!initialSearchValue}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full pl-12 pr-12 h-12 rounded-none bg-transparent border-0 border-b border-white focus:border-white focus:outline-none focus:ring-0 text-base text-white placeholder:text-white transition-colors"
              data-testid="input-search-desktop"
            />
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full transition-colors ${isListening ? "animate-pulse" : "hover:opacity-70"}`}
              aria-label={isListening ? "Stop voice search" : "Start voice search"}
              data-testid="button-voice-search-desktop"
            >
              {isListening
                ? <MicOff className="w-5 h-5 text-white" />
                : <img src={micImg} alt="Voice search" className="header-theme-icon header-search-icon w-5 h-5 object-contain" />
              }
            </button>
          </form>
        )}

        {/* Right: Icons */}
        <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          {/* Mobile-only search icon — toggles the search bar below */}
          {showSearchUI && collapsibleMobileSearch && !hideMobileSearch && (
            <Button
              variant="ghost"
              size="icon"
              className={`sm:hidden text-white hover:bg-white/10 rounded-full h-10 w-10 sm:h-11 sm:w-11 max-[380px]:h-9 max-[380px]:w-9 transition-colors ${mobileSearchOpen ? "bg-white/10" : ""}`}
              onClick={() => setMobileSearchOpen(v => !v)}
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              data-testid="button-toggle-mobile-search"
            >
              <img src={searchImg} alt="Search" className="header-theme-icon h-6 w-6 sm:h-7 sm:w-7 max-[380px]:h-5 max-[380px]:w-5 object-contain" />
            </Button>
          )}

          {/* Category menu icon */}
          <Button
            variant="ghost"
            size="icon"
              className={`text-white hover:bg-white/10 rounded-full ${compactMobileHeader ? "h-9 w-9 sm:h-11 sm:w-11" : "h-10 w-10 sm:h-11 sm:w-11 max-[380px]:h-9 max-[380px]:w-9"} transition-colors ${categoryMenuOpen ? "bg-white/10" : ""}`}
            onClick={() => setCategoryMenuOpen(v => !v)}
            aria-label="Categories"
            aria-haspopup="dialog"
            aria-expanded={categoryMenuOpen}
            aria-controls="category-menu-panel"
            data-testid="button-categories"
          >
            <img src={menuIconImg} alt="Categories" className={`header-theme-icon object-contain ${compactMobileHeader ? "h-5 w-5 sm:h-7 sm:w-7" : "h-6 w-6 sm:h-7 sm:w-7 max-[380px]:h-5 max-[380px]:w-5"}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`text-white hover:bg-white/10 rounded-full relative ${compactMobileHeader ? "h-9 w-9 sm:h-11 sm:w-11" : "h-10 w-10 sm:h-11 sm:w-11 max-[380px]:h-9 max-[380px]:w-9"}`}
            onClick={handleProfileClick}
            aria-label={customer ? "My Profile" : "Login"}
            data-testid="button-profile"
          >
            <img src={userImg} alt="Profile" className={`header-theme-icon object-contain ${compactMobileHeader ? "h-5 w-5 sm:h-7 sm:w-7" : "h-6 w-6 sm:h-7 sm:w-7 max-[380px]:h-5 max-[380px]:w-5"}`} />
          </Button>

          <Button
            onClick={() => setIsCartOpen(true)}
            variant="ghost"
            size="icon"
            className={`relative text-white hover:bg-white/10 rounded-full ${compactMobileHeader ? "h-9 w-9 sm:h-11 sm:w-11" : "h-10 w-10 sm:h-11 sm:w-11 max-[380px]:h-9 max-[380px]:w-9"}`}
            data-testid="button-cart"
          >
            <img src={cartImg} alt="Cart" className={`header-theme-icon object-contain ${compactMobileHeader ? "h-5 w-5 sm:h-7 sm:w-7" : "h-6 w-6 sm:h-7 sm:w-7 max-[380px]:h-5 max-[380px]:w-5"}`} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 sm:h-6 sm:w-6 border border-white bg-transparent text-white text-xs font-bold flex items-center justify-center rounded-full animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Location */}
          <button
            onClick={openPicker}
            className={`flex items-center border-l border-white hover:opacity-70 transition-opacity ${compactMobileHeader ? "ml-0 pl-1.5 sm:ml-0.5 sm:pl-2" : "ml-0.5 pl-2 max-[380px]:pl-1.5"}`}
            data-testid="button-location-picker"
            aria-label="Check delivery area"
          >
            <img src={locationImg} alt="Location" className={`header-theme-icon flex-shrink-0 object-contain ${compactMobileHeader ? "h-5 w-5 sm:h-7 sm:w-7" : "h-6 w-6 sm:h-7 sm:w-7 max-[380px]:h-5 max-[380px]:w-5"}`} />
          </button>
        </div>
      </div>

      {/* Category mega-menu dropdown */}
      <CategoryMenuDropdown
        open={categoryMenuOpen}
        onClose={() => setCategoryMenuOpen(false)}
      />

      {/* Mobile pill search — below header. In collapsible mode, only visible when toggled. */}
      {showSearchUI && !hideMobileSearch && (!collapsibleMobileSearch || mobileSearchOpen) && (
        <div className="sm:hidden px-4 pb-3 pt-2 bg-transparent">
          <form onSubmit={handleSubmit} className="relative">
            <img src={searchImg} alt="Search" className="header-theme-icon header-search-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 object-contain z-10" />
            <input
              type="search"
              autoFocus={(collapsibleMobileSearch && mobileSearchOpen) || !!initialSearchValue}
              value={searchValue}
              placeholder="Search fresh seafood & more"
              onChange={(e) => handleChange(e.target.value)}
              className="w-full pl-12 pr-12 h-12 rounded-none bg-transparent border-0 border-b border-white focus:border-white focus:outline-none focus:ring-0 text-base text-white placeholder:text-white transition-colors"
              data-testid="input-search-mobile"
            />
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full transition-colors ${isListening ? "animate-pulse" : "hover:opacity-70"}`}
              aria-label={isListening ? "Stop voice search" : "Start voice search"}
              data-testid="button-voice-search-mobile"
            >
              {isListening
                ? <MicOff className="w-5 h-5 text-white" />
                : <img src={micImg} alt="Voice search" className="header-theme-icon header-search-icon w-5 h-5 object-contain" />
              }
            </button>
          </form>
        </div>
      )}
    </header>

    <OtpModal open={otpModalOpen} onClose={() => setOtpModalOpen(false)} />
    <LocationPicker />
    </>
  );
}
