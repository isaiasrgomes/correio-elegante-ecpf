export const CLASSES = [
  "1°A",
  "1°B",
  "1°C",
  "1°D",
  "2°A",
  "2°B",
  "2°C",
  "2°D",
  "3°A",
  "3°B",
  "3°C",
  "3°D",
  "Servidor",
] as const;

export const SENDER_NON_STUDENT_LABEL = "Não é aluno" as const;

export type ClassOption = (typeof CLASSES)[number];

export type LetterFeature = "message" | "spotify" | "polaroid";

export const LETTER_TYPES = [
  {
    id: "simples",
    name: "Carta Simples",
    price: 1.0,
    description: "Uma mensagem sincera para quem você ama.",
    image: "/illustrations/carta-simples.svg",
    features: ["message"] as LetterFeature[],
  },
  {
    id: "pirulito",
    name: "Carta + Pirulito",
    price: 2.0,
    description: "Doçura na mensagem e no presente.",
    image: "/illustrations/carta-pirulito.svg",
    features: ["message"] as LetterFeature[],
  },
  {
    id: "spotify",
    name: "Carta + Spotify",
    price: 2.5,
    description: "A trilha sonora do seu amor.",
    image: "/illustrations/carta-spotify.svg",
    features: ["message", "spotify"] as LetterFeature[],
  },
  {
    id: "bombom",
    name: "Carta + Bombom",
    price: 3.0,
    description: "Chocolate e carinho na mesma entrega.",
    image: "/illustrations/carta-bombom.svg",
    features: ["message"] as LetterFeature[],
  },
  {
    id: "polaroid",
    name: "Carta + Polaroid",
    price: 3.5,
    description: "Um momento eternizado em foto.",
    image: "/illustrations/carta-polaroid.svg",
    features: ["message", "polaroid"] as LetterFeature[],
  },
  {
    id: "flor",
    name: "Carta + Flor",
    price: 6.0,
    description: "Flores e palavras para emocionar.",
    image: "/illustrations/carta-flor.svg",
    features: ["message"] as LetterFeature[],
  },
] as const;

export type LetterTypeId = (typeof LETTER_TYPES)[number]["id"];

export const EXTRAS = [
  { id: "pirulito", name: "Pirulito", price: 1.5 },
  { id: "bombom", name: "Bombom", price: 2.0 },
] as const;

export const MAX_MESSAGE_LENGTH = 500;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  AWAITING_PRODUCTION: "Aguardando produção",
  COMPLETED: "Finalizado",
};

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Escolha sua carta",
    text: "Selecione o tipo de presente, informe quem vai receber e escreva sua mensagem personalizada.",
    image: "/illustrations/step-choose.svg",
  },
  {
    step: 2,
    title: "Personalize os detalhes",
    text: "Adicione foto polaroid ou uma música do Spotify dependendo do tipo de carta escolhido.",
    image: "/illustrations/step-personalize.svg",
  },
  {
    step: 3,
    title: "Realize o pagamento",
    text: "Pague via Pix utilizando QR Code e confirme seu pedido de forma rápida.",
    image: "/illustrations/step-payment.svg",
  },
  {
    step: 4,
    title: "Emocione alguém especial",
    text: "A carta será preparada e entregue para tornar o momento inesquecível.",
    image: "/illustrations/step-deliver.svg",
  },
] as const;
