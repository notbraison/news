import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface SuggestionResponse {
  title?: string;
  excerpt?: string;
  content?: string;
  error?: string;
}

interface OpenAIError extends Error {
  status?: number;
  code?: string;
  type?: string;
}

export const generateSuggestions = async (
  prompt: string,
  type: 'title' | 'excerpt' | 'content'
): Promise<SuggestionResponse> => {
  try {
    if (!prompt.trim()) {
      throw new Error('Empty prompt provided');
    }

    let systemPrompt = '';
    switch (type) {
      case 'title':
        systemPrompt = 'Generate a compelling, SEO-friendly news article title based on the following content. Keep it concise, engaging, and under 60 characters.';
        break;
      case 'excerpt':
        systemPrompt = 'Generate a brief, engaging excerpt/summary for a news article based on the following content. Keep it between 150-200 characters.';
        break;
      case 'content':
        systemPrompt = 'Generate a well-structured, journalistic news article based on the following prompt. Include relevant details, quotes if applicable, and maintain a professional tone. The article should be at least 500 words.';
        break;
    }

    console.log('Generating suggestion for:', type);
    console.log('Prompt:', prompt);

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: type === 'content' ? 2000 : 100,
    });

    const suggestion = completion.choices[0]?.message?.content;
    
    if (!suggestion) {
      throw new Error('No suggestion received from OpenAI');
    }

    console.log('Received suggestion:', suggestion);

    return {
      [type]: suggestion.trim()
    };
  } catch (error) {
    const openAIError = error as OpenAIError;
    console.error('OpenAI API Error:', openAIError);
    return {
      error: openAIError.message || 'Failed to generate suggestion'
    };
  }
}; 