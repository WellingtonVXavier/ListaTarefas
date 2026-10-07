const { createApp } = Vue;

function paraCentavos(texto) {
    const normalizado = String(texto).trim().replace(/\s/g, '').replace(',', '.');
    if (normalizado === '') return null;

    const numero = Number(normalizado);
    if (!Number.isFinite(numero) || numero < 0) return null;

    return Math.round(numero * 100);
}

function calcularOperacao(esquerda, operador, direita) {
    const mapa = {
        '+': esquerda + direita,
        '-': esquerda - direita,
        '*': esquerda * direita,
        '/': direita === 0 ? NaN : esquerda / direita,
    };
    return mapa[operador];
}

createApp({
    data() {
        return {
            itens: [],
            proximoId: 1,
            novoNome: '',
            novoValor: '',
            extraCentavos: 0,
            calcVisor: '0',
            calcAnterior: null,
            calcOperador: null,
            calcNovoNumero: true,
        };
    },
    computed: {
        somaLista() {
            return this.itens
                .filter((item) => item.ativa)
                .reduce((total, item) => total + item.centavos, 0);
        },
        somaMarcados() {
            return this.itens
                .filter((item) => item.ativa && item.marcado)
                .reduce((total, item) => total + item.centavos, 0);
        },
        totalPagar() {
            return this.somaMarcados + this.extraCentavos;
        },
    },
    methods: {
        formatarMoeda(centavos) {
            return (centavos / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
        },
        adicionarItem() {
            const nome = this.novoNome.trim();
            const centavos = paraCentavos(this.novoValor);

            if (!nome) {
                alert('Digite o nome do item.');
                return;
            }
            if (centavos === null) {
                alert('Digite um valor válido, como 12,50.');
                return;
            }

            this.itens.push({
                id: this.proximoId++,
                nome,
                centavos,
                marcado: true,
                ativa: true,
                editando: false,
                rascunhoNome: '',
                rascunhoValor: '',
            });

            this.novoNome = '';
            this.novoValor = '';
        },
        iniciarEdicao(item) {
            this.itens.forEach((atual) => {
                atual.editando = atual.id === item.id;
            });
            item.rascunhoNome = item.nome;
            item.rascunhoValor = (item.centavos / 100).toFixed(2).replace('.', ',');
        },
        cancelarEdicao(item) {
            item.editando = false;
        },
        salvarEdicao(item) {
            const nome = item.rascunhoNome.trim();
            const centavos = paraCentavos(item.rascunhoValor);

            if (!nome) {
                alert('O item não pode ficar vazio.');
                return;
            }
            if (centavos === null) {
                alert('Digite um valor válido, como 12,50.');
                return;
            }

            item.nome = nome;
            item.centavos = centavos;
            item.editando = false;
        },
        alternarAtiva(item) {
            item.ativa = !item.ativa;
            if (!item.ativa) item.marcado = false;
        },
        excluirItem(item) {
            this.itens = this.itens.filter((atual) => atual.id !== item.id);
        },
        teclar(digito) {
            if (this.calcNovoNumero) {
                this.calcVisor = digito === ',' ? '0,' : digito;
                this.calcNovoNumero = false;
                return;
            }

            if (digito === ',' && this.calcVisor.includes(',')) return;
            if (this.calcVisor === '0' && digito !== ',') {
                this.calcVisor = digito;
                return;
            }

            this.calcVisor += digito;
        },
        visorParaNumero() {
            return Number(this.calcVisor.replace(',', '.'));
        },
        definirOperacao(operador) {
            const atual = this.visorParaNumero();
            if (!Number.isFinite(atual)) return;

            if (this.calcAnterior !== null && this.calcOperador && !this.calcNovoNumero) {
                const resultado = calcularOperacao(this.calcAnterior, this.calcOperador, atual);
                if (!Number.isFinite(resultado)) {
                    this.limparCalc();
                    this.calcVisor = 'Erro';
                    this.calcNovoNumero = true;
                    return;
                }
                this.calcAnterior = resultado;
                this.calcVisor = this.formatarVisor(resultado);
            } else {
                this.calcAnterior = atual;
            }

            this.calcOperador = operador;
            this.calcNovoNumero = true;
        },
        calcular() {
            if (this.calcAnterior === null || !this.calcOperador) return;

            const atual = this.visorParaNumero();
            const resultado = calcularOperacao(this.calcAnterior, this.calcOperador, atual);

            if (!Number.isFinite(resultado)) {
                this.limparCalc();
                this.calcVisor = 'Erro';
                this.calcNovoNumero = true;
                return;
            }

            this.calcVisor = this.formatarVisor(resultado);
            this.calcAnterior = null;
            this.calcOperador = null;
            this.calcNovoNumero = true;
        },
        formatarVisor(numero) {
            const texto = String(Number(numero.toFixed(10)));
            return texto.replace('.', ',');
        },
        limparCalc() {
            this.calcVisor = '0';
            this.calcAnterior = null;
            this.calcOperador = null;
            this.calcNovoNumero = true;
        },
        apagarCalc() {
            if (this.calcNovoNumero || this.calcVisor.length <= 1) {
                this.calcVisor = '0';
                this.calcNovoNumero = true;
                return;
            }
            this.calcVisor = this.calcVisor.slice(0, -1);
        },
        somarExtra() {
            const valor = this.visorParaNumero();
            if (!Number.isFinite(valor) || valor < 0) {
                alert('Use um valor válido na calculadora para somar à compra.');
                return;
            }
            this.extraCentavos += Math.round(valor * 100);
            this.limparCalc();
        },
    },
}).mount('#app');
