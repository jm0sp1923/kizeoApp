const apiUrl = '/api/kizeo/lists'; 

fetch(apiUrl, {
  method: 'GET',
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Error al obtener los datos');
    }
    return response.json();
  })
  .then(data => {
    const listTypeSelect = document.getElementById('listType');

    // Filtrar las listas que quieres mostrar
    // Ejemplo: solo mostrar listas con nombre que incluya 'Activa'
    const listasFiltradas = data.lists.filter(list => list.name.includes('Inmuebles pruebas')|| list.name.includes('Cuentas Visita Ocular') || list.name.includes('Cuentas Inventario Inmuebles') );

    // Alternativamente, filtrar por IDs específicos, por ejemplo:
    // const listasFiltradas = data.lists.filter(list => ['id1', 'id2', 'id3'].includes(list.id));

    // Crear opciones solo para las listas filtradas
    listasFiltradas.forEach(list => {
      const option = document.createElement('option');
      option.value = list.id;
      option.textContent = list.name;
      listTypeSelect.appendChild(option);
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });
