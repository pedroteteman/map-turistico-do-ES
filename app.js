// Base de dados 100% restaurada e calibrada milimetricamente para o novo mapa SVG
const PLACES = [
    { n: "Itaúnas", c: "Conceição da Barra", x: 200, y: 35, d: "Vila de dunas móveis dentro do Parque Estadual de Itaúnas, famosa pelo forró e pelo sandboard.", t: "Vá no fim da tarde para ver o pôr do sol nas dunas." },
    { n: "Conceição da Barra", c: "Litoral norte", x: 215, y: 55, d: "Cidade de praias extensas, rio Cricaré e forte tradição do Ticumbi, folguedo afro-capixaba.", t: "Passeie de barco pela foz do rio Mucuri." },
    { n: "Regência", c: "Linhares", x: 228, y: 155, d: "Vila na foz do rio Doce, com ondas para surfe e base do Projeto Tamar.", t: "Em novembro e dezembro aparecem as tartarugas desovando." },
    { n: "Santa Cruz", c: "Aracruz", x: 220, y: 205, d: "Praias tranquilas, aldeias indígenas Tupiniquim e Guarani e a pesca artesanal de Barra do Sahy.", t: "Conheça o artesanato indígena de Caieiras Velhas." },
    { n: "Santa Teresa", c: "Serra capixaba", x: 165, y: 195, d: "Primeira colônia italiana do Brasil, com beija-flores, museu do naturalista Augusto Ruschi e cafés.", t: "Visite o Museu de Biologia Mello Leitão." },
    { n: "Convento da Penha", c: "Vila Velha", x: 228, y: 260, d: "Santuário de 1558 no alto de um morro, o cartão-postal do estado, com vista para a baía de Vitória.", t: "Suba a pé pela Rampa Antiga ou de carro pela Rampa Nova." },
    { n: "Vitória", c: "Capital", x: 222, y: 245, d: "Capital em uma ilha, com a Praia de Camburi, a Ilha do Boi, o Parque Moscoso e a Escadaria Maria Ortiz.", t: "Prove a moqueca capixaba na panela de barro." },
    { n: "Domingos Martins", c: "Região serrana", x: 160, y: 260, d: "Cidade de colonização alemã, com vinícolas, trilhas e o Pico do Eucalipto.", t: "Em Marechal Floriano há voos de parapente." },
    { n: "Pedra Azul", c: "Domingos Martins", x: 135, y: 280, d: "Monolito de granito de 1.822 m cuja cor muda ao longo do dia, no Parque Estadual de Pedra Azul.", t: "Ao amanhecer, a névoa deixa a paisagem mais bonita." },
    { n: "Guarapari", c: "Litoral sul", x: 215, y: 300, d: "Cidade saúde, conhecida pelas areias monazíticas e pelas dezenas de praias, como Meaípe e Setiba.", t: "Mergulhe nas ilhas de Guarapari." },
    { n: "Anchieta", c: "Litoral sul", x: 195, y: 335, d: "Cidade do padre José de Anchieta, com o Santuário Nacional e a Praia de Castelhanos.", t: "Faça a Rota dos Peregrinos até Vitória." },
    { n: "Venda Nova do Imigrante", c: "Região serrana", x: 120, y: 310, d: "Capital nacional do agroturismo, de colonização italiana, com queijos, embutidos, café e chalés entre montanhas.", t: "Compre queijos e biscoitos direto dos produtores." },
    { n: "Marataízes", c: "Litoral sul", x: 185, y: 380, d: "Cidade litorânea do sul capixaba, com praias extensas e orla movimentada.", t: "Visite as falésias de Marataízes." }
];

const loginSec = document.getElementById('login');
const appDiv = document.getElementById('app');
const nameRow = document.getElementById('nameRow');
const toggleBtn = document.getElementById('toggle');
const goBtn = document.getElementById('go');
const outBtn = document.getElementById('out');
const hiSpan = document.getElementById('hi');
const errParam = document.getElementById('err');
const mapSvg = document.getElementById('map');
let isSignUp = false;
let currentScale = 1;

// Alternar entre o modo de Entrar (Login) e Criar Conta (Cadastro)
toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;
    nameRow.classList.toggle('hidden', !isSignUp);
    goBtn.textContent = isSignUp ? "Cadastrar e Entrar" : "Entrar";
    toggleBtn.textContent = isSignUp ? "Já tenho uma conta" : "Criar uma conta";
    document.getElementById('sub').textContent = isSignUp ? "Cadastre-se para acessar o mapa." : "Entre para ver o mapa dos pontos turísticos.";
    errParam.textContent = "";
});

// Ação do Botão Principal (Entrar ou Cadastrar)
goBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;

    if (!email || !senha || (isSignUp && !nome)) {
        errParam.textContent = "Por favor, preencha todos os campos.";
        return;
    }

    let users = JSON.parse(localStorage.getItem('mapa_usuarios')) || [];

    if (isSignUp) {
        const userExists = users.some(u => u.email === email);
        if (userExists) {
            errParam.textContent = "Este e-mail já está cadastrado.";
            return;
        }

        const newUser = { nome, email, senha };
        users.push(newUser);
        localStorage.setItem('mapa_usuarios', JSON.stringify(users));
        efetuarLogin(nome);
    } else {
        const user = users.find(u => u.email === email);

        if (!user) {
            errParam.textContent = "Conta não encontrada! Clique em 'Criar uma conta' primeiro.";
            return;
        }

        if (user.senha !== senha) {
            errParam.textContent = "Senha incorreta.";
            return;
        }

        efetuarLogin(user.nome || email.split('@')[0]);
    }
});

// Libera o acesso à aplicação do mapa
function efetuarLogin(displayNome) {
    errParam.textContent = "";
    loginSec.classList.add('hidden');
    appDiv.classList.remove('hidden');
    hiSpan.textContent = `Olá, ${displayNome}`;

    renderPins();
    renderChips();
}

// Sair do sistema
outBtn.addEventListener('click', () => {
    appDiv.classList.add('hidden');
    loginSec.classList.remove('hidden');
    document.getElementById('email').value = "";
    document.getElementById('senha').value = "";
    document.getElementById('nome').value = "";
});

// Injetar os marcadores detalhados dentro do mapa SVG de Alta Resolução
function renderPins() {
    const pinsGroup = document.getElementById('pinsGroup');
    pinsGroup.innerHTML = '';

    PLACES.forEach((place, index) => {
        const svgNS = "http://w3.org";
        const g = document.createElementNS(svgNS, "g");
        g.setAttribute("class", "pin");
        g.setAttribute("id", `pin-${index}`);

        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", place.x);
        circle.setAttribute("cy", place.y);
        circle.setAttribute("r", "6");

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", place.x + 10);
        text.setAttribute("y", place.y + 4);
        text.setAttribute("class", "pt");
        text.textContent = place.n;

        g.appendChild(circle);
        g.appendChild(text);

        g.addEventListener('click', () => selectPlace(place, index));
        pinsGroup.appendChild(g);
    });
}

// Criar lista de botões seletores inferiores
function renderChips() {
    const chipsContainer = document.getElementById('chips');
    chipsContainer.innerHTML = '';
    PLACES.forEach((place, index) => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.setAttribute("id", `chip-${index}`);
        btn.textContent = place.n;
        btn.addEventListener('click', () => selectPlace(place, index));
        chipsContainer.appendChild(btn);
    });
}

// Sincronização e apresentação mútua de dados
function selectPlace(place, index) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
    document.querySelectorAll('.pin').forEach(p => p.classList.remove('on'));

    const activeChip = document.getElementById(`chip-${index}`);
    const activePin = document.getElementById(`pin-${index}`);
    
    if(activeChip) activeChip.classList.add('on');
    if(activePin) activePin.classList.add('on');

    document.getElementById('t').textContent = place.n;
    document.getElementById('c').textContent = place.c;
    document.getElementById('d').textContent = place.d;
    document.getElementById('tip').textContent = `Dica: ${place.t}`;
}

// Sistema de Zoom Dinâmico sobre o ViewBox Geográfico
document.getElementById('zin').addEventListener('click', () => {
    if (currentScale > 0.4) {
        currentScale -= 0.1;
        updateZoom();
    }
});

document.getElementById('zout').addEventListener('click', () => {
    if (currentScale < 1.6) {
        currentScale += 0.1;
        updateZoom();
    }
});

function updateZoom() {
    const baseW = 500;
    const baseH = 580;
    const newW = baseW * currentScale;
    const newH = baseH * currentScale;
    const xOffset = -80 + (baseW - newW) / 2;
    const yOffset = -40 + (baseH - newH) / 2;
    mapSvg.setAttribute("viewBox", `${xOffset} ${yOffset} ${newW} ${newH}`);
}

mapSvg.setAttribute("viewBox", `${xOffset} ${yOffset} ${newW} ${newH}`);



