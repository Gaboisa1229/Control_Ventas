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