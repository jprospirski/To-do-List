const form = document.getElementById('form-nova-tarefa');
const input = document.getElementById('input-nova-tarefa');
const listaAFazer = document.getElementById('lista-a-fazer');
const listas = document.querySelectorAll('.coluna-tarefas ul');

const modalOverlay = document.getElementById('modal-overlay');
const modalBox = document.getElementById('modal-box');
const inputEditar = document.getElementById('input-editar-tarefa');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');
const formEditar = document.getElementById('form-editar-tarefa');

const confirmOverlay = document.getElementById('confirm-overlay');
const botaoConfirmarRemocao = document.getElementById('botao-confirmar-remocao');
const botaoCancelarRemocao = document.getElementById('botao-cancelar-remocao');

let tarefaParaRemover = null;
let spanSendoEditado = null;
let tarefaArrastada = null;

form.addEventListener('submit', enviarFormulario);

//Função: adicionar uma nova tarefa ao formulário
function enviarFormulario (event) {
    event.preventDefault(); //Evita que a pagina recarrege no envio.

    const textoDaTarefa = input.value;
    if(textoDaTarefa === "") { //Caso não tenha nada escrito.
        return;
    }

    const novaTarefa = criarElementoTarefa(textoDaTarefa);
    document.getElementById('lista-a-fazer').append(novaTarefa);

    input.value = ""; //limpa acaixa de texto após inserir um valor
    input.focus(); //volta a escrita para caixa de texto
    salvarTarefas();
}

function criarElementoTarefa(texto) {

    //Criação de uma linha em html ("li")
    const novaTarefaLi = document.createElement('li');
    novaTarefaLi.classList.add('item-da-lista')
    novaTarefaLi.draggable= true;
    
    novaTarefaLi.addEventListener('dragstart', (event) => {
        tarefaArrastada = novaTarefaLi;

        const clone = novaTarefaLi.cloneNode(true);
        clone.style.backgroundColor = '#EAE3DB';
        clone.style.color = 'white';
        clone.style.padding = '0.5rem 1rem';
        clone.style.borderRadius = '8px';
        clone.style.width = '250px';
        clone.style.boxShadow = '0 4px 8px #DCD3C9';

        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        document.body.append(clone);

        event.dataTransfer.setDragImage(clone, 125, 25);
        setTimeout(() => {
            clone.remove();
        }, 0);

        setTimeout(() => {
            novaTarefaLi.classList.add('arrastando');
        }, 0);
    });

    novaTarefaLi.addEventListener('dragend', () => {
        tarefaArrastada = null;
        novaTarefaLi.classList.remove('arrastando')
    });

    //Criação de um "span" para o "li"
    const spanTexto = document.createElement('span');
    spanTexto.textContent = texto

    //Criação de um "button" para o li
    const botaoRemover = document.createElement('button');
    botaoRemover.textContent = 'Remover';
    botaoRemover.classList.add('botao-remover'); //adiciona uma classe
    botaoRemover.addEventListener('click', () => { 
        tarefaParaRemover = novaTarefaLi;

        confirmOverlay.classList.remove('overlay-escondido');
    });

    //Criação de botão de edição
    const botaoEditar = document.createElement('button');
    botaoEditar.textContent = 'Editar';
    botaoEditar.classList.add('botao-editar');
    botaoEditar.addEventListener('click', () => {

        modalOverlay.classList.remove('overlay-escondido');

        // Guarda qual span estamos editando
        spanSendoEditado = spanTexto; 

        // Coloca o texto atual da tarefa dentro do input do modal
        inputEditar.value = spanTexto.textContent;
        inputEditar.focus(); // Foca no input
    });

    const divBotoes = document.createElement('div');
    divBotoes.classList.add('botoes');
    divBotoes.append(botaoEditar, botaoRemover)

    novaTarefaLi.append(spanTexto, divBotoes); //insere as funções filhas dentro da função pai

    return novaTarefaLi;
}

// Adiciona os eventos de 'dragover' a todas as listas/colunas
listas.forEach(lista => {
    lista.addEventListener('dragover', (event) => {
        event.preventDefault(); 

        lista.classList.add('drag-over');
    });

    lista.addEventListener('dragleave', () => {
        lista.classList.remove('drag-over');
    });

    lista.addEventListener('drop', (event) => { // 1. Recebe o 'event'
        event.preventDefault(); // 2. Adiciona o preventDefault()
        lista.classList.remove('drag-over');
        if(tarefaArrastada) {
            lista.append(tarefaArrastada);
            salvarTarefas();
        }   
    });
});

function fecharModal() {
    modalOverlay.classList.add('overlay-escondido');
}

botaoCancelar.addEventListener('click', fecharModal);

function salvarEdicao(event){
    event.preventDefault();

    const novoTexto = inputEditar.value;
    if (novoTexto.trim() !== "" && spanSendoEditado) {
        spanSendoEditado.textContent = novoTexto;
    }
    fecharModal();
    salvarTarefas();
};

formEditar.addEventListener('submit', salvarEdicao);
botaoSalvar.addEventListener('click', salvarEdicao);

function fecharConfirmModal(){ 
    confirmOverlay.classList.add('overlay-escondido')
}

botaoCancelarRemocao.addEventListener('click', fecharConfirmModal);

botaoConfirmarRemocao.addEventListener('click', () => {
    if (tarefaParaRemover) {
        tarefaParaRemover.remove();
        salvarTarefas(); 
    }
    fecharConfirmModal();
})

//funções de persistencia de dados em localstorage
function salvarTarefas() {
    const todasTarefas = document.querySelectorAll('.item-da-lista');
    const arrayDeTarefas = [];

    todasTarefas.forEach(tarefaLi => {
        const texto = tarefaLi.querySelector('span').textContent;
        const colunaId = tarefaLi.parentElement.id;

        if (colunaId) {
            arrayDeTarefas.push({
                texto: texto, 
                coluna: colunaId
            });
        }
    });

    localStorage.setItem('tarefas_do_kanban', JSON.stringify(arrayDeTarefas));
}

function carregarTarefas() {
    const tarefasSalvas = localStorage.getItem('tarefas_do_kanban');
    if (!tarefasSalvas) { // Se não houver nada salvo, não faz nada
        return;
    }

    const arrayDeTarefas = JSON.parse(tarefasSalvas);

    arrayDeTarefas.forEach(tarefaObj => {
        const novaTarefa = criarElementoTarefa(tarefaObj.texto);
        // Adiciona a tarefa na coluna que estava salva
        document.getElementById(tarefaObj.coluna).append(novaTarefa);
    });
}

carregarTarefas();