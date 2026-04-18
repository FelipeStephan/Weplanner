import { AVATAR_URLS } from "./avatars";
import { TEAM } from "./team";

export const MOCK_COMMENTS = [
  {
    id: "1",
    author: { name: "Carlos Lima", image: AVATAR_URLS[1] },
    text: "Finalizei a revisao dos tokens de cor. Todos os gradientes estao aplicados corretamente no Figma e no codigo. Podemos seguir com a documentacao.",
    timestamp: "Ontem as 14:32",
  },
  {
    id: "2",
    author: { name: "Mariana Costa", image: AVATAR_URLS[2] },
    text: "Otimo trabalho, Carlos! Vou revisar os componentes de botao e badge ainda hoje. Alguem pode validar os breakpoints responsivos?",
    timestamp: "Ontem as 15:10",
  },
  {
    id: "3",
    author: { name: "Ana Silva", image: AVATAR_URLS[0] },
    text: "Eu valido os breakpoints! Ja fiz os testes no mobile e tablet, tudo funcionando perfeitamente. So precisamos ajustar o padding do header no iPhone SE.",
    timestamp: "Hoje as 09:45",
  },
];

