
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
      data.lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;  
        option.textContent = list.name;  
        listTypeSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });