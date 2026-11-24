document.addEventListener('DOMContentLoaded', function () {
    /* =========================================================
       1. MENÚ HAMBURGUESA INTERACTIVO PARA VERSIÓN MÓVIL
       ========================================================= */
    const siteHeader = document.querySelector('.site-header');
    const mainNav = document.querySelector('.main-nav');

    if (siteHeader && mainNav) {
        let menuBtn = document.getElementById('menuToggle');
        if (!menuBtn) {
            menuBtn = document.createElement('button');
            menuBtn.type = 'button';
            menuBtn.id = 'menuToggle';
            menuBtn.className = 'menu-toggle';
            menuBtn.setAttribute('aria-label', 'Abrir menú de navegación');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.innerHTML = '<span></span><span></span><span></span>';
            siteHeader.insertBefore(menuBtn, mainNav);
        }

        menuBtn.addEventListener('click', function () {
            const abierto = mainNav.classList.toggle('nav-open');
            menuBtn.classList.toggle('is-active', abierto);
            menuBtn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        });

        mainNav.querySelectorAll('a').forEach(enlace => {
            enlace.addEventListener('click', function () {
                mainNav.classList.remove('nav-open');
                menuBtn.classList.remove('is-active');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* =========================================================
       2. CARRITO DE COMPRAS (productos.html y contacto.html)
       ========================================================= */
    const STORAGE_KEY = 'sweetCakesPedido';

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    function money(value) {
        return Number(value).toFixed(2);
    }

    // Botones "Agregar al pedido" en productos.html
    const addButtons = document.querySelectorAll('.add-to-cart');
    if (addButtons.length > 0) {
        function updateCartButton() {
            let bar = document.getElementById('cart-bar');
            if (!bar) {
                bar = document.createElement('a');
                bar.id = 'cart-bar';
                bar.href = 'contacto.html';
                bar.style.cssText = 'position:fixed;right:22px;bottom:22px;z-index:999;background:#7d1f35;color:#fff;padding:14px 20px;border-radius:30px;text-decoration:none;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,.25);';
                document.body.appendChild(bar);
            }
            const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
            bar.textContent = count ? ' Ver pedido (' + count + ')' : ' Ver pedido';
        }

        addButtons.forEach(button => {
            button.addEventListener('click', function () {
                const name = this.dataset.product;
                const price = Number(this.dataset.price);
                const cart = getCart();
                const existing = cart.find(item => item.name === name && Number(item.price) === price);

                if (existing) existing.quantity += 1;
                else cart.push({ name, price, quantity: 1 });

                saveCart(cart);
                updateCartButton();

                const original = this.textContent;
                this.textContent = '✓ Agregado';
                setTimeout(() => { this.textContent = original; }, 1000);
            });
        });

        updateCartButton();
    }

    /* =========================================================
       3. VALIDACIÓN JS COMPLETA Y ENVÍO EN contacto.html
       ========================================================= */
    const orderForm = document.getElementById('orderForm');
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');

    if (orderForm && cartList && cartTotal) {
        function renderCart() {
            const cart = getCart();
            cartList.innerHTML = '';
            let total = 0;

            if (cart.length === 0) {
                cartList.innerHTML = '<p class="empty-msg">No has agregado productos. Ve al catálogo para elegir lo que quieres comprar.</p>';
                cartTotal.textContent = '0.00';
                return;
            }

            cart.forEach((item, index) => {
                const subtotal = Number(item.price) * Number(item.quantity);
                total += subtotal;

                const row = document.createElement('div');
                row.className = 'cart-item';
                row.innerHTML = `
                    <div>
                        <strong>${item.name}</strong><br>
                        <span>$${money(item.price)} MXN c/u</span>
                    </div>
                    <div class="cart-controls">
                        <button type="button" data-action="minus" data-index="${index}">−</button>
                        <span>Cantidad: ${item.quantity}</span>
                        <button type="button" data-action="plus" data-index="${index}">+</button>
                        <button type="button" class="btn-remove" data-action="remove" data-index="${index}">Eliminar</button>
                    </div>
                `;
                cartList.appendChild(row);
            });

            cartTotal.textContent = money(total);
        }

        cartList.addEventListener('click', function (event) {
            const button = event.target.closest('button[data-action]');
            if (!button) return;

            const index = Number(button.dataset.index);
            const action = button.dataset.action;
            const cart = getCart();

            if (!cart[index]) return;

            if (action === 'plus') cart[index].quantity += 1;
            if (action === 'minus') {
                cart[index].quantity -= 1;
                if (cart[index].quantity <= 0) cart.splice(index, 1);
            }
            if (action === 'remove') cart.splice(index, 1);

            saveCart(cart);
            renderCart();
        });

        function mostrarErrorCampo(input, mensaje) {
            input.classList.add('input-error');
            input.classList.remove('input-valid');
            let msgEl = input.nextElementSibling;
            if (!msgEl || !msgEl.classList.contains('error-text')) {
                msgEl = document.createElement('small');
                msgEl.className = 'error-text';
                input.insertAdjacentElement('afterend', msgEl);
            }
            msgEl.textContent = mensaje;
        }

        function limpiarErrorCampo(input) {
            input.classList.remove('input-error');
            input.classList.add('input-valid');
            const msgEl = input.nextElementSibling;
            if (msgEl && msgEl.classList.contains('error-text')) {
                msgEl.remove();
            }
        }

        const inputNombre = document.getElementById('nombre');
        const inputTelefono = document.getElementById('telefono');
        const inputFecha = document.getElementById('fecha');
        const selectEntrega = document.getElementById('entrega');
        const inputEspecificaciones = document.getElementById('especificaciones');

        function validarFormulario() {
            let esValido = true;

            const valorNombre = inputNombre.value.trim();
            if (valorNombre.length < 3 || !/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(valorNombre)) {
                mostrarErrorCampo(inputNombre, 'Ingresa un nombre válido (mínimo 3 letras, sin números).');
                esValido = false;
            } else {
                limpiarErrorCampo(inputNombre);
            }

            const valorTel = inputTelefono.value.trim();
            if (!/^[0-9]{10}$/.test(valorTel)) {
                mostrarErrorCampo(inputTelefono, 'El teléfono debe contener exactamente 10 dígitos numéricos.');
                esValido = false;
            } else {
                limpiarErrorCampo(inputTelefono);
            }

            const valorFecha = inputFecha.value;
            const hoy = new Date().toISOString().split('T')[0];
            if (!valorFecha) {
                mostrarErrorCampo(inputFecha, 'Selecciona una fecha de entrega.');
                esValido = false;
            } else if (valorFecha < hoy) {
                mostrarErrorCampo(inputFecha, 'La fecha de entrega no puede ser anterior a hoy.');
                esValido = false;
            } else {
                limpiarErrorCampo(inputFecha);
            }

            if (!selectEntrega.value) {
                mostrarErrorCampo(selectEntrega, 'Selecciona una modalidad de entrega.');
                esValido = false;
            } else {
                limpiarErrorCampo(selectEntrega);
            }

            if (selectEntrega.value === 'domicilio' && inputEspecificaciones.value.trim().length < 10) {
                mostrarErrorCampo(inputEspecificaciones, 'Para entrega a domicilio escribe tu dirección completa.');
                esValido = false;
            } else if (inputEspecificaciones.value.trim().length > 0) {
                limpiarErrorCampo(inputEspecificaciones);
            } else {
                inputEspecificaciones.classList.remove('input-error', 'input-valid');
                const msgEl = inputEspecificaciones.nextElementSibling;
                if (msgEl && msgEl.classList.contains('error-text')) msgEl.remove();
            }

            return esValido;
        }

        [inputNombre, inputTelefono, inputFecha, selectEntrega, inputEspecificaciones].forEach(campo => {
            if (campo) {
                campo.addEventListener('input', validarFormulario);
                campo.addEventListener('change', validarFormulario);
            }
        });

        orderForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const cart = getCart();
            if (cart.length === 0) {
                alert('⚠️ Tu carrito está vacío. Agrega al menos un producto desde el catálogo.');
                return;
            }

            if (!validarFormulario()) {
                alert('⚠️ Por favor corrige los campos marcados en rojo antes de enviar tu pedido.');
                return;
            }

            let total = 0;
            const lineasTicket = [];
            cart.forEach(item => {
                const sub = Number(item.price) * Number(item.quantity);
                total += sub;
                lineasTicket.push(`${item.name} — ${item.quantity} × $${money(item.price)} = $${money(sub)} MXN`);
            });

            const nombre = inputNombre.value.trim();
            const telefono = inputTelefono.value.trim();
            const fecha = inputFecha.value;
            const entregaValor = selectEntrega.value;
            const entregaText = selectEntrega.selectedOptions[0].textContent;
            const especificaciones = inputEspecificaciones.value.trim();

            const detalleBD = lineasTicket.join('\n') +
                `\nTotal: $${money(total)} MXN` +
                (especificaciones ? `\nNotas: ${especificaciones}` : '');

            const formData = new FormData();
            formData.append('nuevo_pedido', '1');
            formData.append('nombre', nombre);
            formData.append('telefono', telefono);
            formData.append('fecha', fecha);
            formData.append('entrega', entregaValor);
            formData.append('detalle_productos', detalleBD);

            const submitBtn = orderForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando pedido...';

            const esServidorLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            try {
                let folio = 'SC-' + Date.now().toString().slice(-6);

                if (esServidorLocal) {
                    const response = await fetch('admin_pedidos.php', {
                        method: 'POST',
                        body: formData
                    });

                    const texto = await response.text();
                    let resultado;
                    try {
                        resultado = JSON.parse(texto);
                    } catch (e) {
                        throw new Error('Verifica que Apache y MySQL estén activos en XAMPP.');
                    }

                    if (!response.ok || !resultado.exito) {
                        throw new Error(resultado.mensaje || 'Error al registrar el pedido.');
                    }

                    folio = 'SC-' + String(resultado.id).padStart(4, '0');
                }

                document.getElementById('ticketFolio').textContent = folio;
                document.getElementById('ticketNombre').textContent = nombre;
                document.getElementById('ticketTelefono').textContent = telefono;
                document.getElementById('ticketFecha').textContent = fecha;
                document.getElementById('ticketEntrega').textContent = entregaText;
                document.getElementById('ticketEspecificaciones').textContent = especificaciones || 'Sin especificaciones';
                document.getElementById('ticketTotal').textContent = money(total);

                const ticketProducts = document.getElementById('ticketProductos');
                ticketProducts.innerHTML = '';
                lineasTicket.forEach(linea => {
                    const p = document.createElement('p');
                    p.textContent = linea;
                    ticketProducts.appendChild(p);
                });

                const ticketModal = document.getElementById('ticketModal');
                ticketModal.hidden = false;
                document.body.classList.add('modal-open');

                localStorage.removeItem(STORAGE_KEY);
                renderCart();
                submitBtn.textContent = 'Pedido registrado';

            } catch (error) {
                alert('No se pudo guardar el pedido: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Pagar ahora';
            }
        });

        function closeTicketModal() {
            document.getElementById('ticketModal').hidden = true;
            document.body.classList.remove('modal-open');
        }

        document.getElementById('closeTicket').addEventListener('click', closeTicketModal);
        document.getElementById('closeTicketButton').addEventListener('click', closeTicketModal);
        document.querySelector('.ticket-modal-overlay').addEventListener('click', closeTicketModal);

        renderCart();
    }
});