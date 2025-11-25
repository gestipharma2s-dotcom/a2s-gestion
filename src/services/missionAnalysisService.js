// Service IA simplifié pour l'analyse des missions
// Retourne null si pas de clé API (les données par défaut seront utilisées)

const generateMissionAnalysis = async (stats, missionData) => {
  try {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    const provider = import.meta.env.VITE_AI_PROVIDER || 'openai';
    
    console.log('🤖 Démarrage analyse IA pour missions...');
    console.log('Provider:', provider);
    console.log('API Key présente:', apiKey ? 'Oui ✅' : 'Non ❌');
    
    // Si pas de clé API, retourner null pour utiliser les données par défaut
    if (!apiKey) {
      console.warn('⚠️ API IA non configurée. Utilisation des données par défaut.');
      return null;
    }

    // Sécuriser l'accès aux propriétés
    const safeStats = {
      totalMissions: stats?.totalMissions || 0,
      enCours: stats?.enCours || 0,
      completees: stats?.completees || 0,
      retardees: stats?.retardees || 0,
      budgetTotal: stats?.budgetTotal || 0,
      depenses: stats?.depenses || 0,
      tauxUtilisation: stats?.tauxUtilisation || 0,
      avantageMoyen: stats?.avantageMoyen || 0
    };

    const prompt = `Tu es un expert en gestion de projets et missions.

Analyse ces données de missions et fournis EXACTEMENT 4 insights en français, court et direct (max 40 mots par insight).

DONNÉES MISSIONS:
- Total missions: ${safeStats.totalMissions}
- En cours: ${safeStats.enCours}
- Complétées: ${safeStats.completees}
- Retardées: ${safeStats.retardees}
- Budget total: ${safeStats.budgetTotal} DA
- Dépenses: ${safeStats.depenses} DA
- Taux utilisation budget: ${safeStats.tauxUtilisation}%
- Avancement moyen: ${safeStats.avantageMoyen}%

INSTRUCTIONS - Fournis 4 insights JSON avec categories:
1. RISQUE - Problème potentiel
2. OPPORTUNITE - Point fort
3. ACTION - Recommandation immédiate  
4. TENDANCE - Pattern observé

FORMAT JSON STRICT (RÉPONDS UNIQUEMENT CECI):
[
  {"type": "risque", "title": "Titre court", "message": "Insight avec emoji et chiffres"},
  {"type": "opportunite", "title": "Titre court", "message": "Insight avec emoji et chiffres"},
  {"type": "action", "title": "Titre court", "message": "Insight avec emoji et chiffres"},
  {"type": "tendance", "title": "Titre court", "message": "Insight avec emoji et chiffres"}
]`;

    let insights = null;

    if (provider === 'gemini') {
      // 🚀 GOOGLE GEMINI API
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      console.log('📡 Appel API Gemini...');
      
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

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Erreur API Gemini:', error);
        return null;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        try {
          const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          insights = JSON.parse(cleanContent);
        } catch (e) {
          console.warn('⚠️ Impossible de parser la réponse Gemini:', e.message);
          return null;
        }
      }
    } else {
      // 🔵 OPENAI API
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
              content: 'Tu es un expert en gestion. Réponds UNIQUEMENT en JSON valide.'
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
        console.error('❌ Erreur API OpenAI:', response.status);
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        try {
          const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          insights = JSON.parse(cleanContent);
        } catch (e) {
          console.warn('⚠️ Impossible de parser la réponse OpenAI:', e.message);
          return null;
        }
      }
    }

    // Valider le format
    if (insights && Array.isArray(insights) && insights.length === 4) {
      console.log('✅ Analyse IA générée - 4 insights validés');
      return insights;
    } else {
      console.warn('⚠️ Format d\'insights invalide');
      return null;
    }

  } catch (error) {
    console.error('❌ Erreur analyse IA:', error.message);
    return null;
  }
};

export default generateMissionAnalysis;
