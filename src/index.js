
// ==========================================
// DESAFIO FINAL 01
// Tema: Mini-sistema de Loja + Caixa + Estoque
// ==========================================

// Objetivo
// Você vai construir um sistema completo (em memória, sem banco de dados) que:
// - mantém um catálogo de produtos e um estoque
// - cria carrinhos de compra, valida quantidades e calcula totais
// - aplica regras de preço (promoções/cupões) com prioridades e restrições
// - calcula impostos (IVA) por categoria
// - finaliza pedidos e imprime um cupom fiscal detalhado
// - gera relatórios simples de vendas

// Regras gerais
// - Não use bibliotecas externas.
// - Use apenas JavaScript (Node.js).
// - Não apague as assinaturas (nomes/params) dos métodos marcados como TODO.
// - Use estruturas de dados adequadas (Map/Array/Object).
// - Todas as validações devem lançar Error com mensagens claras.

// Como usar
// - Complete os TODOs.
// - Ao final, descomente a chamada de runDemo() no fim do arquivo.
// - O demo executa cenários que devem passar.

// ==========================================
// PARTE 0 - Dados e utilitários
// ==========================================

const CATEGORIAS = [
	"eletrodoméstico",
	"decoração",
	"materiais de construção",
	"vestuário",
	"alimentos"
];

const IVA_POR_CATEGORIA = {
	"eletrodoméstico": 0.23,
	"decoração": 0.23,
	"materiais de construção": 0.23,
	"vestuário": 0.23,
	"alimentos": 0.06
};

function round2(value) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatBRL(value) {
	// Evite Intl se quiser praticar manualmente.
	return `R$ ${round2(value).toFixed(2)}`.replace(".", ",");
}

function assertPositiveNumber(value, label) {
	if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
		throw new Error(`${label} deve ser um número positivo.`);
	}
}

function assertNonNegativeInt(value, label) {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${label} deve ser um inteiro >= 0.`);
	}
}

function assertCategoriaValida(categoria) {
	if (!CATEGORIAS.includes(categoria)) {
		throw new Error(`Categoria inválida: ${categoria}. Aceitas: ${CATEGORIAS.join(", ")}`);
	}
}

// ==========================================
// PARTE 1 - Modelos principais (classes)
// ==========================================

// 1) Crie a classe Produto
// Requisitos mínimos:
// - sku (string) único
// - nome (string)
// - preco (number > 0)
// - fabricante (string)
// - categoria (deve estar em CATEGORIAS)
// - numeroMaximoParcelas (int 1..24)
// Métodos:
// - getValorDeParcela(numeroDeParcelas) => number
//   - deve validar: numeroDeParcelas int >=1 e <= numeroMaximoParcelas
//   - retorna preco / numeroDeParcelas (2 casas)

class Produto {
    constructor({ sku, nome, preco, fabricante, categoria, numeroMaximoParcelas }) {
        this.sku = sku; 
        this.nome = nome;
        this.preco = preco;
        this.fabricante = fabricante;
        this.categoria = categoria;
        this.numeroMaximoParcelas = numeroMaximoParcelas;

    }

    getValorDeParcela(numeroDeParcelas) {
        if (numeroDeParcelas >= 1 && numeroDeParcelas <= this.numeroMaximoParcelas) {
            return round2(this.preco / numeroDeParcelas);
        }
        throw new Error(`Número de parcelas inválido. Máximo: ${this.numeroMaximoParcelas}`);
    }
}

// 2) Crie a classe Cliente
// Requisitos:
// - id (string)
// - nome (string)
// - tipo: "REGULAR" | "VIP"
// - saldoPontos (int >= 0)
// Métodos:
// - adicionarPontos(pontos)
// - resgatarPontos(pontos) => diminui saldo, valida

class Cliente {
    constructor({ id, nome, tipo = "REGULAR", saldoPontos = 0 }) {
        this.id = id;
        this.nome = nome;
        this.tipo = tipo;
        this.saldoPontos = saldoPontos;
        // Removido o throw new Error
    }

    adicionarPontos(pontos) {
        if (pontos <= 0) {
            throw new Error("Os pontos a adicionar devem ser positivos.");
        }
        this.saldoPontos += pontos; // Soma simples ao saldo atual
    }

    resgatarPontos(pontos) {
        if (pontos <= 0) {
            throw new Error("Os pontos a resgatar devem ser positivos.");
        }
        if (pontos > this.saldoPontos) {
            throw new Error("Saldo de pontos insuficiente.");
        } 
        this.saldoPontos -= pontos; 
    }
}
// 3) Crie a classe ItemCarrinho
// Requisitos:
// - sku (string)
// - quantidade (int >= 1)
// - precoUnitario (number > 0) *congelado no momento de adicionar*
// Observação: o carrinho usa precoUnitario do momento (para simular mudança de preço no catálogo).

class ItemCarrinho {
		constructor({ sku, quantidade, precoUnitario }) {

        if (typeof sku !== 'string' || sku.trim() === "") {
            throw new Error("SKU inválido: deve ser um texto não vazio.");
        } 

        if (!Number.isInteger(quantidade) || quantidade < 1) {
            throw new Error("Quantidade inválida: deve ser um inteiro maior ou igual a 1.");
        }

        if (typeof precoUnitario !== 'number' || precoUnitario <= 0) {
            throw new Error("Preço unitário inválido: deve ser um número maior que zero.");
        }

        this.sku = sku;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

getTotal() {
    const total = this.quantidade * this.precoUnitario;
    return Number(total.toFixed(2));

	}
}

// 4) Crie a classe Estoque
// Use Map para guardar { sku -> quantidade }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - definirQuantidade(sku, quantidade)
// - adicionar(sku, quantidade)
// - remover(sku, quantidade)
// - getQuantidade(sku)
// - garantirDisponibilidade(sku, quantidade)

class Estoque {
	constructor() {
		this.map = new Map();
	}

	definirQuantidade(sku, quantidade) {
		if (quantidade <= 0){
			throw new Error("TODO: implementar definirQuantidade");
		}
		this.map.set(sku, quantidade);

		
	}

    adicionar(sku, quantidade) {
        if (quantidade < 0) {
            throw new Error("A quantidade a adicionar deve ser positiva.");
        }
        // Correção: Removido o ponto em "let." e usado getQuantidade para ler
        const quantidadeAtual = this.getQuantidade(sku);
        this.map.set(sku, quantidadeAtual + quantidade);
    }

    getQuantidade(sku) {
        if (this.map.has(sku)) {
            return this.map.get(sku);
        }
        return 0;
        // Removido o throw new Error inalcançável
    }

    garantirDisponibilidade(sku, quantidade) {
        const disponivel = this.getQuantidade(sku);
        if (disponivel < quantidade) {
            // Correção: Agora lançamos o erro real em vez do TODO
            throw new Error(`Estoque insuficiente para ${sku}. Disponível: ${disponivel}, Pedido: ${quantidade}`);
        }
    }

    remover(sku, quantidade) {
        const quantidadeAtual = this.getQuantidade(sku);
        
        if (quantidadeAtual < quantidade) {
            throw new Error(`Estoque insuficiente para o produto ${sku}`);
        }
        this.map.set(sku, quantidadeAtual - quantidade);
    }
}

// 5) Crie a classe Catalogo
// Use Map para guardar { sku -> Produto }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - adicionarProduto(produto)
// - getProduto(sku)
// - listarPorCategoria(categoria)
// - atualizarPreco(sku, novoPreco)

class Catalogo {
	constructor() {
		this.map = new Map();
	}

	adicionarProduto(produto) {

		if (!produto || !produto.sku) {
			throw new Error("Produto inválido: não é possível adicionar ao catálogo sem um SKU.");
		}
		
		
		this.map.set(produto.sku, produto);
	}

	getProduto(sku) {
	
		if (!this.map.has(sku)) {
			throw new Error(`Produto com SKU '${sku}' não encontrado no catálogo.`);
		}
		
	
		return this.map.get(sku);
	}

	listarPorCategoria(categoria) {
		const produtosFiltrados = [];

		for (const produto of this.map.values()) {
			if (produto.categoria === categoria) {
				produtosFiltrados.push(produto);
			}
		}

		return produtosFiltrados;
	}

	atualizarPreco(sku, novoPreco) {

		const produto = this.getProduto(sku);

		if (novoPreco <= 0) {
			throw new Error("O preço do produto deve ser um valor positivo.");
		}

		produto.preco = novoPreco;
	}
}

// 6) Crie a classe CarrinhoDeCompras
// Responsabilidades:
// - adicionar itens (validando estoque)
// - remover itens
// - alterar quantidade
// - calcular subtotal
// - consolidar itens por sku (sem duplicatas)
// Sugestão: use Map sku -> ItemCarrinho
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

class CarrinhoDeCompras {
    constructor({ catalogo, estoque }) {
        this.catalogo = catalogo;
        this.estoque = estoque;
        this.map = new Map(); 
    }

    adicionarItem(sku, quantidade) {

        if (quantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        let quantidadeNoCarrinho = 0;
        if (this.map.has(sku)) {
            quantidadeNoCarrinho = this.map.get(sku).quantidade;
        }

        const quantidadeTotalDesejada = quantidadeNoCarrinho + quantidade;


        this.estoque.garantirDisponibilidade(sku, quantidadeTotalDesejada);

        const produto = this.catalogo.getProduto(sku);


        this.map.set(sku, {
            produto,
            quantidade: quantidadeTotalDesejada
        });
    }

    removerItem(sku) {
        if (!this.map.has(sku)) {
            throw new Error("Item não encontrado no carrinho.");
        }
        this.map.delete(sku);
    }

    alterarQuantidade(sku, novaQuantidade) {
        if (novaQuantidade <= 0) {
            return this.removerItem(sku);
        }

        this.estoque.garantirDisponibilidade(sku, novaQuantidade);

        const item = this.map.get(sku);
        if (!item) {
            throw new Error("Produto não está no carrinho. Use adicionarItem.");
        }

        item.quantidade = novaQuantidade;
    }

    listarItens() {
        return Array.from(this.map.values());
    }

    getSubtotal() {
        let total = 0;

        for (const item of this.map.values()) {
            total += item.produto.preco * item.quantidade;
        }
        return total;
    }
}

// ==========================================
// PARTE 2 - Regras de preço (promoções)
// ==========================================

// Você implementará um motor de preços com as regras abaixo.
// Você deve conseguir produzir um “breakdown” (quebra) do total:
// - subtotal
// - descontos (lista com nome + valor)
// - base de imposto
// - imposto total
// - frete
// - total final

// Estrutura sugerida do breakdown (objeto):
// {
//   subtotal,
//   descontos: [{ codigo, descricao, valor }],
//   totalDescontos,
//   impostoPorCategoria: { [categoria]: valor },
//   totalImpostos,
//   frete,
//   total
// }

// 7) Regras obrigatórias (todas devem existir e ser testáveis):
// R1 - Desconto VIP:
// - Se cliente.tipo === "VIP", aplica 5% no subtotal (apenas uma vez).
// - Não pode ser aplicado se existir cupom "SEM-VIP".
//
// R2 - Cupom:
// - Cupom "ETIC10" => 10% no subtotal
// - Cupom "FRETEGRATIS" => frete zerado
// - Cupom "SEM-VIP" => bloqueia R1
// - Cupom inválido deve lançar Error
//
// R3 - Leve 3 pague 2 (vestuário):
// - Para produtos da categoria "vestuário": a cada 3 unidades (somando SKUs diferentes),
//   a unidade mais barata dentre as 3 sai grátis.
// - Ex: 3 camisetas (10), 1 calça (50), 1 meia (5) => total unidades=5 => aplica 1 grátis
//   (a mais barata dentro do grupo de 3) e sobram 2 sem promo.
//
// R4 - Desconto por valor:
// - Se subtotal >= 500, aplica desconto fixo de 30.
//
// Observação de dificuldade:
// - Você precisa decidir ordem de aplicação e documentar.
// - Você precisa impedir descontos maiores que o subtotal.
// - Deve ser determinístico.

// 8) Crie uma classe MotorDePrecos
// Método principal:
// - calcular({ cliente, itens, cupomCodigo }) => breakdown
// Onde itens é o resultado de carrinho.listarItens()

class MotorDePrecos {
    constructor({ catalogo }) {
        this.catalogo = catalogo;
    }

    calcular({ cliente, itens, cupomCodigo }) {
        let subtotal = 0;
        let totalImpostos = 0;
        const descontos = []; 
        const impostoPorCategoria = {};

        const itensVestuario = [];

        for (const item of itens) {
            const valorLinha = item.produto.preco * item.quantidade;
            subtotal += valorLinha;

            const taxa = IVA_POR_CATEGORIA[item.produto.categoria] || 0;
            const valorImposto = valorLinha * taxa;
            

            if (!impostoPorCategoria[item.produto.categoria]) {
                impostoPorCategoria[item.produto.categoria] = 0;
            }
            impostoPorCategoria[item.produto.categoria] += valorImposto;
            totalImpostos += valorImposto;

            if (item.produto.categoria === "vestuário") {

                for (let i = 0; i < item.quantidade; i++) {
                    itensVestuario.push(item.produto.preco);
                }
            }
        }

        let totalDescontos = 0;

        if (itensVestuario.length >= 3) {
            itensVestuario.sort((a, b) => a - b);
            const qtdGratis = Math.floor(itensVestuario.length / 3);
            
            let descontoVestuario = 0;

            for (let i = 0; i < qtdGratis; i++) {
                descontoVestuario += itensVestuario[i];
            }

            if (descontoVestuario > 0) {
                descontos.push({ codigo: "R3", descricao: "Leve 3 Pague 2 (Vestuário)", valor: descontoVestuario });
                totalDescontos += descontoVestuario;
            }
        }

        // --- R2: Cupons ---
        let cupomSemVip = false;
        let freteGratis = false;

        if (cupomCodigo) {
            if (cupomCodigo === "ETIC10") {
                const valorDesc = subtotal * 0.10;
                descontos.push({ codigo: "ETIC10", descricao: "Cupom 10% OFF", valor: valorDesc });
                totalDescontos += valorDesc;
            } else if (cupomCodigo === "FRETEGRATIS") {
                freteGratis = true;
                descontos.push({ codigo: "FRETE", descricao: "Cupom Frete Grátis", valor: 0 });
            } else if (cupomCodigo === "SEM-VIP") {
                cupomSemVip = true;
            } else {
                throw new Error(`Cupom inválido: ${cupomCodigo}`);
            }
        }

        // --- R1: Desconto VIP ---
        if (cliente.tipo === "VIP" && !cupomSemVip) {
            const valorVip = subtotal * 0.05;
            descontos.push({ codigo: "VIP", descricao: "Desconto VIP 5%", valor: valorVip });
            totalDescontos += valorVip;
        }

        // --- R4: Desconto por valor alto ---
        if (subtotal >= 500) {
            descontos.push({ codigo: "R4", descricao: "Desconto > 500", valor: 30.00 });
            totalDescontos += 30.00;
        }

        // Garantir que desconto não é maior que subtotal
        if (totalDescontos > subtotal) {
            totalDescontos = subtotal;
        }

        // --- Frete e Total Final ---
        let frete = (subtotal > 100 || freteGratis) ? 0 : 15.00; // Assumindo 15 se < 100
        const totalFinal = subtotal - totalDescontos + totalImpostos + frete;

        return {
            subtotal: round2(subtotal),
            descontos: descontos,
            totalDescontos: round2(totalDescontos),
            impostoPorCategoria: impostoPorCategoria,
            totalImpostos: round2(totalImpostos),
            frete: round2(frete),
            total: round2(totalFinal)
        };
    }
}

// ==========================================
// PARTE 3 - Checkout / Pedido / Cupom
// ==========================================

// 9) Crie a classe Pedido
// Requisitos:
// - id (string)
// - clienteId
// - itens (array)
// - breakdown (objeto)
// - status: "ABERTO" | "PAGO" | "CANCELADO"
// - createdAt (Date)
// Métodos:
// - pagar()
// - cancelar()

class Pedido {
    constructor({ id, clienteId, itens, breakdown }) {
        this.id = id;
        this.clienteId = clienteId;
        this.itens = itens;
        this.breakdown = breakdown;
        this.status = "ABERTO";
        this.createdAt = new Date();
    }

    pagar() {
        if (this.status !== "ABERTO") {
            throw new Error(`Não é possível pagar um pedido com status ${this.status}`);
        }
        this.status = "PAGO";
    }

    cancelar() {
        if (this.status !== "ABERTO") {
            throw new Error(`Não é possível cancelar um pedido com status ${this.status}`);
        }
        this.status = "CANCELADO";
    }
}

// 10) Crie a classe CaixaRegistradora
// Responsabilidades:
// - receber (catalogo, estoque, motorDePrecos)
// - fecharCompra({ cliente, carrinho, cupomCodigo, numeroDeParcelas }) => Pedido
// Regras:
// - Ao fechar compra, deve remover do estoque as quantidades compradas
// - Se numeroDeParcelas for informado, deve validar com base no Produto (máximo permitido)
// - Deve somar parcelas por item e imprimir um resumo no cupom (opcional, mas recomendado)

class CaixaRegistradora {
    constructor({ catalogo, estoque, motorDePrecos }) {
        this.catalogo = catalogo;
        this.estoque = estoque;
        this.motorDePrecos = motorDePrecos;
        this.contadorPedidos = 1;
    }

    fecharCompra({ cliente, carrinho, cupomCodigo = null, numeroDeParcelas = 1 }) {
        const itens = carrinho.listarItens();
        
        if (itens.length === 0) {
            throw new Error("O carrinho está vazio.");
        }

        for (const item of itens) {
            if (numeroDeParcelas > item.produto.numeroMaximoParcelas) {
                throw new Error(`O produto ${item.produto.nome} permite no máximo ${item.produto.numeroMaximoParcelas} parcelas.`);
            }
        }
        const breakdown = this.motorDePrecos.calcular({ cliente, itens, cupomCodigo });

        for (const item of itens) {
            this.estoque.remover(item.produto.sku, item.quantidade);
        }

        const novoPedido = new Pedido({
            id: `PED-${this.contadorPedidos++}`,
            clienteId: cliente.id,
            itens: itens, 
            breakdown: breakdown
        });
        novoPedido.breakdown.parcelasInfo = {
            numero: numeroDeParcelas,
            valorParcela: round2(breakdown.total / numeroDeParcelas)
        };

        return novoPedido;
    }
}
// 11) Crie a classe CupomFiscal
// Deve gerar texto em linhas (array de strings) contendo:
// - cabeçalho
// - itens: sku, quantidade, preço unitário, total do item
// - subtotal, descontos (linha por desconto), impostos (por categoria), frete, totalui 
// - status do pedido

class CupomFiscal {
    constructor({ pedido, catalogo }) {
        this.pedido = pedido;
        this.catalogo = catalogo;
    }
   
    gerarLinhas() {
        const linhas = [];
        const bd = this.pedido.breakdown;

        linhas.push("==============================");
        linhas.push(`CUPOM FISCAL - PEDIDO ${this.pedido.id}`);
        linhas.push("==============================");
        

        for (const item of this.pedido.itens) {
            const totalItem = item.quantidade * item.produto.preco;
            linhas.push(`${item.produto.sku.padEnd(10)} ${item.quantidade}x ${formatBRL(item.produto.preco)} = ${formatBRL(totalItem)}`);
        }

        linhas.push("------------------------------");
        linhas.push(`SUBTOTAL: ${formatBRL(bd.subtotal)}`);

        if (bd.descontos.length > 0) {
            for (const desc of bd.descontos) {
                linhas.push(`${desc.descricao.padEnd(16)} -${formatBRL(desc.valor)}`);
            }
        }
        if (bd.totalImpostos > 0) {
            linhas.push(`(Impostos inclusos: ${formatBRL(bd.totalImpostos)})`);
        }

        if (bd.frete > 0) {
            linhas.push(`FRETE: ${formatBRL(bd.frete)}`);
        } else {
            linhas.push(`FRETE:           GRÁTIS`);
        }

        linhas.push("==============================");
        linhas.push(`TOTAL: ${formatBRL(bd.total)}`);
        
        if (bd.parcelasInfo && bd.parcelasInfo.numero > 1) {
            linhas.push(`Parcelado em ${bd.parcelasInfo.numero}x de ${formatBRL(bd.parcelasInfo.valorParcela)}`);
        }
        
        linhas.push(`Status: ${this.pedido.status}`);
        linhas.push("==============================");

        return linhas;
    }
}
// ==========================================
// PARTE 4 - Relatórios (estruturas de dados + loops)
// ==========================================

// 12) Crie a classe RelatorioVendas
// - Deve armazenar pedidos pagos
// - Deve gerar:
//   - totalArrecadado()
//   - totalImpostos()
//   - totalDescontos()
//   - rankingProdutosPorQuantidade(topN)
//   - arrecadadoPorCategoria()
// Sugestão: use Map para acumular por sku/categoria.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

class RelatorioVendas {
    constructor() {
        this.pedidos = [];
    }

    registrarPedido(pedido) {

        if (pedido.status === "PAGO") {
            this.pedidos.push(pedido);
        }
    }

    totalArrecadado() {

        return this.pedidos.reduce((acc, p) => acc + p.breakdown.total, 0);
    }

    totalImpostos() {
        return this.pedidos.reduce((acc, p) => acc + p.breakdown.totalImpostos, 0);
    }

    totalDescontos() {
        return this.pedidos.reduce((acc, p) => acc + p.breakdown.totalDescontos, 0);
    }

    rankingProdutosPorQuantidade(topN = 5) {
        const mapaQtd = new Map();

        for (const pedido of this.pedidos) {

            for (const item of pedido.itens) {
                const atual = mapaQtd.get(item.produto.sku) || 0;
                mapaQtd.set(item.produto.sku, atual + item.quantidade);
            }
        }

        const ordenado = Array.from(mapaQtd.entries())
                              .sort((a, b) => b[1] - a[1]) 
                              .slice(0, topN);

        return ordenado.map(entry => `${entry[0]}: ${entry[1]}`);
    }

    arrecadadoPorCategoria() {
        const mapaCat = {};

        for (const pedido of this.pedidos) {
            for (const item of pedido.itens) {
                const valorItem = item.quantidade * item.produto.preco;
                
                if (!mapaCat[item.produto.categoria]) {
                    mapaCat[item.produto.categoria] = 0;
                }
                mapaCat[item.produto.categoria] += valorItem;
            }
        }
        
        // Arredondar valores
        for (const cat in mapaCat) {
            mapaCat[cat] = formatBRL(mapaCat[cat]);
        }

        return mapaCat;
    }
}

class Impressora {
    // Mudamos o nome para imprimirLinhas para bater com a linha 864 do teu erro
    imprimirLinhas(linhas) {
        if (Array.isArray(linhas)) {
            linhas.forEach(linha => console.log(linha));
        } else {
            console.log(linhas);
        }
    }
    
    // Mantemos este também por precaução, caso seja usado noutro lado
    imprimir(cupom) {
        const linhas = cupom.gerarLinhas();
        this.imprimirLinhas(linhas);
    }
}

// ==========================================
// DADOS DE TESTE (para o demo)
// ==========================================

function seedCatalogoEEstoque() {
	const catalogo = new Catalogo();
	const estoque = new Estoque();

	const produtos = [
		// alimentos
		{ sku: "ARROZ", nome: "Arroz 1kg", preco: 6.0, fabricante: "Marca A", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "FEIJAO", nome: "Feijão 1kg", preco: 7.5, fabricante: "Marca B", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "OLEO", nome: "Óleo 900ml", preco: 8.0, fabricante: "Marca C", categoria: "alimentos", numeroMaximoParcelas: 1 },
		// vestuário
		{ sku: "CAMISETA", nome: "Camiseta", preco: 30.0, fabricante: "Hering", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "CALCA", nome: "Calça Jeans", preco: 120.0, fabricante: "Levis", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "MEIA", nome: "Meia", preco: 10.0, fabricante: "Puket", categoria: "vestuário", numeroMaximoParcelas: 6 },
		// eletrodoméstico
		{ sku: "MICRO", nome: "Micro-ondas", preco: 499.9, fabricante: "LG", categoria: "eletrodoméstico", numeroMaximoParcelas: 12 },
		{ sku: "LIQUID", nome: "Liquidificador", preco: 199.9, fabricante: "Philco", categoria: "eletrodoméstico", numeroMaximoParcelas: 10 },
		// decoração
		{ sku: "VASO", nome: "Vaso Decorativo", preco: 89.9, fabricante: "Tok&Stok", categoria: "decoração", numeroMaximoParcelas: 5 },
		// materiais de construção
		{ sku: "CIMENTO", nome: "Cimento 25kg", preco: 35.0, fabricante: "Holcim", categoria: "materiais de construção", numeroMaximoParcelas: 3 }
	];

	for (const p of produtos) {
		const produto = new Produto(p);
		catalogo.adicionarProduto(produto);
	}

	// Estoque inicial
	estoque.definirQuantidade("ARROZ", 50);
	estoque.definirQuantidade("FEIJAO", 50);
	estoque.definirQuantidade("OLEO", 50);
	estoque.definirQuantidade("CAMISETA", 20);
	estoque.definirQuantidade("CALCA", 10);
	estoque.definirQuantidade("MEIA", 30);
	estoque.definirQuantidade("MICRO", 5);
	estoque.definirQuantidade("LIQUID", 8);
	estoque.definirQuantidade("VASO", 10);
	estoque.definirQuantidade("CIMENTO", 100);

	return { catalogo, estoque };
}

// ==========================================
// DEMO (cenários obrigatórios)
// ==========================================

// Critérios de aceite (quando você terminar):
// - Cenário A: cliente VIP, sem cupom, compra vestuário com regra leve-3-pague-2
// - Cenário B: cliente REGULAR com cupom ETIC10
// - Cenário C: cupom inválido deve gerar erro
// - Cenário D: tentar comprar acima do estoque deve gerar erro
// - Cenário E: relatório deve refletir pedidos pagos

function runDemo() {
	const { catalogo, estoque } = seedCatalogoEEstoque();
	const motor = new MotorDePrecos({ catalogo });
	const caixa = new CaixaRegistradora({ catalogo, estoque, motorDePrecos: motor });
	const relatorio = new RelatorioVendas();
	const impressora = new Impressora();

	const clienteVip = new Cliente({ id: "C1", nome: "Ana", tipo: "VIP", saldoPontos: 0 });
	const clienteRegular = new Cliente({ id: "C2", nome: "Bruno", tipo: "REGULAR", saldoPontos: 0 });

	// Cenário A
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("CAMISETA", 2);
		carrinho.adicionarItem("MEIA", 1);
		carrinho.adicionarItem("CALCA", 1);

		const pedido = caixa.fecharCompra({
			cliente: clienteVip,
			carrinho,
			cupomCodigo: null,
			numeroDeParcelas: 3
		});

		pedido.pagar();
		relatorio.registrarPedido(pedido);

		const cupom = new CupomFiscal({ pedido, catalogo });
		impressora.imprimirLinhas(cupom.gerarLinhas());
	}

	// Cenário B
	// Cenário B com proteção
{
    const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
    carrinho.adicionarItem("MICRO", 1);
    carrinho.adicionarItem("VASO", 1);

    try {
        const pedido = caixa.fecharCompra({
            cliente: clienteRegular,
            carrinho,
            cupomCodigo: "ETIC10",
            numeroDeParcelas: 10 // Isto vai disparar o erro
        });

        pedido.pagar();
        relatorio.registrarPedido(pedido);

        const cupom = new CupomFiscal({ pedido, catalogo });
        impressora.imprimirLinhas(cupom.gerarLinhas());
    } catch (err) {
        console.log("(OK) Erro esperado nas parcelas do Vaso:");
        console.log(err.message);
    }
}

	// Cenário C (cupom inválido)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("ARROZ", 1);

		try {
			caixa.fecharCompra({ cliente: clienteRegular, carrinho, cupomCodigo: "INVALIDO" });
		} catch (err) {
			console.log("(OK) Cupom inválido gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário D (estoque insuficiente)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		try {
			carrinho.adicionarItem("MICRO", 999);
		} catch (err) {
			console.log("(OK) Estoque insuficiente gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário E (relatório)
	{
		console.log("==============================");
		console.log("Relatório");
		console.log("==============================");
		console.log("Total arrecadado:", formatBRL(relatorio.totalArrecadado()));
		console.log("Total impostos:", formatBRL(relatorio.totalImpostos()));
		console.log("Total descontos:", formatBRL(relatorio.totalDescontos()));
		console.log("Top produtos:", relatorio.rankingProdutosPorQuantidade(3));
		console.log("Por categoria:", relatorio.arrecadadoPorCategoria());
	}
}

// Quando terminar tudo, descomente:
runDemo();