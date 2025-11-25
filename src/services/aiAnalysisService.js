export const aiAnalysisService = {
  async analyzeProspects(prospects) {
    try {
      const analysisPrompt = `Tu es un expert en vente et en gestion de prospects. Analyse ces prospects et fournisse une analyse globale détaillée et actionnelle:

${prospects.map((p, idx) => `
Prospect ${idx + 1}:
- Raison Sociale: ${p.raison_sociale}
- Contact: ${p.contact}
- Secteur: ${p.secteur || 'Non spécifié'}
- Statut: ${p.statut}
- Email: ${p.email || 'Non fourni'}
- Téléphone: ${p.telephone || 'Non fourni'}
`).join('\n')}

Fournis une analyse structurée avec:
1. RÉSUMÉ: Nombre total de prospects, répartition par statut
2. PROSPECTS PRIORITAIRES: Les 3-5 à relancer en urgence
3. OPPORTUNITÉS: Les plus prometteurs
4. ACTIONS RECOMMANDÉES: 5-7 actions concrètes
5. TAUX DE CONVERSION: Estimation et comment l'augmenter
6. SECTEURS: Les plus représentés
7. TENDANCES: Observations et insights

Sois concis mais détaillé.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [
            { role: 'user', content: analysisPrompt }
          ],
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur API');
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Erreur analyse:', error);
      throw error;
    }
  }
};