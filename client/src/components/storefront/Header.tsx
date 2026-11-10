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
  onLogoClick,
  initialSearchValue,
}: {
  onSearch?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  collapsibleMobileSearch?: boolean;
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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          {onLogoClick ? (
            <button onClick={onLogoClick} className="flex items-center group focus:outline-none">
              <FreshStockXchangeLogo className="h-12 w-[64px] sm:h-[52px] sm:w-[72px]" />
            </button>
          ) : (
            <Link href="/" className="flex items-center group">
              <FreshStockXchangeLogo className="h-12 w-[64px] sm:h-[52px] sm:w-[72px]" />
            </Link>
          )}
        </div>

        {/* Center: Search bar — desktop only */}
        {showSearchUI && (
          <form onSubmit={handleSubmit} className="flex-1 max-w-md relative hidden sm:block">
            <img src={searchImg} alt="Search" className="header-theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 object-contain z-10" />
            <input
              type="search"
              value={searchValue}
              placeholder="Search fresh seafood, meat & more"
              autoFocus={!!initialSearchValue}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full pl-10 pr-10 h-10 rounded-none bg-transparent border-0 border-b border-[#E8C8AA] focus:border-[#E8883A] focus:outline-none focus:ring-0 text-sm placeholder:text-muted-foreground/70 transition-colors"
              data-testid="input-search-desktop"
            />
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-0.5 rounded-full transition-colors ${isListening ? "animate-pulse" : "hover:opacity-70"}`}
              aria-label={isListening ? "Stop voice search" : "Start voice search"}
              data-testid="button-voice-search-desktop"
            >
              {isListening
                ? <MicOff className="w-4 h-4 text-[#C8651B]" />
                : <img src={micImg} alt="Voice search" className="header-theme-icon w-4 h-4 object-contain" />
              }
            </button>
          </form>
        )}

        {/* Right: Icons */}
        <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          {/* Mobile-only search icon — toggles the search bar below */}
          {showSearchUI && collapsibleMobileSearch && (
            <Button
              variant="ghost"
              size="icon"
              className={`sm:hidden text-foreground hover:bg-accent/10 rounded-full w-9 h-9 transition-colors ${mobileSearchOpen ? "bg-accent/10" : ""}`}
              onClick={() => setMobileSearchOpen(v => !v)}
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              data-testid="button-toggle-mobile-search"
            >
              <img src={searchImg} alt="Search" className="header-theme-icon w-5 h-5 sm:w-6 sm:h-6 object-contain" />
            </Button>
          )}

          {/* Category menu icon */}
          <Button
            variant="ghost"
            size="icon"
            className={`text-foreground hover:bg-accent/10 rounded-full w-9 h-9 transition-colors ${categoryMenuOpen ? "bg-accent/10" : ""}`}
            onClick={() => setCategoryMenuOpen(v => !v)}
            aria-label="Categories"
            data-testid="button-categories"
          >
            <img src={menuIconImg} alt="Categories" className="header-theme-icon w-5 h-5 sm:w-6 sm:h-6 object-contain" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent/10 rounded-full w-9 h-9 relative"
            onClick={handleProfileClick}
            aria-label={customer ? "My Profile" : "Login"}
            data-testid="button-profile"
          >
            <img src={userImg} alt="Profile" className="header-theme-icon w-5 h-5 sm:w-6 sm:h-6 object-contain" />
          </Button>

          <Button
            onClick={() => setIsCartOpen(true)}
            variant="ghost"
            size="icon"
            className="relative text-foreground hover:bg-accent/10 rounded-full w-9 h-9"
            data-testid="button-cart"
          >
            <img src={cartImg} alt="Cart" className="header-theme-icon w-5 h-5 sm:w-6 sm:h-6 object-contain" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#C8651B] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-md animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Location */}
          <button
            onClick={openPicker}
            className="flex items-center pl-2 border-l border-[#E8C8AA] ml-0.5 hover:opacity-70 transition-opacity"
            data-testid="button-location-picker"
            aria-label="Check delivery area"
          >
            <img src={locationImg} alt="Location" className="header-theme-icon w-5 h-5 sm:w-5 sm:h-5 object-contain flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Category mega-menu dropdown */}
      <CategoryMenuDropdown
        open={categoryMenuOpen}
        onClose={() => setCategoryMenuOpen(false)}
      />

      {/* Mobile pill search — below header. In collapsible mode, only visible when toggled. */}
      {showSearchUI && (!collapsibleMobileSearch || mobileSearchOpen) && (
        <div className="sm:hidden px-4 pb-2.5 pt-1 bg-white">
          <form onSubmit={handleSubmit} className="relative">
            <img src={searchImg} alt="Search" className="header-theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 object-contain z-10" />
            <input
              type="search"
              autoFocus={(collapsibleMobileSearch && mobileSearchOpen) || !!initialSearchValue}
              value={searchValue}
              placeholder="Search fresh seafood, meat & more"
              onChange={(e) => handleChange(e.target.value)}
              className="w-full pl-10 pr-10 h-10 rounded-none bg-transparent border-0 border-b border-[#E8C8AA] focus:border-[#E8883A] focus:outline-none focus:ring-0 text-sm placeholder:text-muted-foreground/70 transition-colors"
              data-testid="input-search-mobile"
            />
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-0.5 rounded-full transition-colors ${isListening ? "animate-pulse" : "hover:opacity-70"}`}
              aria-label={isListening ? "Stop voice search" : "Start voice search"}
              data-testid="button-voice-search-mobile"
            >
              {isListening
                ? <MicOff className="w-4 h-4 text-[#C8651B]" />
                : <img src={micImg} alt="Voice search" className="header-theme-icon w-4 h-4 object-contain" />
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
