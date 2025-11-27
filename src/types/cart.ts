export interface CartItem {
    productId: string;
    quantity: number;
    addedAt: number;
}

export interface CartContextType {
    items: CartItem[];
    addToCart: (productId: string, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getItemQuantity: (productId: string) => number;
    isInCart: (productId: string) => boolean;
}