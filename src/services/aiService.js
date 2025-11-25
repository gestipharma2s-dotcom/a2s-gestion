// Service IA pour générer des analyses basées sur les données
// Support: Google Gemini (gratuit) et OpenAI GPT
const generateAIAnalysis = async (stats, resteAPayerData) => {
  try {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    const provider = import.meta.env.VITE_AI_PROVIDER || 'openai';
    
    console.log('🤖 Démarrage analyse IA...');
    console.log('Provider:', provider);
    console.log('API Key présente:', apiKey ? 'Oui ✅' : 'Non ❌');
    
    if (!apiKey) {
      console.warn('⚠️ API IA non configurée. Utilisation des analyses par défaut.');
      return null;
    }

    // Préparer les données pour l'IA
    const dataContext = {
      totalClients: stats.totalClients,
      prospects: stats.prospects,
      revenus: stats.revenus,
      resteAPayer: stats.resteAPayer,
      totalInstallations: stats.totalInstallations,
      tauxConversion: stats.tauxConversion,
      tauxRecouvrement: ((stats.revenus / (stats.totalInstallations || 1)) * 100).toFixed(1),
      top5Dettes: resteAPayerData.slice(0, 5).map(c => ({
        client: c.client,
        montant: c.montant
      }))
    };

    const prompt = `Tu es un analyste financier expert pour A2S Gestion, société de logiciels pharmaceutiques en Algérie.

Analyse ces données et fournis EXACTEMENT 4 insights en français (max 50 mots chacun).

DONNÉES FINANCIÈRES:
- Clients actifs: ${dataContext.totalClients}
- Prospects en cours: ${dataContext.prospects}
- Revenus encaissés: ${dataContext.revenus.toLocaleString('fr-FR')} DA
- Reste à payer: ${dataContext.resteAPayer.toLocaleString('fr-FR')} DA
- Total installations: ${dataContext.totalInstallations.toLocaleString('fr-FR')} DA
- Taux de conversion: ${dataContext.tauxConversion}%
- Taux de recouvrement: ${dataContext.tauxRecouvrement}%
- Top 5 clients débiteurs: ${JSON.stringify(dataContext.top5Dettes)}

INSTRUCTIONS:
Fournis 4 insights avec ces catégories exactes:
1. POSITIVE - Tendance encourageante
2. WARNING - Point d'attention urgent
3. INFO - Métrique clé à surveiller
4. ACTION - Recommandation actionnable

FORMAT JSON STRICT:
[
  {"type": "positive", "title": "Titre court", "message": "Insight concis avec chiffres clés"},
  {"type": "warning", "title": "Titre court", "message": "Insight concis avec chiffres clés"},
  {"type": "info", "title": "Titre court", "message": "Insight concis avec chiffres clés"},
  {"type": "action", "title": "Titre court", "message": "Insight concis avec chiffres clés"}
]

RÉPONDS UNIQUEMENT EN JSON, RIEN D'AUTRE.`;

    let insights = null;

    if (provider === 'gemini') {
      // 🚀 GOOGLE GEMINI API - Modèle correct: gemini-2.0-flash
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      console.log('📡 Appel API Gemini (v1beta/gemini-2.0-flash)...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.95,
            topK: 40
          }
        })
      });

      console.log('Statut réponse Gemini:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Erreur API Gemini:', error);
        throw new Error('Erreur API Gemini');
      }

      const data = await response.json();
      console.log('✅ Réponse Gemini reçue');
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        console.log('📝 Contenu brut:', content.substring(0, 200) + '...');
        try {
          // Nettoyer la réponse (enlever les backticks markdown si présents)
          const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          insights = JSON.parse(cleanContent);
          console.log('✅ JSON parsé avec succès:', insights.length, 'insights');
        } catch (e) {
          console.warn('⚠️ Impossible de parser la réponse Gemini:', e.message);
          console.log('Contenu complet:', content);
          return null;
        }
      } else {
        console.warn('⚠️ Aucun contenu dans la réponse Gemini');
      }

    } else {
      // 🔵 OPENAI API (fallback)
      const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1/chat/completions';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Tu es un analyste financier expert. Réponds UNIQUEMENT en JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API OpenAI');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        try {
          const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          insights = JSON.parse(cleanContent);
        } catch (e) {
          console.warn('⚠️ Impossible de parser la réponse OpenAI');
          return null;
        }
      }
    }

    // Valider le format
    if (insights && Array.isArray(insights) && insights.length === 4) {
      console.log('✅ Analyse IA générée avec succès - 4 insights validés');
      return insights;
    } else {
      console.warn('⚠️ Format d\'insights invalide:', insights);
      return null;
    }

  } catch (error) {
    console.error('❌ Erreur génération analyse IA:', error.message);
    console.error('Détails:', error);
    return null;
  }
};

export default generateAIAnalysis;
