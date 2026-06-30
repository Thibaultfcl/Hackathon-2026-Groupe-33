const LOREM_BANK = [
  "Selon l'analyse des derniers indicateurs financiers, la tendance reste stable sur le trimestre.",
  "Le ratio d'endettement net est passé de 0,42 à 0,38, ce qui traduit un désendettement progressif.",
  "Plusieurs postes du compte de résultat méritent une attention particulière avant la clôture.",
  "Voici un récapitulatif structuré des éléments à surveiller dans votre portefeuille.",
  "La trésorerie disponible couvre actuellement environ huit mois de charges fixes.",
  "Il convient de croiser ces chiffres avec les prévisions établies au dernier comité budgétaire.",
  "Une marge opérationnelle en légère hausse confirme l'efficacité des mesures engagées.",
  "Ces éléments restent indicatifs et doivent être confirmés par votre service comptable.",
];

const SAMPLE_TABLE = `

| Indicateur | T-1 | T0 | Variation |
|---|---|---|---|
| Chiffre d'affaires | 4,2M€ | 4,6M€ | +9,5% |
| EBITDA | 0,9M€ | 1,1M€ | +22% |
| Trésorerie nette | 1,8M€ | 2,1M€ | +16% |
`;

const SAMPLE_CODE = `

\`\`\`python
def ratio_endettement(dette_nette, capitaux_propres):
    return round(dette_nette / capitaux_propres, 2)
\`\`\`
`;

function buildMockAnswer(userText) {
  const intro = LOREM_BANK[Math.floor(Math.random() * LOREM_BANK.length)];
  const extra = LOREM_BANK[Math.floor(Math.random() * LOREM_BANK.length)];
  let answer = `${intro} ${extra}`;
  if (/tableau|table|chiffre|indicateur/i.test(userText)) {
    answer += SAMPLE_TABLE;
  }
  if (/code|formule|calcul|ratio/i.test(userText)) {
    answer += SAMPLE_CODE;
  }
  return answer;
}

/**
 * Crée un ReadableStream qui émet la réponse mock mot par mot,
 * pour simuler le comportement de streaming d'un vrai LLM.
 */
export function createMockStream(userText) {
  const fullText = buildMockAnswer(userText || "");
  const words = fullText.split(/(\s+)/); // garde les espaces comme tokens
  const encoder = new TextEncoder();
  let i = 0;

  return new ReadableStream({
    async pull(controller) {
      if (i >= words.length) {
        controller.close();
        return;
      }
      await new Promise((r) => setTimeout(r, 35 + Math.random() * 45));
      controller.enqueue(encoder.encode(words[i]));
      i += 1;
    },
  });
}
