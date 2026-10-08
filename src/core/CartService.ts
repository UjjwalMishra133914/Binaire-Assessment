type Listener = () => void;
export interface CartItem { id: number; title: string; price: number; image: string | null }


export class CartService {
  private static instance: CartService;
  static get(): CartService { return (this.instance ??= new CartService()); }

  private listeners = new Set<Listener>();
  private cart: CartItem[] = this.load("Steam:cart");
  private wishlist: number[] = this.load("Steam:wishlist");
  private version = 0;

  private constructor() {
    window.addEventListener("storage", (e) => {
      if (e.key === "Steam:cart") this.cart = this.load(e.key);
      else if (e.key === "Steam:wishlist") this.wishlist = this.load(e.key);
      else return;
      this.emit();
    });
  }

  private load<T>(key: string): T[] {
    try { return JSON.parse(localStorage.getItem(key) ?? "[]") as T[]; } catch { return []; }
  }
  private save() {
    try {
      localStorage.setItem("Steam:cart", JSON.stringify(this.cart));
      localStorage.setItem("Steam:wishlist", JSON.stringify(this.wishlist));
    } catch { /* quota */ }
    this.emit();
  }
  private emit() { this.version++; this.listeners.forEach((l) => l()); }

  get items(): readonly CartItem[] { return this.cart; }
  get total() { return this.cart.reduce((s, i) => s + i.price, 0); }
  inCart(id: number) { return this.cart.some((i) => i.id === id); }
  add(item: CartItem) { if (!this.inCart(item.id)) { this.cart = [...this.cart, item]; this.save(); } }
  remove(id: number) { this.cart = this.cart.filter((i) => i.id !== id); this.save(); }
  clear() { this.cart = []; this.save(); }

  get wishlistCount() { return this.wishlist.length; }
  get wishlistIds(): readonly number[] { return this.wishlist; }
  wished(id: number) { return this.wishlist.includes(id); }
  toggleWish(id: number) {
    this.wishlist = this.wished(id) ? this.wishlist.filter((w) => w !== id) : [...this.wishlist, id];
    this.save();
  }

  subscribe = (l: Listener) => { this.listeners.add(l); return () => { this.listeners.delete(l); }; };
  getSnapshot = () => this.version;
}
