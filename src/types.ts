export interface BeforeAfterPair {
  id: number;
  before_url: string;
  after_url: string;
}

export interface User {
  id: number;
  telegram_id: string;
  username: string | null;
  tries_left: number;
  is_admin: number;
  has_paid: number;
  created_at: string;
}

export interface AdminSettings {
  video_try_cost: number;
  emotion_cost: number;
  viral_cost: number;
  other_beard_cost: number;
  free_tries_on_signup: number;
  logo_url?: string;
}

export type Category = 'mustache' | 'beard' | 'premium';

export interface Style {
  id: string;
  name: string;
  prompt: string;
  previewPrompt: string;
  cost: number;
  category: Category;
  imageUrl?: string;
}

export const MUSTACHES: Style[] = [
  { 
    id: 'm1', 
    name: 'Классические', 
    prompt: 'Add ultra realistic classic mustache to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: ultra realistic facial hair, photorealistic, seamless integration into skin, natural hair strands visible, correct face anatomy alignment, natural lighting matching original image, sharp focus, no artifacts. MODEL SPECIFIC REQUIREMENTS: medium thickness mustache directly above upper lip, follows natural lip curvature, extends slightly beyond mouth corners by 5–10 mm, clean trimmed edges, medium density, masculine classic timeless style, symmetrical shape.',
    previewPrompt: 'Preview icon of classic mustache, medium thickness, clean trimmed edges, centered lower face crop, studio lighting, dark gradient background, ultra realistic texture, premium mobile app icon style.',
    cost: 0, 
    category: 'mustache' 
  },
  { 
    id: 'm2', 
    name: 'Handlebar', 
    prompt: 'Add ultra realistic handlebar mustache to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: ultra realistic facial hair, seamless blending, natural lighting, perfect anatomical alignment, sharp focus. MODEL SPECIFIC REQUIREMENTS: thick mustache extending horizontally beyond mouth corners by 15–25 mm, curled upward ends, waxed styling, high density, elegant vintage masculine style, perfectly symmetrical curls.',
    previewPrompt: 'Preview icon of handlebar mustache with curled ends, elegant vintage style, centered composition, studio lighting, ultra realistic texture, premium icon style.',
    cost: 0, 
    category: 'mustache' 
  },
  { 
    id: 'm3', 
    name: 'Тонкие', 
    prompt: 'Add ultra realistic thin mustache to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: photorealistic facial hair, seamless integration, natural lighting, ultra detailed texture. MODEL SPECIFIC REQUIREMENTS: very thin mustache above upper lip, low density, subtle and minimal style, clean edges, modern minimalist masculine aesthetic.',
    previewPrompt: 'Preview icon of thin subtle mustache, minimalist style, centered face crop, studio lighting, premium mobile icon.',
    cost: 0, 
    category: 'mustache' 
  },
  { 
    id: 'm4', 
    name: 'Щетина над губой', 
    prompt: 'Add ultra realistic short stubble mustache to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: photorealistic facial hair, seamless integration, correct face alignment, sharp focus. MODEL SPECIFIC REQUIREMENTS: short stubble mustache length 1–3 mm, low density, natural masculine stubble look, slightly rough texture, modern casual style.',
    previewPrompt: 'Preview icon of short stubble mustache, realistic stubble texture, studio lighting, centered crop, premium app icon style.',
    cost: 0, 
    category: 'mustache' 
  },
  { 
    id: 'm5', 
    name: 'Императорские', 
    prompt: 'Add ultra realistic imperial mustache to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: ultra realistic texture, seamless blending, natural lighting. MODEL SPECIFIC REQUIREMENTS: thick luxurious mustache extending wide horizontally 20–30 mm beyond mouth corners, slightly curved upward ends, very high density, powerful imperial masculine appearance.',
    previewPrompt: 'Preview icon of thick imperial mustache, wide and luxurious, centered composition, dramatic studio lighting, premium icon.',
    cost: 0, 
    category: 'mustache' 
  },
  { 
    id: 'm6', 
    name: 'Chevron', 
    prompt: 'Add ultra realistic chevron mustache to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: photorealistic hair, seamless integration, natural lighting. MODEL SPECIFIC REQUIREMENTS: thick full mustache covering entire upper lip area, straight bottom edge, high density, bold masculine style, classic chevron shape.',
    previewPrompt: 'Preview icon of thick chevron mustache, bold masculine style, centered crop, studio lighting, ultra realistic hair texture.',
    cost: 0, 
    category: 'mustache' 
  },
];

export const BEARDS: Style[] = [
  { 
    id: 'b1', 
    name: 'Щетина', 
    prompt: 'Add ultra realistic short beard stubble to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: photorealistic facial hair, seamless blending, natural lighting, ultra detailed. MODEL SPECIFIC REQUIREMENTS: short beard stubble length 1–3 mm, covering chin and jawline, light density, modern masculine stubble style.',
    previewPrompt: 'Preview icon of beard stubble, subtle masculine look, centered face crop, studio lighting, premium icon.',
    cost: 0, 
    category: 'beard' 
  },
  { 
    id: 'b2', 
    name: 'Короткая борода', 
    prompt: 'Add ultra realistic short full beard to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: ultra realistic hair, seamless integration, natural lighting. MODEL SPECIFIC REQUIREMENTS: short beard length 5–10 mm, covering chin, jawline and cheeks, medium density, clean edges, professional masculine look.',
    previewPrompt: 'Preview icon of short full beard, clean edges, premium app icon style.',
    cost: 0, 
    category: 'beard' 
  },
  { 
    id: 'b3', 
    name: 'Полная борода', 
    prompt: 'Add ultra realistic full beard to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: photorealistic hair, perfect anatomy alignment, natural lighting. MODEL SPECIFIC REQUIREMENTS: full beard length 15–25 mm, thick density, covering chin, cheeks, jawline and under jaw, strong masculine appearance.',
    previewPrompt: 'Preview icon of full beard, thick masculine style, centered crop, premium icon.',
    cost: 0, 
    category: 'beard' 
  },
  { 
    id: 'b4', 
    name: 'Викинг', 
    prompt: 'Add ultra realistic long viking beard to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: ultra realistic hair strands, seamless integration. MODEL SPECIFIC REQUIREMENTS: long beard length 30–60 mm, thick density, natural slightly uneven texture, powerful viking masculine style.',
    previewPrompt: 'Preview icon of long viking beard, dramatic masculine appearance, premium icon.',
    cost: 0, 
    category: 'beard' 
  },
  { 
    id: 'b5', 
    name: 'Эспаньолка', 
    prompt: 'Add ultra realistic goatee beard to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: photorealistic texture, natural lighting. MODEL SPECIFIC REQUIREMENTS: beard only on chin, length 10–15 mm, clean shaved cheeks, connected or separate mustache optional, modern stylish goatee.',
    previewPrompt: 'Preview icon of goatee beard, clean cheeks, centered composition, premium app icon.',
    cost: 0, 
    category: 'beard' 
  },
  { 
    id: 'b6', 
    name: 'Голливудская', 
    prompt: 'Add ultra realistic hollywood beard to the person in the uploaded photo. GENERAL STYLE REQUIREMENTS: photorealistic hair, seamless blending, natural lighting. MODEL SPECIFIC REQUIREMENTS: beard covering chin and jawline but clean upper cheeks, medium density, length 10–18 mm, stylish celebrity masculine appearance.',
    previewPrompt: 'Preview icon of hollywood beard, clean cheek lines, premium mobile app icon style.',
    cost: 0, 
    category: 'beard' 
  },
];

export interface Emotion {
  id: string;
  name: string;
  previewPrompt: string;
  imageUrl?: string;
}

export const EMOTIONS: Emotion[] = [
  { id: 'e1', name: 'Улыбка', previewPrompt: 'Preview icon of a smiling face, clean and minimal style, premium app icon.' },
  { id: 'e3', name: 'Подмигивание', previewPrompt: 'Preview icon of a winking face, clean and minimal style, premium app icon.' },
  { id: 'e4', name: 'Злость', previewPrompt: 'Preview icon of an angry face, clean and minimal style, premium app icon.' },
  { id: 'e5', name: 'Удивление', previewPrompt: 'Preview icon of a surprised face, clean and minimal style, premium app icon.' },
  { id: 'e6', name: 'Поцелуй', previewPrompt: 'Preview icon of a face blowing a kiss, clean and minimal style, premium app icon.' },
  { id: 'e9', name: 'Крутой взгляд', previewPrompt: 'Preview icon of a cool face with sunglasses, clean and minimal style, premium app icon.' },
];

export const VIRAL_EFFECTS: Style[] = [
  { id: 'v1', name: '1920-е', prompt: 'Transform the image to look like a grainy 1920s vintage photo with a retro beard', previewPrompt: 'Vintage 1920s photo style icon with a retro beard, grainy texture, sepia tones, premium icon.', cost: 1, category: 'premium' },
  { id: 'v2', name: 'Викинг', prompt: 'Add a massive Viking beard and a cinematic Viking helmet to the person', previewPrompt: 'Cinematic Viking helmet and massive beard icon, dramatic lighting, premium mobile icon.', cost: 1, category: 'premium' },
  { id: 'v3', name: 'Random', prompt: 'Add a random, unique and funny beard style to the face', previewPrompt: 'Funny random beard style icon, creative and unique, premium app icon.', cost: 1, category: 'premium' },
  { id: 'v4', name: 'Старение', prompt: 'Make the person look 70 years old with a long grey beard', previewPrompt: 'Old man with long grey beard icon, realistic aging, premium icon.', cost: 1, category: 'premium' },
  { id: 'v5', name: 'Celebrity', prompt: 'Add a stylish, billionaire-style groomed beard to the face', previewPrompt: 'Stylish billionaire groomed beard icon, luxury celebrity style, premium icon.', cost: 1, category: 'premium' },
  { id: 'v6', name: 'AI Roast', prompt: 'Add a beard and make the person look like a tough boss with a funny expression', previewPrompt: 'Tough boss with beard and funny expression icon, humorous style, premium icon.', cost: 1, category: 'premium' },
  { id: 'v7', name: 'Киберпанк', prompt: 'Transform the person in the image into a cyberpunk character with a futuristic neon beard. Add neon lights, futuristic cybernetic implants on the face, and a dystopian city background. Keep the original facial features recognizable.', previewPrompt: 'Preview icon of a cyberpunk face with neon lights and cybernetic implants, clean and minimal style, premium app icon.', cost: 1, category: 'premium' },
  { id: 'v8', name: 'Вампир', prompt: 'Transform the person in the image into a vampire with an elegant gothic beard. Add pale skin, red glowing eyes, subtle fangs, and a dark gothic atmosphere. Keep the original facial features recognizable.', previewPrompt: 'Preview icon of a vampire face with pale skin and red eyes, clean and minimal style, premium app icon.', cost: 1, category: 'premium' },
  { id: 'v9', name: 'Аниме', prompt: 'Transform the person in the image into an anime character with a stylized anime beard. Use a vibrant anime art style, large expressive eyes, stylized hair, and cel-shaded coloring. Keep the original facial features recognizable.', previewPrompt: 'Preview icon of an anime style face, clean and minimal style, premium app icon.', cost: 1, category: 'premium' },
];
