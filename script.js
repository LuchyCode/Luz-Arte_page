/* ==========================================================
   LUZ & ARTE — BOUTIQUE MACRAMÉ
   Catálogo dinámico + carrito de compras + envío a Google Sheets
   ========================================================== */

/* --------------------------------------------------------
   1) CONFIGURACIÓN — reemplaza esta URL por la de tu propio
      Google Apps Script (ver LEEME.md para el paso a paso).
   -------------------------------------------------------- */
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbx04ih-huRUzIOoPgTH62ruruwRDzoUt3eJiib6n5gTITXj_t1X5daJMgwyuaM0oTU1/exec";

/* --------------------------------------------------------
   2) PALETA DE COLORES DE MARCA
      (usada para los "swatches" de selección de color)
   -------------------------------------------------------- */
const BRAND_COLORS = [
  { id: "RM",   name: "Rojo Magenta",  hex: "#C72451" },
  { id: "LC", name: "Lila Claro",     hex: "#BDA3D0" },
  { id: "RC",   name: "Rosado Claro",      hex: "#E59AB7" },
  { id: "MO",   name: "Marrón Oscuro",      hex: "#322622" },
  { id: "AV",   name: "Amarillo Vivo",       hex: "#FFC814" },
  { id: "Negro",    name: "Negro",hex: "#1C1B20" },
  { id: "AC",    name: "Azul Celeste",hex: "#45B8CD" },
  { id: "MF",    name: "Morado Fuerte",hex: "#5C3278" },
  { id: "Beige",    name: "Beige",hex: "#EAD1A8" },
  { id: "AR",    name: "Azul Rey",hex: "#1B44BA" },
  { id: "Blanco",    name: "Blanco",hex: "#ECEEEF" },
  { id: "VE",    name: "Verde Esmeralda",hex: "#209E48" },
  { id: "AP",    name: "Amarillo Pastel",hex: "#F8CF4A" },
  { id: "Dorado",    name: "Dorado",hex: "#C29F43" },
  { id: "GP",    name: "Gris Plata",hex: "#B7BAC0" },
];

/* --------------------------------------------------------
   2.1) FOTO DE LA CREADORA (sección "Nosotros")
      - Deja "" para mostrar el marcador de posición.
      - Cuando tengas la foto, escribe la ruta,
        por ejemplo: "images/fundadora.jpg"
   -------------------------------------------------------- */


/* --------------------------------------------------------
   3) CATÁLOGO DE PRODUCTOS
      - "image": deja "" para mostrar el marcador de posición.
        Cuando tengas las fotos reales, escribe la ruta,
        por ejemplo: "images/brisa.jpg"
      - "colors": lista de ids de BRAND_COLORS disponibles
        para ese modelo (puedes usar todos o solo algunos)
   -------------------------------------------------------- */
const PRODUCTS = [
  {
    id: "brisa",
    name: "Orgullo e Identidad",
    desc: "Juego de anillo y Brazalete tricolor. Un homenaje a las raíces y al sentimiento que nos define.",
    price: 24999,
    tag: "Más vendida",
    image: "images/6.jpeg",
    colors: ["AV","AR","RM"],
  },
  {
    id: "raiz",
    name: "Destello Marfil",
    desc: "Elegancia serena inspirada en la pureza de la luz.",
    price: 19999,
    tag: "Nuevo",
    image: "images/destello_marfil.jpg",
    colors: ["Negro", "AR", "MO", "MF", "RM","VE", "Dorado","AC", "LC","RC", "GP","AV", "AP","Beige", "Blanco"],
  },
  {
    id: "aurora",
    name: "Hiedra Astral",
    desc: "Un abrazo de la naturaleza conectado con la energía del cosmos.",
    price: 19999,
    tag: "",
    image: "images/hiedra_astral.jpg",
    colors: ["Negro", "AR", "MO", "MF", "RM","VE", "Dorado","AC", "LC","RC", "GP","AV", "AP","Beige", "Blanco"],
  },
  {
    id: "nudo-eterno",
    name: "Genciana",
    desc: "Misterio nocturno e intensidad botánica.",
    price: 19999,
    tag: "",
    image: "images/genciana.jpg",
    colors: ["Negro", "AR", "MO", "MF", "RM","VE", "Dorado","AC", "LC","RC", "GP","AV", "AP","Beige", "Blanco"],
  },
  {
    id: "cascada",
    name: "Corona Perlada",
    desc: "Un equilibrio perfecto entre misterio, luz y distinción.",
    price: 9999,
    tag: "Edición Luz & Arte",
    image: "images/corona_perlada.jpg",
    colors: ["Negro", "AR", "MO", "MF", "RM","VE", "Dorado","AC", "LC","RC", "GP","AV", "AP","Beige", "Blanco"],
  },
  {
    id: "alma-tejida",
    name: "Enlace de Fe",
    desc: "Espiritualidad, origen y trabajo artesanal en perfecta armonía.",
    price: 7999,
    tag: "",
    image: "images/enlace_de_fe.jpg",
    colors: ["Negro", "AR", "MO", "MF", "RM","VE", "Dorado","AC", "LC","RC", "GP","AV", "AP","Beige", "Blanco"],
  },
];

/* --------------------------------------------------------
   ESTADO
   -------------------------------------------------------- */
let cart = []; // { productId, name, price, colorId, colorName, colorHex, qty }

const fmtCOP = (n) =>
  "$" + Math.round(n).toLocaleString("es-CO");

/* --------------------------------------------------------
   RENDER DEL CATÁLOGO
   -------------------------------------------------------- */
const catalogGrid = document.getElementById("catalogGrid");
const cardTemplate = document.getElementById("productCardTemplate");

function colorById(id) {
  return BRAND_COLORS.find((c) => c.id === id);
}

function renderCatalog() {
  PRODUCTS.forEach((product) => {
    const node = cardTemplate.content.cloneNode(true);
    const card = node.querySelector(".product-card");
    card.dataset.id = product.id;

    // Imagen o marcador de posición
    const imageWrap = node.querySelector(".product-image");
    if (product.image) {
      imageWrap.classList.remove("placeholder");
      imageWrap.innerHTML = `<img src="${product.image}" alt="Manilla ${product.name}">`;
    }

    // Etiqueta (ej. "Nuevo")
    const tagEl = node.querySelector(".product-tag");
    if (product.tag) {
      tagEl.textContent = product.tag;
      tagEl.classList.add("show");
    }

    node.querySelector(".product-name").textContent = product.name;
    node.querySelector(".product-desc").textContent = product.desc;
    node.querySelector(".product-price").textContent = fmtCOP(product.price);

    // Swatches de color
    const swatchWrap = node.querySelector(".swatches");
    product.colors.forEach((colorId, i) => {
      const color = colorById(colorId);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch" + (i === 0 ? " selected" : "");
      btn.style.background = color.hex;
      btn.title = color.name;
      btn.dataset.colorId = color.id;
      btn.setAttribute("aria-label", "Color " + color.name);
      swatchWrap.appendChild(btn);
    });

    // Estado inicial de selección
    card.dataset.selectedColor = product.colors[0];
    card.dataset.qty = "1";

    catalogGrid.appendChild(node);
  });

  // Delegación de eventos para toda la grilla
  catalogGrid.addEventListener("click", handleCatalogClick);

  // Animación de aparición al hacer scroll
  observeCards();
}

function handleCatalogClick(e) {
  const card = e.target.closest(".product-card");
  if (!card) return;
  const productId = card.dataset.id;
  const product = PRODUCTS.find((p) => p.id === productId);

  // Selección de color
  if (e.target.classList.contains("swatch")) {
    card
      .querySelectorAll(".swatch")
      .forEach((s) => s.classList.remove("selected"));
    e.target.classList.add("selected");
    card.dataset.selectedColor = e.target.dataset.colorId;
    return;
  }

  // Cantidad
  const qtyEl = card.querySelector(".qty-value");
  let qty = parseInt(card.dataset.qty, 10);
  if (e.target.classList.contains("qty-plus")) {
    qty = Math.min(qty + 1, 20);
  } else if (e.target.classList.contains("qty-minus")) {
    qty = Math.max(qty - 1, 1);
  }
  card.dataset.qty = String(qty);
  qtyEl.textContent = qty;

  // Añadir al pedido
  if (e.target.classList.contains("btn-add")) {
    const colorId = card.dataset.selectedColor;
    const color = colorById(colorId);
    addToCart(product, color, qty);

    e.target.textContent = "Añadido ✓";
    e.target.classList.add("added");
    setTimeout(() => {
      e.target.textContent = "Añadir al pedido";
      e.target.classList.remove("added");
    }, 1400);
  }
}

/* Animación simple de aparición al hacer scroll (un solo tipo de gesto,
   no se repite en cada sección para no saturar de movimiento la página) */
function observeCards() {
  const cards = document.querySelectorAll(".product-card");
  if (!("IntersectionObserver" in window)) {
    cards.forEach((c) => c.classList.add("in-view"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  cards.forEach((c) => io.observe(c));
}

/* --------------------------------------------------------
   CARRITO
   -------------------------------------------------------- */
const cartOverlay = document.getElementById("cartOverlay");
const cartPanel = document.getElementById("cartPanel");
const cartBtn = document.getElementById("cartBtn");
const cartClose = document.getElementById("cartClose");
const cartCount = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartEmptyBtn = document.getElementById("cartEmptyBtn");
const cartTotalEl = document.getElementById("cartTotal");

function addToCart(product, color, qty) {
  const existing = cart.find(
    (item) => item.productId === product.id && item.colorId === color.id
  );
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      colorId: color.id,
      colorName: color.name,
      colorHex: color.hex,
      qty,
    });
  }
  renderCart();
  openCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function changeQty(index, delta) {
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  cartItemsEl.innerHTML = "";

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = totalItems;
  cartCount.classList.toggle("show", totalItems > 0);

  cartEmpty.style.display = cart.length ? "none" : "block";
  cartItemsEl.style.display = cart.length ? "flex" : "none";

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <span class="cart-item-color" style="background:${item.colorHex}"></span>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-meta">Color: ${item.colorName}</p>
        <div class="cart-item-row">
          <div class="cart-item-qty">
            <button type="button" data-action="minus">−</button>
            <span>${item.qty}</span>
            <button type="button" data-action="plus">+</button>
          </div>
          <span class="cart-item-price">${fmtCOP(item.price * item.qty)}</span>
        </div>
        <button type="button" class="cart-item-remove" data-action="remove">Quitar</button>
      </div>
    `;
    li.querySelector('[data-action="plus"]').addEventListener("click", () =>
      changeQty(index, 1)
    );
    li.querySelector('[data-action="minus"]').addEventListener("click", () =>
      changeQty(index, -1)
    );
    li.querySelector('[data-action="remove"]').addEventListener("click", () =>
      removeFromCart(index)
    );
    cartItemsEl.appendChild(li);
  });

  cartTotalEl.textContent = fmtCOP(cartTotal());
}

function openCart() {
  cartOverlay.classList.add("open");
  cartPanel.classList.add("open");
}
function closeCart() {
  cartOverlay.classList.remove("open");
  cartPanel.classList.remove("open");
}

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
cartEmptyBtn.addEventListener("click", closeCart);

/* --------------------------------------------------------
   ENVÍO DEL PEDIDO A GOOGLE SHEETS
   -------------------------------------------------------- */
const submitOrderBtn = document.getElementById("submitOrder");

/* Estilo base compartido para todas las alertas, así se ven acorde
   a la marca (colores, tipografía) en lugar del azul por defecto. */
const swalBrand = {
  confirmButtonColor: "#1D2444", // navy
  cancelButtonColor: "#6B4D7A", // purple
  color: "#1A1A23",
  background: "#F7F4EF",
  fontFamily: "Jost, sans-serif",
};

submitOrderBtn.addEventListener("click", async () => {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const city = document.getElementById("custCity").value.trim();
    const comment = document.getElementById("orderComment").value.trim();       

  if (!cart.length) {
    Swal.fire({
      ...swalBrand,
      icon: "info",
      title: "Tu carrito está vacío",
      text: "Añade al menos una manilla antes de enviar tu pedido.",
      confirmButtonText: "Ver catálogo",
    }).then((res) => {
      if (res.isConfirmed) closeCart();
    });
    return;
  }
  if (!name || !phone) {
    Swal.fire({
      ...swalBrand,
      icon: "warning",
      title: "Faltan algunos datos",
      text: "Por favor completa tu nombre y tus fuentes de contacto.",
      confirmButtonText: "Entendido",
    });
    return;
  }

  // Resumen del pedido para que el cliente confirme antes de enviarlo
  const itemsHtml = cart
    .map(
      (i) =>
        `<div style="display:flex;justify-content:space-between;gap:.8rem;padding:.35rem 0;border-bottom:1px solid rgba(26,26,35,.1);font-size:.92rem;">
          <span>${i.qty} × ${i.name} <span style="color:#6B4D7A;">(${i.colorName})</span></span>
          <span>${fmtCOP(i.price * i.qty)}</span>
        </div>`
    )
    .join("");

  const confirmResult = await Swal.fire({
    ...swalBrand,
    title: "Confirma tu pedido",
    html: `
      <div style="text-align:left;margin-top:.5rem;">
        ${itemsHtml}
        <div style="display:flex;justify-content:space-between;padding-top:.7rem;margin-top:.4rem;font-weight:600;color:#1D2444;">
          <span>Total</span><span>${fmtCOP(cartTotal())}</span>
        </div>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, enviar pedido",
    cancelButtonText: "Revisar de nuevo",
  });

  if (!confirmResult.isConfirmed) return;

  const payload = {
    fecha: new Date().toLocaleString("es-CO"),
    cliente: name,
    telefono: phone,
    ciudad: city,
    comentario: comment,
    total: cartTotal(),
    pedido: cart.map((i) => ({
        modelo: i.name,
        color: i.colorName,
        cantidad: i.qty,
        precioUnitario: i.price,
        subtotal: i.price * i.qty,
    })),
    };

  submitOrderBtn.disabled = true;
  submitOrderBtn.textContent = "Enviando…";

  Swal.fire({
    ...swalBrand,
    title: "Enviando tu pedido…",
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    if (GOOGLE_SHEETS_URL.startsWith("PEGA_AQUI")) {
      // Aún no se ha conectado Google Sheets: se avisa en consola
      // para que el equipo técnico configure la URL (ver LEEME.md).
      console.warn(
        "GOOGLE_SHEETS_URL no configurada. El pedido no se envió a Sheets:",
        payload
      );
      throw new Error("NOT_CONFIGURED");
    }

    // Apps Script no maneja bien las peticiones "preflight" de CORS,
    // por eso se envía como texto plano (evita el preflight OPTIONS).
    await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    cart = [];
    renderCart();
    document.getElementById("orderComment").value = "";
    document.getElementById("custName").value = "";
    document.getElementById("custPhone").value = "";
    document.getElementById("custCity").value = "";
    

    await Swal.fire({
      ...swalBrand,
      icon: "success",
      title: "¡Pedido enviado!",
      text: `Gracias ${name}, te contactaremos muy pronto por WhatsApp para confirmar los detalles.`,
      confirmButtonText: "Perfecto",
    });
    closeCart();
  } catch (err) {
    if (err.message === "NOT_CONFIGURED") {
      Swal.fire({
        ...swalBrand,
        icon: "warning",
        title: "Falta un paso",
        text: "Tu pedido quedó listo, pero aún falta conectar Google Sheets. Revisa el archivo LEEME.md.",
        confirmButtonText: "Entendido",
      });
    } else {
      Swal.fire({
        ...swalBrand,
        icon: "error",
        title: "No se pudo enviar",
        text: "Hubo un problema al enviar tu pedido. Intenta de nuevo o escríbenos por Instagram.",
        confirmButtonText: "Entendido",
      });
    }
  } finally {
    submitOrderBtn.disabled = false;
    submitOrderBtn.textContent = "Enviar pedido";
  }
});

/* --------------------------------------------------------
   MENÚ MÓVIL
   -------------------------------------------------------- */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);

/* --------------------------------------------------------
   INICIALIZACIÓN
   -------------------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear();
renderCatalog();
renderAboutPhoto();
renderCart();