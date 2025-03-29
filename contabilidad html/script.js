// Variables globales
let transacciones = [];

// Función para cambiar entre pestañas
function openTab(event, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (const tab of tabContents) {
        tab.style.display = "none";
    }
    const tabButtons = document.getElementsByClassName("tabs")[0].getElementsByTagName("button");
    for (const button of tabButtons) {
        button.classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");
}

// Función para mostrar/ocultar campo de tipo patrimonial
function mostrarTipoPatrimonio() {
    const tipoPatrimonioContainer = document.getElementById("tipoPatrimonioContainer");
    if (document.getElementById("clasificacion").value === "patrimonio") {
        tipoPatrimonioContainer.style.display = "block";
    } else {
        tipoPatrimonioContainer.style.display = "none";
    }
}

// Función para formatear números con $ y separadores de miles
function formatearMonto(monto) {
    return `$${parseFloat(monto).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Función para agregar transacciones
document.getElementById("transactionForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const descripcion = document.getElementById("descripcion").value;
    const tipo = document.getElementById("tipo").value;
    const movimiento = document.getElementById("movimiento").value;
    const clasificacion = document.getElementById("clasificacion").value;
    const monto = parseFloat(document.getElementById("monto").value);
    const tipoPatrimonio = clasificacion === "patrimonio" ? document.getElementById("tipoPatrimonio").value : null;
    
    if (isNaN(monto) || monto <= 0) {
        alert("Ingrese un monto válido mayor a cero");
        return;
    }
    
    // Guardar la transacción
    transacciones.push({ descripcion, tipo, movimiento, clasificacion, monto, tipoPatrimonio });
    
    // Actualizar todas las vistas
    actualizarLibroDiario();
    actualizarLibroMayor();
    actualizarDiagramasT();
    actualizarBalanza();
    actualizarEstadoResultados();
    actualizarBalanceGeneral();
    actualizarCambiosCapital();
    actualizarFlujoEfectivo();
    
    // Reiniciar el formulario
    this.reset();
    document.getElementById("tipoPatrimonioContainer").style.display = "none";
});

// Función para actualizar el libro diario
function actualizarLibroDiario() {
    const debeBody = document.getElementById("debeBody");
    const haberBody = document.getElementById("haberBody");
    debeBody.innerHTML = "";
    haberBody.innerHTML = "";
    
    transacciones.forEach(transaccion => {
        const row = `<tr>
            <td>${transaccion.movimiento}</td>
            <td>${transaccion.descripcion}</td>
            <td>${transaccion.clasificacion}</td>
            <td>${formatearMonto(transaccion.monto)}</td>
        </tr>`;
        
        if (transaccion.tipo === "debe") {
            debeBody.innerHTML += row;
        } else {
            haberBody.innerHTML += row;
        }
    });
}

// Función para actualizar el libro mayor
function actualizarLibroMayor() {
    const libroMayorContainer = document.getElementById("libroMayorContainer");
    libroMayorContainer.innerHTML = "";

    // Agrupar transacciones por número de movimiento
    const movimientos = {};
    transacciones.forEach(transaccion => {
        if (!movimientos[transaccion.movimiento]) {
            movimientos[transaccion.movimiento] = { debe: [], haber: [] };
        }
        if (transaccion.tipo === "debe") {
            movimientos[transaccion.movimiento].debe.push(transaccion);
        } else {
            movimientos[transaccion.movimiento].haber.push(transaccion);
        }
    });

    // Crear tabla para cada movimiento
    for (const movimiento in movimientos) {
        const movimientoDiv = document.createElement("div");
        movimientoDiv.className = "movimiento";
        movimientoDiv.innerHTML = `<h3>Movimiento ${movimiento}</h3>`;

        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>Debe</th>
                    <th>Haber</th>
                </tr>
            </thead>
            <tbody>
                ${movimientos[movimiento].debe.map(t => `
                    <tr>
                        <td>${t.descripcion}</td>
                        <td>${formatearMonto(t.monto)}</td>
                        <td></td>
                    </tr>
                `).join("")}
                ${movimientos[movimiento].haber.map(t => `
                    <tr>
                        <td>${t.descripcion}</td>
                        <td></td>
                        <td>${formatearMonto(t.monto)}</td>
                    </tr>
                `).join("")}
            </tbody>
        `;
        movimientoDiv.appendChild(table);
        libroMayorContainer.appendChild(movimientoDiv);
    }
}

// Función para actualizar diagramas T
function actualizarDiagramasT() {
    const diagramasContainer = document.getElementById("diagramasContainer");
    diagramasContainer.innerHTML = "";

    // Agrupar transacciones por cuenta
    const cuentas = {};
    transacciones.forEach(transaccion => {
        if (!cuentas[transaccion.descripcion]) {
            cuentas[transaccion.descripcion] = { debe: 0, haber: 0 };
        }
        if (transaccion.tipo === "debe") {
            cuentas[transaccion.descripcion].debe += transaccion.monto;
        } else {
            cuentas[transaccion.descripcion].haber += transaccion.monto;
        }
    });

    // Crear diagrama T para cada cuenta
    for (const cuenta in cuentas) {
        const diagrama = document.createElement("div");
        diagrama.className = "diagrama";
        diagrama.innerHTML = `
            <h3>${cuenta}</h3>
            <div class="cuenta">
                <div class="debe">
                    <h4>Debe</h4>
                    <p>${formatearMonto(cuentas[cuenta].debe)}</p>
                </div>
                <div class="haber">
                    <h4>Haber</h4>
                    <p>${formatearMonto(cuentas[cuenta].haber)}</p>
                </div>
            </div>
        `;
        diagramasContainer.appendChild(diagrama);
    }
}

// Función para actualizar la balanza de comprobación
function actualizarBalanza() {
    const cuentas = {};
    
    transacciones.forEach(transaccion => {
        if (!cuentas[transaccion.descripcion]) {
            cuentas[transaccion.descripcion] = { debe: 0, haber: 0 };
        }
        if (transaccion.tipo === "debe") {
            cuentas[transaccion.descripcion].debe += transaccion.monto;
        } else {
            cuentas[transaccion.descripcion].haber += transaccion.monto;
        }
    });
    
    const balanzaDebeBody = document.getElementById("balanzaDebeBody");
    const balanzaHaberBody = document.getElementById("balanzaHaberBody");
    balanzaDebeBody.innerHTML = "";
    balanzaHaberBody.innerHTML = "";
    
    let totalDebe = 0, totalHaber = 0;
    for (const cuenta in cuentas) {
        balanzaDebeBody.innerHTML += `<tr><td>${cuenta}</td><td>${formatearMonto(cuentas[cuenta].debe)}</td></tr>`;
        balanzaHaberBody.innerHTML += `<tr><td>${cuenta}</td><td>${formatearMonto(cuentas[cuenta].haber)}</td></tr>`;
        totalDebe += cuentas[cuenta].debe;
        totalHaber += cuentas[cuenta].haber;
    }
    
    document.getElementById("totalDebe").textContent = formatearMonto(totalDebe);
    document.getElementById("totalHaber").textContent = formatearMonto(totalHaber);
    document.getElementById("diferencia").textContent = formatearMonto(totalDebe - totalHaber);
}

// Función para actualizar el Estado de Resultados
function actualizarEstadoResultados() {
    const ingresos = transacciones
        .filter(t => t.clasificacion === "ingreso" && t.tipo === "haber")
        .reduce((sum, t) => sum + t.monto, 0);
    
    const costos = transacciones
        .filter(t => t.clasificacion === "gasto" && t.descripcion.toLowerCase().includes("costo"))
        .reduce((sum, t) => sum + t.monto, 0);
    
    const gastos = transacciones
        .filter(t => t.clasificacion === "gasto" && !t.descripcion.toLowerCase().includes("costo"))
        .reduce((sum, t) => sum + t.monto, 0);
    
    const utilidadBruta = ingresos - costos;
    const utilidadAntesImpuestos = utilidadBruta - gastos;
    const isr = utilidadAntesImpuestos * 0.30;
    const ptu = utilidadAntesImpuestos * 0.10;
    const utilidadPeriodo = utilidadAntesImpuestos - isr - ptu;
    
    document.getElementById("estadoResultadosBody").innerHTML = `
        <tr>
            <td>Ventas</td>
            <td>${formatearMonto(ingresos)}</td>
        </tr>
        <tr>
            <td>(-) Costo de Ventas</td>
            <td>${formatearMonto(costos)}</td>
        </tr>
        <tr class="subtotal">
            <td>Utilidad Bruta</td>
            <td>${formatearMonto(utilidadBruta)}</td>
        </tr>
        <tr>
            <td>(-) Gastos Operativos</td>
            <td>${formatearMonto(gastos)}</td>
        </tr>
        <tr class="subtotal">
            <td>Utilidad antes de impuestos</td>
            <td>${formatearMonto(utilidadAntesImpuestos)}</td>
        </tr>
        <tr>
            <td>(-) ISR (30%)</td>
            <td>${formatearMonto(isr)}</td>
        </tr>
        <tr>
            <td>(-) PTU (10%)</td>
            <td>${formatearMonto(ptu)}</td>
        </tr>
        <tr class="total">
            <td>Utilidad del Periodo</td>
            <td>${formatearMonto(utilidadPeriodo)}</td>
        </tr>
    `;
}

// Función para actualizar el Balance General
function actualizarBalanceGeneral() {
    const activos = {};
    const pasivos = {};
    const patrimonio = {};

    transacciones.forEach(transaccion => {
        const cuenta = transaccion.descripcion;
        const monto = transaccion.monto;

        if (transaccion.clasificacion === "activo") {
            activos[cuenta] = (activos[cuenta] || 0) + (transaccion.tipo === "debe" ? monto : -monto);
        } else if (transaccion.clasificacion === "pasivo") {
            pasivos[cuenta] = (pasivos[cuenta] || 0) + (transaccion.tipo === "haber" ? monto : -monto);
        } else if (transaccion.clasificacion === "patrimonio") {
            patrimonio[cuenta] = (patrimonio[cuenta] || 0) + (transaccion.tipo === "haber" ? monto : -monto);
        }
    });

    // Añadir utilidad del período al patrimonio
    const utilidad = calcularUtilidad();
    patrimonio["Utilidad del Periodo"] = (patrimonio["Utilidad del Periodo"] || 0) + utilidad;

    // Actualizar tablas
    actualizarTablaBalance("activosBody", activos);
    actualizarTablaBalance("pasivosBody", pasivos);
    actualizarTablaBalance("patrimonioBody", patrimonio);

    // Calcular totales
    document.getElementById("totalActivos").textContent = formatearMonto(sumarMontos(activos));
    document.getElementById("totalPasivos").textContent = formatearMonto(sumarMontos(pasivos));
    document.getElementById("totalPatrimonio").textContent = formatearMonto(sumarMontos(patrimonio));
    document.getElementById("totalPasivosPatrimonio").textContent = 
        formatearMonto(sumarMontos(pasivos) + sumarMontos(patrimonio));
}

// Función para actualizar el Estado de Cambios en el Capital Contable
function actualizarCambiosCapital() {
    // Obtener la fecha actual
    const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' };
    const fechaActual = new Date().toLocaleDateString('es-MX', opcionesFecha);
    document.getElementById("fechaActual").textContent = fechaActual;

    // Inicializar acumuladores
    let capitalContribuido = 0;
    let capitalGanado = 0;
    let disminuciones = 0;
    let utilidadEjercicio = calcularUtilidad();

    // Procesar transacciones de patrimonio
    transacciones.forEach(transaccion => {
        if (transaccion.clasificacion === "patrimonio") {
            const monto = transaccion.tipo === "haber" ? transaccion.monto : -transaccion.monto;
            
            switch (transaccion.tipoPatrimonio) {
                case "capitalContribuido":
                    capitalContribuido += monto;
                    break;
                case "capitalGanado":
                    capitalGanado += monto;
                    break;
                case "disminucion":
                    disminuciones += Math.abs(monto);
                    break;
            }
        }
    });

    // Calcular saldos finales
    const saldoFinalContribuido = capitalContribuido;
    const saldoFinalGanado = capitalGanado + utilidadEjercicio - disminuciones;
    const saldoFinalContable = saldoFinalContribuido + saldoFinalGanado;

    // Generar HTML para la tabla
    document.getElementById("cambiosCapitalBody").innerHTML = `
        <tr>
            <td>Saldos iniciales</td>
            <td>0</td>
            <td>0</td>
            <td>0</td>
        </tr>
        <tr class="seccion">
            <td><strong>Aumentos</strong></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>Capital Social</td>
            <td>${formatearMonto(capitalContribuido)}</td>
            <td></td>
            <td>${formatearMonto(capitalContribuido)}</td>
        </tr>
        <tr>
            <td>Resultado del ejercicio</td>
            <td></td>
            <td>${formatearMonto(utilidadEjercicio)}</td>
            <td>${formatearMonto(utilidadEjercicio)}</td>
        </tr>
        <tr class="total-seccion">
            <td><strong>Total aumentos</strong></td>
            <td>${formatearMonto(capitalContribuido)}</td>
            <td>${formatearMonto(utilidadEjercicio)}</td>
            <td>${formatearMonto(capitalContribuido + utilidadEjercicio)}</td>
        </tr>
        <tr class="seccion">
            <td><strong>Disminuciones</strong></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>Retiros/Dividendos</td>
            <td></td>
            <td>${formatearMonto(disminuciones)}</td>
            <td>${formatearMonto(disminuciones)}</td>
        </tr>
        <tr class="total-seccion">
            <td><strong>Total disminuciones</strong></td>
            <td>0</td>
            <td>${formatearMonto(disminuciones)}</td>
            <td>${formatearMonto(disminuciones)}</td>
        </tr>
        <tr class="total-final">
            <td><strong>Saldo final</strong></td>
            <td>${formatearMonto(saldoFinalContribuido)}</td>
            <td>${formatearMonto(saldoFinalGanado)}</td>
            <td>${formatearMonto(saldoFinalContable)}</td>
        </tr>
    `;
}

// Función para actualizar el Estado de Flujo de Efectivo
function actualizarFlujoEfectivo() {
    // Obtener la fecha actual
    const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' };
    const fechaActual = new Date().toLocaleDateString('es-MX', opcionesFecha);
    document.getElementById("fechaFlujoEfectivo").textContent = fechaActual;

    // Calcular valores necesarios
    const utilidadEjercicio = calcularUtilidad();
    const isr = utilidadEjercicio * 0.30;
    const ptu = utilidadEjercicio * 0.10;
    
    // Obtener valores de transacciones reales
    const depreciaciones = obtenerMontoPorDescripcion("depreciacion") || 0;
    const proveedores = obtenerMontoPorDescripcion("proveedores") || 0;
    const capitalSocial = obtenerMontoPorDescripcion("capital social") || 0;
    
    // Calcular efectivo generado en operación
    const efectivoOperacion = utilidadEjercicio + isr + ptu + depreciaciones;
    
    // Obtener aplicaciones de efectivo
    const aplicaciones = {
        almacen: obtenerMontoPorDescripcion("almacen") || 0,
        clientes: obtenerMontoPorDescripcion("clientes") || 0,
        ivaTrasladado: obtenerMontoPorDescripcion("iva trasladado") || 0,
        ivaTrasladar: obtenerMontoPorDescripcion("iva x trasladar") || 0,
        ivaAcreditable: obtenerMontoPorDescripcion("iva acreditable") || 0,
        ivaAcreditar: obtenerMontoPorDescripcion("iva x acreditar") || 0,
        terrenos: obtenerMontoPorDescripcion("terrenos") || 0,
        edificios: obtenerMontoPorDescripcion("edificios") || 0,
        mobiliario: obtenerMontoPorDescripcion("mobiliario") || 0,
        transporte: obtenerMontoPorDescripcion("equipo de transporte") || 0,
        sonido: obtenerMontoPorDescripcion("equipo de sonido") || 0
    };
    
    const totalAplicaciones = Object.values(aplicaciones).reduce((a, b) => a + b, 0);
    const sumaFuentes = proveedores + capitalSocial;
    const disminucionEfectivo = efectivoOperacion + sumaFuentes - totalAplicaciones;
    
    // Generar HTML para la tabla
    document.getElementById("flujoEfectivoBody").innerHTML = `
        <tr>
            <td>Utilidad del ejercicio</td>
            <td>${formatearMonto(utilidadEjercicio)}</td>
        </tr>
        <tr class="seccion">
            <td><strong>Cargos a resultados que no implican utilización de efectivo</strong></td>
            <td></td>
        </tr>
        <tr>
            <td>ISR</td>
            <td>${formatearMonto(isr)}</td>
        </tr>
        <tr>
            <td>PTU</td>
            <td>${formatearMonto(ptu)}</td>
        </tr>
        <tr>
            <td>Depreciaciones</td>
            <td>${formatearMonto(depreciaciones)}</td>
        </tr>
        <tr class="total-seccion">
            <td><strong>Efectivo generado en la operación</strong></td>
            <td>${formatearMonto(efectivoOperacion)}</td>
        </tr>
        <tr class="seccion">
            <td><strong>Financiamiento y otras fuentes</strong></td>
            <td></td>
        </tr>
        <tr>
            <td>Proveedores</td>
            <td>${formatearMonto(proveedores)}</td>
        </tr>
        <tr>
            <td>Capital Social</td>
            <td>${formatearMonto(capitalSocial)}</td>
        </tr>
        <tr class="total-seccion">
            <td><strong>Suma de fuentes de efectivo</strong></td>
            <td>${formatearMonto(sumaFuentes)}</td>
        </tr>
        <tr class="seccion">
            <td><strong>Aplicación de efectivo</strong></td>
            <td></td>
        </tr>
        ${Object.entries(aplicaciones).map(([concepto, monto]) => `
            <tr>
                <td>${formatearNombreConcepto(concepto)}</td>
                <td>${formatearMonto(monto)}</td>
            </tr>
        `).join('')}
        <tr class="total-seccion">
            <td><strong>Total aplicaciones</strong></td>
            <td>${formatearMonto(totalAplicaciones)}</td>
        </tr>
        <tr class="total-final">
            <td><strong>Disminución neta del efectivo</strong></td>
            <td>${formatearMonto(disminucionEfectivo)}</td>
        </tr>
    `;
}

// Funciones auxiliares
function actualizarTablaBalance(id, cuentas) {
    const tbody = document.getElementById(id);
    tbody.innerHTML = Object.entries(cuentas)
        .filter(([_, monto]) => monto > 0)
        .map(([cuenta, monto]) => `
            <tr>
                <td>${cuenta}</td>
                <td>${formatearMonto(monto)}</td>
            </tr>
        `).join("");
}

function sumarMontos(obj) {
    return Object.values(obj).reduce((sum, monto) => sum + (monto > 0 ? monto : 0), 0);
}

function calcularUtilidad() {
    const ingresos = transacciones
        .filter(t => t.clasificacion === "ingreso" && t.tipo === "haber")
        .reduce((sum, t) => sum + t.monto, 0);

    const gastos = transacciones
        .filter(t => t.clasificacion === "gasto" && t.tipo === "debe")
        .reduce((sum, t) => sum + t.monto, 0);

    return ingresos - gastos;
}

function obtenerMontoPorDescripcion(descripcion) {
    const transaccion = transacciones.find(t => 
        t.descripcion.toLowerCase().includes(descripcion.toLowerCase())
    );
    return transaccion ? transaccion.monto : 0;
}

function formatearNombreConcepto(concepto) {
    // Convierte snake_case a texto legible
    return concepto
        .replace(/([A-Z])/g, ' $1')
        .replace(/(^|\s)\S/g, l => l.toUpperCase())
        .replace("Iva", "IVA")
        .replace("X", "x");
}