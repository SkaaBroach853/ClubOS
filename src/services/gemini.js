import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiKey = (userKey) => {
  if (userKey) return userKey;
  return import.meta.env.VITE_GEMINI_API_KEY || "";
};

export const AGENTS = {
  social: { id: "social", title: "Social Media Content", system: "You are a social media expert for college clubs in India. Given an event brief, return EXACTLY this JSON structure: { \"instagram\": \"...\", \"linkedin\": \"...\", \"whatsapp\": \"...\" }. Instagram: punchy, 3-4 emojis, 5 relevant hashtags, under 150 chars. LinkedIn: professional, story-driven, 3 short paragraphs. WhatsApp: friendly, bullet points, key details only. Return ONLY valid JSON." },
  presentation: { id: "presentation", title: "Presentation Outline", system: "You are a presentation coach. Given an event brief, return EXACTLY this JSON: { \"slides\": [ { \"title\": \"...\", \"bullets\": [\"...\",\"...\",\"...\"] } ] } for exactly 8 slides. Make slide titles punchy and bullets specific to the event. Return ONLY valid JSON." },
  emails: { id: "emails", title: "Outreach Emails", system: "You are a professional communications writer. Given an event brief, return EXACTLY this JSON: { \"sponsor\": \"...\", \"college_announcement\": \"...\", \"speaker_invite\": \"...\" }. Each email: subject line + body, formal tone, specific and compelling. Return ONLY valid JSON." },
  ideas: { id: "ideas", title: "Wild Ideas", system: "You are a creative event designer known for viral campus events. Given an event brief, return EXACTLY this JSON: { \"ideas\": [\"...\",\"...\",\"...\",\"...\",\"...\"] } — 5 completely unexpected, creative, specific ideas that would make this event go viral on campus. Be bold. Return ONLY valid JSON." },
  checklist: { id: "checklist", title: "Ops Checklist", system: "You are an experienced event manager. Given an event brief, return EXACTLY this JSON: { \"checklist\": [ { \"week\": \"Week 1\", \"tasks\": [\"...\",\"...\"] }, { \"week\": \"Week 2\", \"tasks\": [\"...\"] }, { \"week\": \"Event Day\", \"tasks\": [\"...\",\"...\",\"...\"] } ] }. Make tasks specific and actionable. Return ONLY valid JSON." },
  flyer: { id: "flyer", title: "Flyer Generator", system: "You are a graphic designer. Given an event brief, return EXACTLY this JSON: { \"headline\": \"...\", \"subheadline\": \"...\", \"date\": \"...\", \"venue\": \"...\", \"highlights\": [\"...\",\"...\",\"...\"], \"cta\": \"...\", \"colorTheme\": \"dark|vibrant|minimal\", \"emojiAccent\": \"🚀\" }. Return ONLY valid JSON." }
};

/**
 * Core utility to invoke the Google Gemini AI Model.
 * This is the central engine for ClubOS, automating tasks for college hackathons, fests, and clubs.
 * 
 * @param {string} systemInstruction - The strict prompt template enforcing JSON schema.
 * @param {string} userPrompt - The event brief provided by the college club organizer.
 * @param {string} [userKey] - Optional override for the Gemini API Key (defaults to process env).
 * @returns {Promise<Object>} The parsed JSON output from the AI.
 * @throws {Error} Throws "NO_KEY" if no API key is found.
 */
const invokeGemini = async (systemInstruction, userPrompt, userKey) => {
  const apiKey = getGeminiKey(userKey);
  if (!apiKey) throw new Error("NO_KEY");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
  const generationConfig = { responseMimeType: "application/json" };
  const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: userPrompt }] }], generationConfig });
  return JSON.parse(result.response.text());
};

export const generateAgentContent = async (agentConfig, brief, userKey) => {
  return await invokeGemini(agentConfig.system, brief, userKey);
};

export const generateLinkedInCollabs = async (originalPost, collaborators, userKey) => {
  const system = `Given this LinkedIn post and these collaborators: ${collaborators}, rewrite the post to naturally mention each collaborator in a relevant, authentic way. Add their @mentions at the end. Return EXACTLY this JSON: { "rewritten": "..." }`;
  const result = await invokeGemini(system, originalPost, userKey);
  return result.rewritten;
};

export const generateLinkedInVariants = async (originalPost, userKey) => {
  const system = "Given this LinkedIn post, generate 3 completely different rewrites. Each should have a different tone: Variant 1: Hype/excitement tone. Variant 2: Thoughtful/reflective tone. Variant 3: Data-driven/professional tone. Return ONLY this JSON: { \"v1\": \"...\", \"v2\": \"...\", \"v3\": \"...\" }";
  return await invokeGemini(system, originalPost, userKey);
};

export const generateContentCalendar = async (clubType, frequency, startDate, userKey) => {
  const system = `You are a social media manager for a college ${clubType} club in India. Generate a content calendar for ${frequency} posts starting from ${startDate} for the next 4 weeks. For each post return EXACTLY this JSON structure: { "posts": [ { "week": "Week 1", "date": "...", "theme": "...", "instagram": "...", "linkedin": "...", "contentIdea": "..." } ] }. Make each post unique — mix motivational, educational, behind-the-scenes, event-teaser, and fun content types. All content must feel authentic to Indian college culture. Return ONLY valid JSON.`;
  return await invokeGemini(system, "Generate calendar", userKey);
};

export const generateBudgetAI = async (amount, type, attendees, userKey) => {
  const system = `You are an expert college event budget planner in India. Given total budget ₹${amount}, event type ${type}, and ${attendees} attendees, return ONLY this JSON: { "breakdown": [ { "category": "...", "amount": 0, "percentage": 0, "tips": "..." } ] }. Include 6-8 categories like Venue, Food & Beverages, Prizes, Marketing, Decorations, Technical Setup, Contingency, Hospitality. Make amounts realistic for Indian college events. Percentages must sum to 100. Return ONLY valid JSON.`;
  return await invokeGemini(system, "Generate budget breakdown", userKey);
};

export const generateMemeCaptions = async (brief, style, userKey) => {
  const system = `You are a viral meme creator for Indian college events. Given event brief and meme template ${style}, return ONLY this JSON: { "memes": [ { "topText": "...", "bottomText": "...", "context": "..." } ] } — generate 3 variations. Make them funny, relatable to Indian college students, and relevant to the event. Keep text short and punchy. Return ONLY valid JSON.`;
  return await invokeGemini(system, brief, userKey);
};

export const generateSponsorMatcher = async (brief, clubType, footfall, userKey) => {
  const system = `You are a college event sponsorship strategist in India. Given this event: ${brief}, club: ${clubType}, footfall: ${footfall}, return ONLY this JSON: { "sponsors": [ { "category": "...", "relevanceScore": 8, "whyFit": "...", "targetCompanies": ["...","...","..."], "emailSubject": "...", "emailBody": "..." } ] }. Return 6 sponsor categories. relevanceScore must reflect actual fit (1-10). targetCompanies should be real Indian companies/brands relevant to the category. Return ONLY JSON.`;
  return await invokeGemini(system, "Find sponsors", userKey);
};

export const generateQuizBuilder = async (topic, difficulty, numQuestions, userKey) => {
  const system = `You are a quiz master. Generate ${numQuestions} multiple choice questions about ${topic} at ${difficulty} level for Indian college students. Return ONLY this JSON: { "quiz": { "title": "...", "questions": [ { "q": "...", "options": ["A...","B...","C...","D..."], "answer": "A..." } ] } }. Note: answer MUST perfectly match one of the options text entirely. Return ONLY JSON.`;
  return await invokeGemini(system, "Generate quiz", userKey);
};

export const generateFeedbackForm = async (eventName, eventType, userKey) => {
  const system = `Generate a 6-question post-event feedback form for ${eventName} (${eventType}). Return ONLY this JSON: { "form": { "title": "...", "questions": [ { "id": "q1", "text": "...", "type": "rating|text|mcq", "options": ["..."] } ] } }. Include 2 rating questions (1-5 stars), 2 MCQ, 2 open text. Make questions specific to the event type. Return ONLY valid JSON.`;
  return await invokeGemini(system, "Generate feedback form", userKey);
};

export const generateMerchConcepts = async (clubName, tagline, vibe, userKey) => {
  const system = `You are a merch designer for Indian college clubs. Given club name ${clubName}, tagline ${tagline}, vibe ${vibe}, generate 5 merchandise design concepts. Return ONLY this JSON: { "concepts": [ { "item": "...", "designDescription": "...", "colorPalette": ["#...","#...","#..."], "slogan": "...", "canvaTemplateSearch": "...", "printfulCategory": "..." } ] }. Items must be varied: t-shirt, hoodie, tote bag, sticker pack, cap. colorPalette must be actual hex values matching the vibe. Return ONLY JSON.`;
  return await invokeGemini(system, "Generate merch", userKey);
};
