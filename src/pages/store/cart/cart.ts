// src/pages/store/cart/cart.ts

import type { CartItem } from "../../../types/product";
import { checkAuhtUser, logout } from "../../../utils/auth";

// ─── AUTENTICACIÓN ──────────────────────────────────────────
// Si no hay sesión activa → redirige al login
const initPage = () => {
    checkAuhtUser(
        "/src/pages/auth/login/login.html",  // sin sesión → login
        "/src/pages/auth/login/login.html",  // rol incorrecto → login
        "client"                             // rol requerido
    );
};
initPage();

// Botón logout
const logoutButton = document.getElementById("logoutButton") as HTMLButtonElement;
logoutButton?.addEventListener("click", () => {
    logout();
});

// ─── CONSTANTE DE CLAVE DEL CARRITO ────────────────────────
const CART_KEY = "foodstore_cart";

// ─── ELEMENTOS DEL DOM ─────────────────────────────────────
const cartItemsContainer = document.getElementById("cart-items") as HTMLDivElement;
const cartSummaryContainer = document.getElementById("cart-summary") as HTMLDivElement;

// ─── LEER Y GUARDAR CARRITO ────────────────────────────────
function getCart(): CartItem[] {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveCart(cart: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ─── EMOJI POR NOMBRE DE PRODUCTO ──────────────────────────
function getEmoji(nombre: string): string {
    const lower = nombre.toLowerCase();
    if (lower.includes("pizza")) return "🍕";
    if (lower.includes("hambur")) return "🍔";
    if (lower.includes("coca") || lower.includes("gaseosa")) return "🥤";
    if (lower.includes("jugo")) return "🧃";
    if (lower.includes("agua")) return "💧";
    if (lower.includes("torta") || lower.includes("brownie")) return "🍰";
    if (lower.includes("helado")) return "🍦";
    if (lower.includes("empanada")) return "🥟";
    if (lower.includes("ensalada")) return "🥗";
    return "🍽️";
}

// ─── FORMATEAR PRECIO ──────────────────────────────────────
function formatPrice(value: number): string {
    return value.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
    });
}

// ─── ACTUALIZAR CANTIDAD ────────────────────────────────────
function updateQuantity(id: number, delta: number): void {
    let cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
        cart = cart.filter((i) => i.id !== id);
    }

    saveCart(cart);
    renderCart();
}

// ─── ELIMINAR ÍTEM ──────────────────────────────────────────
function removeItem(id: number): void {
    const cart = getCart().filter((i) => i.id !== id);
    saveCart(cart);
    renderCart();
}

// ─── VACIAR CARRITO ─────────────────────────────────────────
function clearCart(): void {
    localStorage.removeItem(CART_KEY);
    renderCart();
}

// ─── CALCULAR TOTAL ─────────────────────────────────────────
function calcTotal(cart: CartItem[]): number {
    return cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

// ─── HTML DE UN ÍTEM ───────────────────────────────────────
function createCartItemHTML(item: CartItem): string {
    const subtotal = item.precio * item.cantidad;
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-emoji">${getEmoji(item.nombre)}</div>
            <div class="item-info">
                <span class="item-name">${item.nombre}</span>
                <span class="item-price">${formatPrice(item.precio)} c/u</span>
            </div>
            <div class="qty-controls">
                <button class="qty-btn btn-minus" data-id="${item.id}">−</button>
                <span class="qty-value">${item.cantidad}</span>
                <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
            </div>
            <span class="item-subtotal">${formatPrice(subtotal)}</span>
            <button class="remove-btn" data-id="${item.id}">🗑️</button>
        </div>
    `;
}

// ─── HTML DEL RESUMEN ───────────────────────────────────────
function createSummaryHTML(cart: CartItem[]): string {
    const total = calcTotal(cart);
    const cantidadItems = cart.reduce((acc, i) => acc + i.cantidad, 0);
    return `
        <div class="cart-summary">
            <div class="summary-row">
                <span>Productos</span>
                <span>${cantidadItems} ítem${cantidadItems !== 1 ? "s" : ""}</span>
            </div>
            <div class="summary-total">
                <span>Total</span>
                <span class="total-amount">${formatPrice(total)}</span>
            </div>
        </div>
        <button class="clear-btn" id="clear-btn">🗑️ Vaciar carrito</button>
    `;
}

// ─── HTML DE CARRITO VACÍO ──────────────────────────────────
function createEmptyCartHTML(): string {
    return `
        <div class="empty-cart">
            <p>Tu carrito está vacío.</p>
            <a href="../home/home.html" class="go-store-btn">Ver catálogo</a>
        </div>
    `;
}

// ─── RENDER PRINCIPAL ───────────────────────────────────────
function renderCart(): void {
    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = createEmptyCartHTML();
        cartSummaryContainer.innerHTML = "";
        return;
    }

    cartItemsContainer.innerHTML = cart.map(createCartItemHTML).join("");
    cartSummaryContainer.innerHTML = createSummaryHTML(cart);

    cartItemsContainer.querySelectorAll<HTMLButtonElement>(".btn-minus").forEach((btn) => {
        btn.addEventListener("click", () => updateQuantity(Number(btn.dataset.id), -1));
    });

    cartItemsContainer.querySelectorAll<HTMLButtonElement>(".btn-plus").forEach((btn) => {
        btn.addEventListener("click", () => updateQuantity(Number(btn.dataset.id), +1));
    });

    cartItemsContainer.querySelectorAll<HTMLButtonElement>(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", () => removeItem(Number(btn.dataset.id)));
    });

    document.getElementById("clear-btn")?.addEventListener("click", clearCart);
}

// ─── INICIALIZACIÓN ─────────────────────────────────────────
renderCart();