let listaDeTarefas = [];
let index = 0; /**/

function salvarDados() {
    let dados = document.getElementById("entrada").value;
    let dadosObj = {
        id: index,
        texto: dados
    }
    index++; /* Incrementa o índice para a próxima tarefa */

    listaDeTarefas.push(dadosObj); /* Adiciona a tarefa à lista */

    mostrarDados(); /*Chama a função para mostrar os dados*/

};

function mostrarDados() {
    let ul = document.getElementById("resultados");
    let html = ""; /* Inicializa a variável html como uma string vazia */

    listaDeTarefas.forEach((tarefa) => { /*Passa os parâmetros para a função */
        html +=
            `<li>
                ${tarefa.texto} <button onclick="editarDados(${tarefa.id})">Editar</button>

                <button onclick="deletarDados(${tarefa.id})">Deletar</button>
            </li>`; /* Adiciona a tarefa à lista no HTML */
    });

    ul.innerHTML = html; /* Atualiza o conteúdo da lista no HTML */
};

function editarDados(id) {
    let resultado = listaDeTarefas.find(obj => obj.id === id);
    let html = `<input type="text" id="entradaEditar" value="${resultado.texto}"> 
                <button onclick="editarNovosDados(${id})">Editar</button>`;
    let divEditar = document.getElementById("editar");
    divEditar.innerHTML = html;

    console.log("Tarefa encontrada:", resultado);
};

function editarNovosDados(id) {
    let entradaEditar = document.getElementById("entradaEditar").value;
    let resultado = listaDeTarefas.find(obj => obj.id === id);

    resultado.texto = entradaEditar; /* Atualiza o texto da tarefa com o novo valor */

    mostrarDados(); /* Atualiza a lista de tarefas no HTML */

    let divEditar = document.getElementById("editar");
    divEditar.innerHTML = "";

}


function deletarDados(id) {
    let novaLista = listaDeTarefas.filter(obj => obj.id !== id); /* Cria uma nova lista sem a tarefa deletada */
    listaDeTarefas = novaLista; /* Atualiza a lista de tarefas com a nova lista */
    mostrarDados(); /* Atualiza a lista de tarefas no HTML */
};