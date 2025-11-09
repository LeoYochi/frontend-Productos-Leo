import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';

const API_URL = "https://backend-productos-leo.onrender.com/api/products";
const form = document.getElementById("form-producto");
const productosBody = document.getElementById("productos-body");

// 🔄 Cargar productos
async function cargarProductos() {
  const res = await fetch(API_URL);
  const data = await res.json();

  productosBody.innerHTML = "";
  data.forEach(prod => {
    productosBody.innerHTML += `
      <tr>
        <td>${prod.nombre}</td>
        <td>${prod.precio}</td>
        <td>${prod.cantidad}</td>
        <td>${prod.categoria}</td>
        <td>
          <button class="btn btn-warning btn-sm" 
            onclick="editarProducto('${prod._id}', '${prod.nombre}', '${prod.precio}', '${prod.cantidad}', '${prod.categoria}')">
            Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="eliminarProducto('${prod._id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

// ➕ Agregar producto
form.addEventListener("submit", async e => {
  e.preventDefault();
  const nuevoProducto = {
    nombre: document.getElementById("nombre").value,
    precio: document.getElementById("precio").value,
    cantidad: document.getElementById("cantidad").value,
    categoria: document.getElementById("categoria").value
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoProducto)
  });

  if (res.ok) {
    form.reset();
    cargarProductos();
  } else {
    console.error("Error al agregar producto");
  }
});

// ✏️ Editar producto (abrir modal con datos)
window.editarProducto = function(id, nombre, precio, cantidad, categoria) {
  document.getElementById("editar-id").value = id;
  document.getElementById("editar-nombre").value = nombre;
  document.getElementById("editar-precio").value = precio;
  document.getElementById("editar-cantidad").value = cantidad;
  document.getElementById("editar-categoria").value = categoria;

  const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
  modal.show();
};

// 📝 Guardar cambios
document.getElementById("form-editar").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("editar-id").value;

  const productoActualizado = {
    nombre: document.getElementById("editar-nombre").value,
    precio: document.getElementById("editar-precio").value,
    cantidad: document.getElementById("editar-cantidad").value,
    categoria: document.getElementById("editar-categoria").value
  };

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productoActualizado)
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById("modalEditar")).hide();
    cargarProductos();
  } else {
    console.error("Error al actualizar producto");
  }
});

// 🗑️ Eliminar producto
window.eliminarProducto = async function(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (res.ok) {
    cargarProductos();
  } else {
    console.error("Error al eliminar producto");
  }
};

// 🔍 Filtro de búsqueda
document.getElementById("buscar").addEventListener("input", e => {
  const filtro = e.target.value.toLowerCase();
  document.querySelectorAll("#productos-body tr").forEach(row => {
    const nombre = row.querySelector("td").textContent.toLowerCase();
    row.style.display = nombre.includes(filtro) ? "" : "none";
  });
});

// Inicializar
cargarProductos();
