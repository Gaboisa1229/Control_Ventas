// Esperar a que todo el HTML cargue antes de ejecutar el JS
document.addEventListener('DOMContentLoaded', () => {
    
    let datosGlobales = [];
    let asesorLogueado = "";

    // Elementos del DOM
    const btnLogin = document.getElementById('btnLogin');
    const btnExport = document.getElementById('btnExport');
    const inputExcel = document.getElementById('uploadExcel');
    const loginScreen = document.getElementById('login-screen');
    const mainDashboard = document.getElementById('main-dashboard');
    const btnLogout = document.getElementById('btnLogout');


    // 1. FUNCIÓN DE LOGIN
    btnLogin.addEventListener('click', () => {
        const userValue = document.getElementById('username').value.trim().toUpperCase();
        
        if (userValue !== "") {
            asesorLogueado = userValue;
            // Cambiar pantallas
            loginScreen.classList.remove('active');
            loginScreen.style.display = 'none';
            mainDashboard.style.display = 'block';
            
            document.getElementById('displayNombre').innerText = `Asesor: ${asesorLogueado}`;
            document.getElementById('fechaHoy').innerText = new Date().toLocaleDateString();
            
            renderizarDatos();
        } else {
            alert("Por favor, ingresa un nombre de usuario.");
        }
    });

    // 2. CARGA DE EXCEL (FORMADOR)
    inputExcel.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            datosGlobales = XLSX.utils.sheet_to_json(firstSheet);
            alert("Base de datos cargada. Ya puedes consultar.");
            
            if(asesorLogueado) renderizarDatos();
        };
        reader.readAsArrayBuffer(archivo);
    });

    // 3. MOSTRAR DATOS
    function renderizarDatos() {
        const tabla = document.getElementById('listaVentas');
        tabla.innerHTML = "";
        
        let pwr = 0, con = 0;

        // Filtrar datos que coincidan con la columna "Asesor" del Excel
        const filtrados = datosGlobales.filter(item => 
            item.Asesor && String(item.Asesor).toUpperCase() === asesorLogueado
        );

        filtrados.forEach(venta => {
            const tipo = String(venta.Tipo || "").toUpperCase();
            if(tipo === 'POWER') pwr++;
            if(tipo === 'CONECTADA') con++;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${venta.Hora || '--:--'}</td>
                <td><strong>${venta.Tipo || 'N/A'}</strong></td>
                <td>${venta.Canal || 'N/A'}</td>
                <td>${venta.Metodo || 'Grabada'}</td>
            `;
            tabla.appendChild(tr);
        });

        document.getElementById('countPower').innerText = pwr;
        document.getElementById('countConectadas').innerText = con;
        document.getElementById('countTotal').innerText = pwr + con;

        if (filtrados.length === 0 && datosGlobales.length > 0) {
            tabla.innerHTML = "<tr><td colspan='4'>No se encontraron ventas para este usuario.</td></tr>";
        }
    }

    // 4. EXPORTAR
    btnExport.addEventListener('click', () => {
        const table = document.getElementById('ventasTable');
        const wb = XLSX.utils.table_to_book(table, {sheet: "Reporte"});
        XLSX.writeFile(wb, `Ventas_${asesorLogueado}.xlsx`);
    });
});

// 5. FUNCIÓN CERRAR SESIÓN
btnLogout.addEventListener('click', () => {
    if(confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        // Limpiar el nombre y los datos
        asesorLogueado = "";
        datosGlobales = [];
        document.getElementById('username').value = "";
        
        // Cambiar vistas
        mainDashboard.style.display = 'none';
        loginScreen.style.display = 'block';
        loginScreen.classList.add('active');
        
        // Limpiar tabla y contadores
        document.getElementById('username').value = "";
        document.getElementById('listaVentas').innerHTML = "";
        document.getElementById('countPower').innerText = "0";
        document.getElementById('countConectadas').innerText = "0";
        document.getElementById('countTotal').innerText = "0";
        document.getElementById('progressFill').style.width = "0%";

        // 4. Redirección visual a la página de Login
        document.getElementById('main-dashboard').style.display = 'none';
        const loginScreen = document.getElementById('login-screen');
        loginScreen.style.display = 'block';
        loginScreen.classList.add('active');

        console.log("Sesión cerrada correctamente.");
    }
});

// Al inicio de tu script.js define la meta
const META_DEL_MES = 100; 

// Dentro de la función renderizarDatos(), al final, agrega esto:
function actualizarMeta(totalVentasActuales) {
    const metaDisplay = document.getElementById('metaMensual');
    const faltanteDisplay = document.getElementById('faltanteMeta');
    const barra = document.getElementById('progressFill');

    metaDisplay.innerText = META_DEL_MES;
    
    // Calcular faltante (mínimo 0, para que no dé números negativos)
    const faltante = Math.max(0, META_DEL_MES - totalVentasActuales);
    faltanteDisplay.innerText = faltante;

    // Calcular porcentaje para la barra
    const porcentaje = Math.min(100, (totalVentasActuales / META_DEL_MES) * 100);
    barra.style.width = porcentaje + "%";

    // Si llega a la meta, podrías cambiar el color de la barra
    if (porcentaje === 100) {
        barra.style.background = "#27ae60"; // Verde éxito
    }
}