// ================= CONFIG =================

const supabaseClient = window.supabase.createClient(
    "https://zzxdflwqwhqekkyfoutb.supabase.co",
    "sb_publishable_Lb3SL1KzrIc7pLPq1McVkw_YeLty3YH"
);

// ================= VOLTAR =================

function voltar() {
    window.location.href = "index.html";
}

// ================= CARREGAR CARRO =================

async function carregarCarro() {

    const id = localStorage.getItem("carroSelecionado");
    const el = document.getElementById("carro");

    if (!id) {
        el.innerHTML = "<p>Veículo não encontrado</p>";
        return;
    }

    const { data, error } = await supabaseClient
        .from("veiculos")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        console.error(error);
        el.innerHTML = "<p>Veículo não encontrado</p>";
        return;
    }

    const carro = data;

    renderizarCarro(carro);
}

// ================= RENDER =================

function renderizarCarro(carro) {

    const el = document.getElementById("carro");

    el.innerHTML = `
<div class="grid md:grid-cols-2 gap-6">

    <div>
        <img id="imgPrincipal" src="${carro.imagens?.[0] || ''}" 
        class="w-full h-[400px] object-cover rounded-xl mb-3">

        <div class="grid grid-cols-3 gap-2">
            ${(carro.imagens || []).map(img => `
                <img src="${img}" 
                onclick="trocarImagem('${img}')"
                class="rounded cursor-pointer opacity-80 hover:opacity-100">
            `).join("")}
        </div>
    </div>

    <div>

        <h1 class="text-3xl font-bold mb-2">${carro.nome}</h1>

        <p class="text-3xl text-green-400 font-semibold mb-4">
            ${carro.preco}
        </p>

        <div class="flex flex-wrap gap-2 mb-6">
            ${(carro.tags || []).map(tag => `
                <span class="bg-slate-800 px-3 py-1 rounded">${tag}</span>
            `).join("")}
        </div>

        <div class="flex gap-3 mb-6">
            <button class="bg-green-600 px-5 py-3 rounded w-full">
                WhatsApp
            </button>

            <button class="bg-blue-600 px-5 py-3 rounded w-full">
                Tenho interesse
            </button>
        </div>

        <div class="bg-slate-900 p-4 rounded-xl">
            <h3 class="font-bold mb-2">Informações</h3>

            ${(carro.info || []).map(i => `
                <p>✔ ${i}</p>
            `).join("")}
        </div>

    </div>

</div>

<div class="mt-8 bg-slate-900 p-6 rounded-xl">
    <h2 class="text-xl font-bold mb-3">Descrição</h2>

    <p class="opacity-80 leading-relaxed">
        ${carro.descricao}
    </p>
</div>
`;
}

// ================= TROCAR IMAGEM =================

function trocarImagem(img) {
    document.getElementById("imgPrincipal").src = img;
}

// ================= INIT =================

carregarCarro();
