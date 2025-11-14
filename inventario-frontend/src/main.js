import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';

const API_URL = "https://backend-productos-leo.onrender.com/api/products";
const form = document.getElementById("form-producto");
const productosBody = document.getElementById("productos-body");

let idProductoAEliminar = null; //  ID temporal para confirmar eliminación

//  Cargar productos
async function cargarProductos() {
  const res = await fetch(API_URL);
  const data = await res.json();

  productosBody.innerHTML = "";
  data.forEach(prod => {
    productosBody.innerHTML += `
      <tr>
        <td class="text-center text-nowrap">${prod.nombre}</td>
        <td class="text-center text-nowrap">$${prod.precio}</td>
        <td class="text-center text-nowrap">${prod.cantidad}</td>
        <td class="text-center text-nowrap">${prod.categoria}</td>
        <td class="text-center">
          <div class="d-flex justify-content-center gap-2 flex-wrap">
            <button class="btn btn-warning btn-sm" 
              onclick="editarProducto('${prod._id}', '${prod.nombre}', '${prod.precio}', '${prod.cantidad}', '${prod.categoria}')">
              <i class="bi bi-pencil text-dark"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="eliminarProducto('${prod._id}')">
              <i class="bi bi-trash text-dark"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  aplicarFiltros();
}

//  Agregar producto
form.addEventListener("submit", async e => {
  e.preventDefault();

  const nombreNuevo = document.getElementById("nombre").value.trim().toLowerCase();

  // Verificar si ya existe en la tabla
  let existe = false;
  document.querySelectorAll("#productos-body tr").forEach(row => {
    const nombre = row.querySelector("td:nth-child(1)").textContent.trim().toLowerCase();
    if (nombre === nombreNuevo) {
      existe = true;
    }
  });

  if (existe) {
    const modal = new bootstrap.Modal(document.getElementById("modalDuplicado"));
    modal.show();
    return;
  }

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

    const modal = new bootstrap.Modal(document.getElementById("modalAgregado"));
    modal.show();
  } else {
    console.error("Error al agregar producto");
  }
});

//  Editar producto
window.editarProducto = function(id, nombre, precio, cantidad, categoria) {
  document.getElementById("editar-id").value = id;
  document.getElementById("editar-nombre").value = nombre;
  document.getElementById("editar-precio").value = precio;
  document.getElementById("editar-cantidad").value = cantidad;
  document.getElementById("editar-categoria").value = categoria;

  const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
  modal.show();
};

//  Guardar cambios
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

    const modal = new bootstrap.Modal(document.getElementById("modalActualizado"));
    modal.show();
  } else {
    console.error("Error al actualizar producto");
  }
});

//  Eliminar producto con confirmación
window.eliminarProducto = function(id) {
  idProductoAEliminar = id;
  const modal = new bootstrap.Modal(document.getElementById("modalConfirmarEliminar"));
  modal.show();
};

document.getElementById("btn-confirmar-eliminar").addEventListener("click", async () => {
  if (!idProductoAEliminar) return;

  const res = await fetch(`${API_URL}/${idProductoAEliminar}`, { method: "DELETE" });
  if (res.ok) {
    cargarProductos();
  } else {
    console.error("Error al eliminar producto");
  }

  bootstrap.Modal.getInstance(document.getElementById("modalConfirmarEliminar")).hide();
  idProductoAEliminar = null;
});

//  Filtros combinados
document.getElementById("buscar").addEventListener("input", aplicarFiltros);
document.getElementById("filtro-categoria").addEventListener("change", aplicarFiltros);

function aplicarFiltros() {
  const filtroNombre = document.getElementById("buscar").value.toLowerCase();
  const filtroCategoria = document.getElementById("filtro-categoria").value;

  document.querySelectorAll("#productos-body tr").forEach(row => {
    const nombre = row.querySelector("td:nth-child(1)").textContent.toLowerCase();
    const categoria = row.querySelector("td:nth-child(4)").textContent;

    const coincideNombre = nombre.includes(filtroNombre);
    const coincideCategoria = filtroCategoria === "" || categoria === filtroCategoria;

    row.style.display = coincideNombre && coincideCategoria ? "" : "none";
  });
}

// Inicializar
cargarProductos();
