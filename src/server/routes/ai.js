import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post('/analyze-prospects', async (req, res) => {
  try {
    const { prospects } = req.body;

    const analysisPrompt = `Tu es un expert en vente. Analyse ces prospects:

${prospects.map((p, idx) => `
Prospect ${idx + 1}: ${p.raison_sociale} - ${p.contact} (${p.statut}) - Secteur: ${p.secteur || 'N/A'}
`).join('\n')}

Fournis une analyse avec:
1. RÉSUMÉ
2. PROSPECTS PRIORITAIRES
3. OPPORTUNITÉS
4. ACTIONS RECOMMANDÉES
5. TAUX DE CONVERSION
6. SECTEURS
7. TENDANCES`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        { role: 'user', content: analysisPrompt }
      ],
    });

    res.json({ analysis: message.content[0].text });
  } catch (error) {
    console.error('Erreur API:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;