// ================= CONFIG SUPABASE =================

// ⚠️ Hardcoded (garante que funciona)
const supabaseClient = window.supabase.createClient(
    "https://zzxdflwqwhqekkyfoutb.supabase.co",
    "sb_publishable_Lb3SL1KzrIc7pLPq1McVkw_YeLty3YH"
);

// ================= ESTADO =================

let usuarios = [];
let veiculos = [];
let imagensSelecionadas = [];
let veiculoEditando = null;

// ================= RENDER =================

function renderizar(lista = veiculos) {
    const el = document.getElementById("estoque");
    el.innerHTML = "";

    lista.forEach(v => {
        el.innerHTML += `
        <div onclick="abrirCarro('${v.id}')"
        class="cursor-pointer bg-slate-800 rounded-xl overflow-hidden shadow hover:scale-105 transition">
            <img src="${v.imagens?.[0] || 'https://via.placeholder.com/400'}" class="w-full h-40 object-cover">
            <div class="p-3">
                <h3 class="text-lg font-bold">${v.nome}</h3>
                <p class="text-green-400">${v.preco}</p>
            </div>
        </div>
        `;
    });
}

// ================= CARREGAR =================

async function carregarVeiculos() {
    const { data, error } = await supabaseClient
        .from("veiculos")
        .select("*");

    if (error) {
        console.error("Erro ao carregar veículos:", error);
        return;
    }

    veiculos = data || [];
    renderizar();
    carregarListaVeiculos();
}

async function carregarUsuarios() {
    const { data, error } = await supabaseClient
        .from("usuarios")
        .select("*");

    if (error) {
        console.error("Erro ao carregar usuários:", error);
        return;
    }

    usuarios = data || [];
    listarUsuarios();
}

// ================= VEÍCULO =================

function abrirCarro(id) {
    localStorage.setItem("carroSelecionado", id);
    window.location.href = "carro.html";
}

async function salvarVeiculo() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.perms.includes("upload")) {
        alert("Sem permissão");
        return;
    }

    const dados = {
        nome: document.getElementById("nome").value,
        preco: document.getElementById("preco").value,
        tipo: document.getElementById("tipo").value,
        descricao: document.getElementById("descricao").value,
        imagens: imagensSelecionadas,
        info: document.getElementById("info").value
            .split("\n").map(i => i.trim()).filter(Boolean),
        tags: document.getElementById("tags").value
            .split(",").map(t => t.trim()).filter(Boolean)
    };

    let error;

    if (veiculoEditando) {
        if (!user.perms.includes("edit")) {
            alert("Sem permissão para editar");
            return;
        }

        ({ error } = await supabaseClient
            .from("veiculos")
            .update(dados)
            .eq("id", veiculoEditando.id));

    } else {
        ({ error } = await supabaseClient
            .from("veiculos")
            .insert([dados]));
    }

    if (error) {
        console.error(error);
        alert("Erro ao salvar");
        return;
    }

    limparFormulario();
    await carregarVeiculos();
}

// ================= USUÁRIOS =================

function listarUsuarios() {
    const lista = document.getElementById("listaUsuarios");
    lista.innerHTML = "";

    usuarios.forEach((u, index) => {
        const temUpload = u.perms?.includes("upload");
        const temEdit = u.perms?.includes("edit");

        lista.innerHTML += `
        <li class="mb-3 p-3 bg-slate-800 rounded flex justify-between items-center">
            <div>
                <p class="font-semibold">${u.username}</p>
                <span class="text-sm opacity-70">${u.role}</span>
            </div>

            <div class="flex gap-2">
                <button onclick="togglePerm(${index}, 'upload')"
                class="px-3 py-1 rounded text-sm font-semibold
                ${temUpload ? 'bg-green-600' : 'bg-red-600'}">
                    Upload
                </button>

                <button onclick="togglePerm(${index}, 'edit')"
                class="px-3 py-1 rounded text-sm font-semibold
                ${temEdit ? 'bg-green-600' : 'bg-red-600'}">
                    Edit
                </button>
            </div>
        </li>
        `;
    });
}

function togglePerm(index, perm) {
    const u = usuarios[index];

    if (u.perms.includes(perm)) {
        u.perms = u.perms.filter(p => p !== perm);
    } else {
        u.perms.push(perm);
    }

    listarUsuarios();
}

// ================= LOGIN =================

function abrirLogin() {
    document.getElementById("loginModal").classList.remove("hidden");
}

function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    const u = usuarios.find(x => x.username === user && x.pass === pass);

    if (u) {
        localStorage.setItem("user", JSON.stringify(u));
        location.reload();
    } else {
        alert("Login inválido");
    }
}

function logout() {
    localStorage.removeItem("user");
    location.reload();
}

function verificarPermissao() {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return;

    document.getElementById("admin").classList.remove("hidden");

    if (u.role !== "super") {
        document.getElementById("usuarios").style.display = "none";
    }
}

// ================= IMAGENS =================

document.getElementById("uploadImagens").addEventListener("change", async function (e) {
    const files = e.target.files;
    const preview = document.getElementById("preview");

    preview.innerHTML = "";
    imagensSelecionadas = [];

    for (let file of files) {
        const url = await uploadImagem(file);
        if (!url) continue;

        imagensSelecionadas.push(url);

        preview.innerHTML += `
        <img src="${url}" class="rounded h-24 w-full object-cover">
        `;
    }
});

async function uploadImagem(file) {
    const nomeArquivo = Date.now() + "_" + file.name;

    const { error } = await supabaseClient.storage
        .from("veiculos")
        .upload(nomeArquivo, file);

    if (error) {
        console.error("Erro upload:", error);
        return null;
    }

    const { data } = supabaseClient.storage
        .from("veiculos")
        .getPublicUrl(nomeArquivo);

    return data.publicUrl;
}

// ================= INIT =================

carregarVeiculos();
carregarUsuarios();
verificarPermissao();
