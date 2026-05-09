import { PRODUCTS, getCategories } from "../../../data/data";
import type { Product } from "../../../types/product";
import type { CartItem } from "../../../types/product";
import { logout } from "../../../utils/auth";
import { getUSer } from "../../../utils/localStorage";

// Verificamos manualmente que haya una sesión activa.
const initPage = () => {
    const userJson = getUSer();
    if (!userJson) {
        // Si no hay sesión ir a login
        window.location.href = "/src/pages/auth/login/login.html";
        return;
    }
};
initPage();

// Botón logout
const logoutButton = document.getElementById("logoutButton") as HTMLButtonElement;
logoutButton?.addEventListener("click", () => {
    logout();
});

//  CONSTANTE DE CLAVE DEL CARRITO 
const CART_KEY = "foodstore_cart";

//  ELEMENTOS DEL DOM 
const grid = document.getElementById("products-grid") as HTMLDivElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const categoriesList = document.getElementById("categories-list") as HTMLDivElement;
const cartCount = document.getElementById("cart-count") as HTMLSpanElement;
const toast = document.getElementById("toast") as HTMLDivElement;

//  ESTADO 
let categoriaActiva: number | null = null;

// emoticones para las categorrias
function getEmoji(nombreCategoria: string): string {
    const emojis: Record<string, string> = {
        Pizzas: "🍕",
        Hamburguesas: "🍔",
        Bebidas: "🥤",
        Postres: "🍰",
        Empanadas: "🥟",
        Ensaladas: "🥗",
    };
    return emojis[nombreCategoria] ?? "🍽️";
}

//LEER CARRITO
function getCart(): CartItem[] {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
}

//GUARDAR CARRITO
function saveCart(cart: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

//ACTUALIZAR CONTADOR DEL HEADER
function updateCartCount(): void {
    const cart = getCart();
    const total = cart.reduce((acc, item) => acc + item.cantidad, 0);
    if (total > 0) {
        cartCount.textContent = String(total);
        cartCount.classList.add("visible");
    } else {
        cartCount.classList.remove("visible");
    }
}

//AGREGAR AL CARRITO
function addToCart(product: Product): void {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
    if (existing.cantidad >= product.stock) {
        alert(`Solo hay ${product.stock} unidades disponibles.`);
        return;
    }
    existing.cantidad += 1;
    } else {
        const newItem: CartItem = {
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            cantidad: 1,
            imagen: product.imagen,
            stock: product.stock,
        };
        cart.push(newItem);
    }

    saveCart(cart);
    updateCartCount();
    showToast();
}

// MOSTRAR TOAST
function showToast(): void {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

//TARJETA DE PRODUCTO
function createProductCard(product: Product): string {
    const categoria = product.categorias[0]?.nombre ?? "";
    const emoji = getEmoji(categoria);
    const precio = product.precio.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
    });
    const sinStock = !product.disponible || product.stock === 0;

    return `
        <div class="product-card">
            <div class="card-img">${emoji}</div>
            <div class="card-body">
                <span class="card-category">${categoria}</span>
                <h3 class="card-name">${product.nombre}</h3>
                <p class="card-desc">${product.descripcion}</p>
            </div>
            <div class="card-footer">
                <span class="card-price">${precio}</span>
                <button
                    class="add-btn"
                    data-id="${product.id}"
                    ${sinStock ? "disabled" : ""}
                >${sinStock ? "Sin stock" : "Agregar"}</button>
            </div>
        </div>
    `;
}

// PRODUCTOS
function renderProducts(products: Product[]): void {
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>🔍 No se encontraron productos.</p>
            </div>
        `;
        return;
    }


    grid.innerHTML = products.map(createProductCard).join("");

    grid.querySelectorAll<HTMLButtonElement>(".add-btn:not([disabled])").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const product = PRODUCTS.find((p) => p.id === id);
            if (product) addToCart(product);
        });
    });
}

// OBTENER PRODUCTOS FILTRADOS
function getFilteredProducts(): Product[] {
    const searchText = searchInput.value.toLowerCase().trim();

    return PRODUCTS.filter((product) => {
        const matchesSearch =
            searchText === "" ||
            product.nombre.toLowerCase().includes(searchText);

        const matchesCategory =
            categoriaActiva === null ||
            product.categorias.some((c) => c.id === categoriaActiva);

        return matchesSearch && matchesCategory;
    });
}

// CATEGORÍAS
function renderCategories(): void {
    const categories = getCategories();

    const allBtn = document.createElement("button");
    allBtn.className = "category-btn active";
    allBtn.textContent = "🍽️ Todas";
    allBtn.addEventListener("click", () => {
        categoriaActiva = null;
        setActiveCategory(allBtn);
        renderProducts(getFilteredProducts());
    });
    categoriesList.appendChild(allBtn);

    categories.forEach((cat) => {
        const btn = document.createElement("button");
        btn.className = "category-btn";
        btn.textContent = `${getEmoji(cat.nombre)} ${cat.nombre}`;
        btn.addEventListener("click", () => {
            categoriaActiva = cat.id;
            setActiveCategory(btn);
            renderProducts(getFilteredProducts());
        });
        categoriesList.appendChild(btn);
    });
}

function setActiveCategory(activeBtn: HTMLButtonElement): void {
    categoriesList
        .querySelectorAll<HTMLButtonElement>(".category-btn")
        .forEach((btn) => btn.classList.remove("active"));
    activeBtn.classList.add("active");
}

// BUSQUEDA EN TIEMPO REAL
searchInput.addEventListener("input", () => {
    renderProducts(getFilteredProducts());
});

renderCategories();
renderProducts(PRODUCTS);
updateCartCount();