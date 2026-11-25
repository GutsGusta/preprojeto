export function mascaraTelefone(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    return numeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d)(\d{4})$/, "$1-$2");
}

export function mascaraCPF(valor) {
    return valor
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascaraCNPJ(valor) {
    return valor
        .replace(/\D/g, "")
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}