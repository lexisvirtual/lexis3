/**
 * Leo's Long-Tail Strategy (2026) - Versão Plano de 6 Meses
 * Mapeamento estrito para dominar os clusters semânticos da Lexis.
 */

export const LEO_CLUSTERS = {
    // MÊS 1: INTENÇÃO INFORMACIONAL (Clusters 1, 2, 5)
    "info-imersao": [
        "o que e ingles por imersao e como funciona",
        "vale a pena fazer imersao em ingles no brasil",
        "quanto tempo dura uma imersao para adultos",
        "diferenca entre imersao total e curso tradicional",
        "quem deve fazer imersao em ingles para acelerar",
        "como planejar sua primeira imersao em ingles",
        "estágios de evolução em um programa de imersão",
        "a verdade sobre imersão em ingles presencial"
    ],
    "info-intensivo": [
        "como funciona um curso de ingles intensivo",
        "ingles intensivo de 120 horas funciona mesmo",
        "estudar 10 horas por dia de ingles e produtivo",
        "ingles intensivo vs extensivo: qual escolher",
        "metodo 3f lexis para aprendizado intensivo",
        "como se preparar para um curso intensivo de 2 semanas",
        "curso intensivo para quem tem pressa na fluencia",
        "o que voce aprende em 15 dias de curso intensivo"
    ],
    "resultados-tempo": [
        "quanto tempo leva para ficar fluente em ingles",
        "e possivel aprender ingles em 30 dias de verdade",
        "como acelerar a fluencia em ingles para o trabalho",
        "carga horaria ideal para falar ingles fluente",
        "ciclos de aprendizado: de zero a fluencia funcional",
        "por que 120 horas equivalem a 1 ano de curso",
        "velocidade de aprendizado e retencao cognitiva",
        "quanto tempo para perder o medo de falar ingles"
    ],

    // MÊS 2: COMPARATIVOS (Cluster 4)
    "comparativos": [
        "imersao no brasil vs intercambio no exterior",
        "curso intensivo vs escola regular de ingles",
        "imersao total vs aulas online particulares",
        "intensivo nas ferias vale a pena para adultos",
        "intercambio nacional funciona mesmo para fluencia",
        "melhor forma de aprender ingles rapido e com retencao",
        "imersao lexis vs cursos tradicionais de franquia",
        "custo beneficio: intercambio fora vs imersao brasil"
    ],

    // MÊS 3: AUTORIDADE E NEUROCIÊNCIA (Cluster 6, 10)
    "neurociencia": [
        "neurociencia da imersao: como o cerebro aprende",
        "por que o cerebro aprende mais rapido sob pressao social",
        "memoria procedural e o aprendizado de idiomas",
        "aprendizado contextual vs memorizacao de regras",
        "como o metodo 3f usa a neuroplasticidade",
        "estudo de caso: evolucao de alunos na imersao",
        "dados reais sobre retencao em cursos intensivos",
        "por que adultos demoram para falar ingles (e como resolver)"
    ],

    // MÊS 4: PERFIS ESPECÍFICOS (Cluster 7)
    "perfis-conversao": [
        "ingles intensivo para adultos acima de 30 anos",
        "imersao para profissionais e executivos de elite",
        "ingles para entrevistas de emprego internacional rapido",
        "curso intensivo para viagens de negocios urgentes",
        "imersao em ingles para quem trabalha em tech",
        "ingles para empresas: treinamentos intensivos in-company",
        "programa intensivo personalizado para cargos de lideranca",
        "como o ingles fluente impacta o salario de um executivo"
    ],

    // MÊS 5: LOCAL SEO E OBJEÇÕES (Cluster 8, 9)
    "local-objecoes": [
        "ingles por imersao em sao paulo e regiao",
        "melhor curso intensivo de ingles no interior de sp",
        "imersao em ingles e muito cansativa? mitos e verdades",
        "imersao funciona para iniciantes do zero absoluto",
        "quanto custa um programa de imersao total de elite",
        "preciso ter base de ingles antes de fazer imersao",
        "como funciona o suporte pos-imersao na lexis",
        "intercambio no brasil em sao carlos: o campus lexis"
    ]
};

export function getLeoTarget(dayOfYear) {
    // Define o mês atual baseado no dia do ano (assumindo que começamos hoje)
    // Mas para automação pura, vamos usar ciclos baseados no dia do ano
    const allCategories = Object.keys(LEO_CLUSTERS);

    // Lógica de Progressão Mensal:
    // Mês 1 (Janeiro/Fevereiro no plano): Info
    // Vamos distribuir as categorias pelos meses do ano
    const month = new Date().getMonth(); // 0-11
    let currentMonthClusters = [];

    if (month <= 1) { // Mês 1 (Início)
        currentMonthClusters = ["info-imersao", "info-intensivo", "resultados-tempo"];
    } else if (month === 2) { // Mês 2
        currentMonthClusters = ["comparativos"];
    } else if (month === 3) { // Mês 3
        currentMonthClusters = ["neurociencia"];
    } else if (month === 4) { // Mês 4
        currentMonthClusters = ["perfis-conversao"];
    } else { // Mês 5 e 6
        currentMonthClusters = ["local-objecoes", "comparativos", "neurociencia"];
    }

    const category = currentMonthClusters[dayOfYear % currentMonthClusters.length];
    const variations = LEO_CLUSTERS[category];
    const topic = variations[dayOfYear % variations.length];

    return {
        category,
        topic,
        cluster: category.replace(/-/g, ' ')
    };
}
