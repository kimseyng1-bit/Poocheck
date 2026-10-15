// Symptom guide pages (/guide/[slug]). Plain data so pages can be statically
// generated. Every claim should be backed by one of the listed sources; the
// "appRule" line must match the verdict rules in src/lib/verdict.ts.

export interface GuideSource {
  title: string;
  url: string;
}

export interface GuideSection {
  heading: string;
  body?: string;
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string; // H1, written as the searcher would phrase it
  metaTitle: string;
  description: string;
  emoji: string;
  urgent: string[]; // "지금 바로 병원에 연락하세요"
  watch: string; // when watching at home is reasonable
  sections: GuideSection[];
  appRule: string; // how PooCheck classifies this in the app
  related: string[];
  sources: GuideSource[];
  updated: string; // YYYY-MM-DD
  reviewedBy?: string; // set only after an actual veterinarian review
}

const SRC = {
  akcBlood: { title: "AKC — Blood in Dog Poop", url: "https://www.akc.org/expert-advice/health/blood-in-dog-poop/" },
  akcPoop: { title: "AKC — How to Tell If Your Dog's Poop Is Healthy", url: "https://www.akc.org/expert-advice/health/dogs-poop-says-health/" },
  akcDiarrhea: { title: "AKC — Dog Diarrhea", url: "https://www.akc.org/expert-advice/health/dog-diarrhea/" },
  akcConstipation: { title: "AKC — Dog Constipation", url: "https://www.akc.org/expert-advice/health/dog-constipation/" },
  akcWorms: { title: "AKC — Worms in Dogs", url: "https://www.akc.org/expert-advice/health/worms-in-dogs/" },
  vcaDiarrhea: { title: "VCA Animal Hospitals — Diarrhea in Dogs", url: "https://vcahospitals.com/know-your-pet/diarrhea-in-dogs" },
  vcaConstipation: { title: "VCA Animal Hospitals — Constipation in Dogs", url: "https://vcahospitals.com/know-your-pet/constipation-in-dogs" },
  vcaColitis: { title: "VCA Animal Hospitals — Colitis in Dogs", url: "https://vcahospitals.com/know-your-pet/colitis-in-dogs" },
  vcaRoundworm: { title: "VCA Animal Hospitals — Roundworm Infection in Dogs", url: "https://vcahospitals.com/know-your-pet/roundworm-infection-in-dogs" },
  vcaTapeworm: { title: "VCA Animal Hospitals — Tapeworm Infection in Dogs", url: "https://vcahospitals.com/know-your-pet/tapeworm-infection-in-dogs" },
  vcaUrgent: { title: "VCA Urgent Care — Diarrhea or Vomiting", url: "https://vcahospitals.com/urgent-care/health-concerns/diarrhea-or-vomiting" },
  merckParasites: { title: "Merck Veterinary Manual — Gastrointestinal Parasites of Dogs", url: "https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/gastrointestinal-parasites-of-dogs" },
  tfdBlood: { title: "The Farmer's Dog — Blood in Your Dog's Stool", url: "https://www.thefarmersdog.com/digest/what-it-means-if-theres-blood-in-your-dogs-stool/" },
} satisfies Record<string, GuideSource>;

const UPDATED = "2026-10-15";

export const GUIDES: Guide[] = [
  {
    slug: "blood",
    title: "강아지 혈변, 언제 병원에 가야 할까?",
    metaTitle: "강아지 혈변 원인과 병원 가야 할 때",
    description:
      "강아지 변에 피가 보일 때 선홍색 피와 검은 변의 차이, 흔한 원인, 바로 병원에 가야 하는 증상을 정리했어요.",
    emoji: "🩸",
    urgent: [
      "피가 많이 나오거나 배변할 때마다 계속 보여요",
      "젤리 같은 피 섞인 설사를 하거나, 변 없이 피만 나와요",
      "구토를 하거나, 기운이 없거나, 밥과 물을 거부해요",
      "잇몸이 평소보다 창백해요",
      "예방접종을 마치지 않은 강아지예요 (파보바이러스 가능성 — 병원에 미리 전화하고 가세요)",
      "검고 끈적한 타르 같은 변을 봐요",
    ],
    watch:
      "정상 변 끝에 피가 한 번 살짝 묻었고 강아지가 평소처럼 잘 먹고 잘 논다면, 가벼운 대장 자극일 수도 있어요. 다음 배변을 꼭 확인하고, 다시 피가 보이면 진료를 받으세요.",
    sections: [
      {
        heading: "피 색깔로 출혈 위치를 짐작할 수 있어요",
        bullets: [
          "선홍색 피(혈변): 대장·직장·항문처럼 장의 아래쪽에서 난 출혈인 경우가 많아요. 정상 변에 붉은 줄처럼 묻어 나오기도 해요.",
          "검은 타르변(흑색변): 위나 소장처럼 장의 위쪽에서 난 출혈이 소화되면서 검게 변한 거예요. 겉보기에 덜 놀라워도 더 서둘러야 하는 경우가 많아요.",
        ],
      },
      {
        heading: "흔한 원인",
        bullets: [
          "쓰레기나 평소 먹지 않던 음식을 먹은 경우",
          "대장염 — 스트레스성 대장염이 흔하며, 배변 끝에 선홍색 피가 조금 묻어나기 쉬워요",
          "항문낭 문제",
          "기생충 감염 (구충 등)",
          "염증성 장질환, 췌장염, 혈액 응고 이상, 종양",
          "독성 물질 섭취",
          "파보바이러스, 급성 출혈성 설사 증후군 같은 바이러스·급성 질환",
        ],
      },
      {
        heading: "병원 가기 전에 확인해 두면 좋은 것",
        bullets: [
          "피의 양과 색, 몇 번이나 보였는지",
          "구토, 식욕, 기운, 물 마시는 양",
          "최근 먹은 것 (쓰레기, 뼈, 사람 음식, 약)",
          "예방접종 완료 여부",
          "변 사진 — 병원에서 보여주면 진료에 도움이 돼요",
        ],
      },
    ],
    appRule: "포푸체크는 사진에서 혈액이 보이면 '위험'으로 안내해요.",
    related: ["black-stool", "mucus", "diarrhea"],
    sources: [SRC.akcBlood, SRC.vcaColitis, SRC.vcaUrgent],
    updated: UPDATED,
  },
  {
    slug: "black-stool",
    title: "강아지 검은 변(검은똥), 왜 생길까?",
    metaTitle: "강아지 검은 변·검은 설사 원인과 대처",
    description:
      "강아지가 검은 변을 볼 때 사료 때문인지, 위장 출혈 신호인지 구별하는 방법과 바로 병원에 가야 하는 경우를 정리했어요.",
    emoji: "⚫",
    urgent: [
      "검고 끈적하며 타르처럼 번들거리는 변을 봐요",
      "진통소염제 등 약을 먹고 있는 중에 검은 변이 나왔어요",
      "구토를 하거나, 기운이 없거나, 밥을 안 먹어요",
      "잇몸이 창백해요",
    ],
    watch:
      "간이나 소고기처럼 색이 짙은 재료가 든 음식을 먹은 뒤 변이 단단하고 진한 갈색이라면 식단 영향일 수 있어요. 아래 '휴지 테스트'로 확인하고, 애매하면 진료를 받으세요.",
    sections: [
      {
        heading: "검은 변이 위험할 수 있는 이유",
        body:
          "검고 끈적한 타르 같은 변(흑색변)은 위나 소장처럼 장의 위쪽에서 출혈이 생겨, 피가 소화되면서 검게 변한 것일 수 있어요. 겉으로는 피처럼 보이지 않아 놓치기 쉬워요.",
      },
      {
        heading: "흑색변의 원인",
        bullets: [
          "위·장 궤양",
          "삼킨 이물질",
          "진통소염제(NSAID) 같은 약의 부작용 — 먹이던 약이 있다면 수의사에게 꼭 알려주세요",
          "신장·간 질환, 애디슨병 같은 전신 질환",
          "그 밖에 혈변을 일으키는 원인들 (기생충, 독성 물질, 응고 이상 등)",
        ],
      },
      {
        heading: "진한 갈색과 구별하는 '휴지 테스트'",
        body:
          "변을 키친타월이나 물티슈로 문질러 보세요. 묻어난 색이 검붉거나 검다면 흑색변일 수 있어요. 평소보다 변이 눈에 띄게 어둡거나 냄새가 달라졌다면 수의사와 상담하세요.",
      },
    ],
    appRule: "포푸체크는 검고 끈적한 타르변이 보이면 '위험'으로 안내해요.",
    related: ["blood", "stool-color", "diarrhea"],
    sources: [SRC.akcBlood, SRC.akcPoop],
    updated: UPDATED,
  },
  {
    slug: "diarrhea",
    title: "강아지 설사, 집에서 지켜봐도 될까?",
    metaTitle: "강아지 설사 원인과 병원 가야 할 때",
    description:
      "강아지 설사의 흔한 원인, 집에서 지켜봐도 되는 경우와 바로 병원에 가야 하는 증상, 집에서 할 수 있는 관리를 정리했어요.",
    emoji: "💧",
    urgent: [
      "피가 섞인 설사나 검은 설사를 해요",
      "구토, 열, 기운 없음, 배를 아파함, 식욕 저하가 함께 있어요",
      "물을 잘 못 마시거나 탈수가 걱정돼요",
      "어린 강아지이거나 예방접종을 마치지 않았어요 (파보바이러스 초기 증상일 수 있어요)",
      "묽은 변이 이틀 넘게 계속돼요",
      "독성 물질이나 이물질을 먹었을 가능성이 있어요",
    ],
    watch:
      "평소 건강한 성견이 무른 변을 한두 번 봤지만 잘 먹고 잘 논다면 지켜볼 수 있어요. 깨끗한 물을 항상 주고, 이틀 안에 나아지지 않으면 진료를 받으세요.",
    sections: [
      {
        heading: "흔한 원인",
        bullets: [
          "갑작스러운 사료 변경, 음식 불내성, 쓰레기나 상한 음식 섭취",
          "여행, 호텔, 이사 같은 환경 변화로 인한 스트레스",
          "기생충(구충, 회충, 편충), 세균, 바이러스, 콕시듐 감염",
          "독성 물질이나 독성 식물",
          "음식 알레르기, 염증성 장질환, 장기 질환, 파보바이러스 같은 더 심각한 문제",
        ],
      },
      {
        heading: "집에서 할 수 있는 관리",
        bullets: [
          "깨끗한 물을 항상 마실 수 있게 해주세요. 설사는 탈수가 빨리 올 수 있어요.",
          "식사는 수의사 안내에 따라 잠시 줄이거나, 소화가 잘 되는 담백한 음식을 조금씩 주세요.",
          "변이 정상으로 돌아오면 7~10일에 걸쳐 원래 사료로 천천히 바꾸세요.",
          "사람용 지사제나 약은 주지 마세요. 효과가 없거나 해로울 수 있어요. 유산균·보조제도 수의사와 먼저 상의하세요.",
        ],
      },
      {
        heading: "설사 색깔도 함께 보세요",
        body:
          "피가 보이면 혈변, 검으면 검은 변, 노랗거나 주황색이면 노란 변, 젤리 같은 점액이 많으면 점액변 가이드를 참고하세요.",
      },
    ],
    appRule:
      "포푸체크는 브리스톨 척도 6단계(죽 같은 변)를 '주의', 7단계(물설사)를 '위험'으로 안내해요.",
    related: ["blood", "yellow-stool", "mucus"],
    sources: [SRC.vcaDiarrhea, SRC.akcDiarrhea, SRC.vcaUrgent],
    updated: UPDATED,
  },
  {
    slug: "mucus",
    title: "강아지 점액변, 젤리 같은 변의 의미",
    metaTitle: "강아지 점액변 원인과 병원 가야 할 때",
    description:
      "강아지 변에 젤리 같은 점액이 묻어 나올 때 정상인 경우와 대장염 신호인 경우, 병원에 가야 하는 증상을 정리했어요.",
    emoji: "🫧",
    urgent: [
      "점액에 피가 섞여 나오고 양이 많거나 계속돼요",
      "구토, 기운 없음, 식욕 저하가 함께 있어요",
      "설사가 이틀 넘게 계속돼요",
    ],
    watch:
      "점액은 원래 장 안쪽을 매끄럽게 해주는 물질이라, 소량이 한 번 묻어나는 정도는 큰 문제가 아닐 수 있어요. 양이 많거나 계속 보이면 진료를 받으세요.",
    sections: [
      {
        heading: "점액이 많아지는 대표 원인: 대장염",
        body: "대장에 염증이 생기면 이런 모습이 자주 함께 나타나요.",
        bullets: [
          "조금씩 자주 보는 무른 변, 급하게 배변하려는 모습",
          "배변 중·후에 힘을 주는 모습",
          "배변 끝에 선홍색 피가 조금 묻어나요",
          "젤리 같은 점액 (오래가는 경우에 특히 흔해요)",
        ],
      },
      {
        heading: "대장염의 흔한 원인",
        bullets: [
          "스트레스 — 스트레스성 대장염은 대장성 설사의 대표 원인이에요",
          "음식 알레르기나 상한 음식",
          "기생충 (지아르디아, 크립토스포리디움, 편충)",
          "세균 감염 (살모넬라, 클로스트리디움, 대장균 등)",
        ],
      },
    ],
    appRule: "포푸체크는 점액이 보이면 '주의'로 안내해요. 피가 함께 보이면 '위험'이에요.",
    related: ["blood", "diarrhea", "stool-color"],
    sources: [SRC.vcaColitis, SRC.akcPoop, SRC.tfdBlood],
    updated: UPDATED,
  },
  {
    slug: "stool-color",
    title: "강아지 변 색깔로 보는 건강 신호",
    metaTitle: "강아지 변 색깔별 의미 총정리",
    description:
      "갈색, 검정, 빨강, 노랑, 초록, 회색, 흰 점까지 강아지 변 색깔별로 의심할 수 있는 원인과 병원에 가야 하는 경우를 정리했어요.",
    emoji: "🎨",
    urgent: [
      "검고 끈적한 타르 같은 변 (위장 위쪽 출혈 가능성)",
      "붉은 피가 많이 보이거나 계속 보여요",
      "회색·흰색에 가까운 창백한 변",
      "색 변화와 함께 구토, 기운 없음, 식욕 저하가 있어요",
    ],
    watch:
      "풀을 먹은 뒤 잠깐 초록빛이 돌거나, 짙은 재료가 든 음식을 먹은 뒤 색이 진해지는 건 일시적일 수 있어요. 같은 색이 계속되면 진료를 받으세요.",
    sections: [
      {
        heading: "색깔별 의미",
        bullets: [
          "갈색: 이상적인 색이에요. 단단하지만 살짝 말랑한 한 덩어리가 가장 건강한 모습이에요.",
          "검정(타르 같음): 위·소장 등 장 위쪽 출혈 가능성이 있어요.",
          "빨강(피): 대장·직장·항문 등 장 아래쪽 출혈일 수 있어요.",
          "노랑·주황: 간이나 담도 문제의 신호일 수 있어요.",
          "초록: 풀을 먹었거나 담낭 문제일 수 있어요.",
          "회색·기름짐: 췌장이나 담도 문제일 수 있어요.",
          "흰 점·쌀알 같은 것: 촌충 마디일 수 있어요.",
        ],
      },
      {
        heading: "색깔 말고도 볼 것",
        bullets: [
          "굳기: 물 같은 변은 장 문제, 작고 딱딱한 알갱이는 탈수 신호일 수 있어요.",
          "양: 먹은 양에 비해 적당해야 해요.",
          "겉면: 점액으로 덮여 있으면 대장 염증일 수 있어요.",
          "식단을 바꾸지 않았는데 배변 습관이 달라졌다면 수의사와 상담하세요.",
        ],
      },
    ],
    appRule:
      "포푸체크는 검은 타르변·혈액·회백색 변은 '위험', 노랑·주황·초록 같은 비정상 색은 '주의'로 안내해요.",
    related: ["black-stool", "blood", "yellow-stool", "worms"],
    sources: [SRC.akcPoop, SRC.akcBlood],
    updated: UPDATED,
  },
  {
    slug: "yellow-stool",
    title: "강아지 노란 변(노란똥)·노란 설사, 괜찮을까?",
    metaTitle: "강아지 노란 변·노란 설사 원인과 대처",
    description:
      "강아지가 노란 변이나 노란 설사를 볼 때 흔한 원인과 간·담도 문제를 의심해야 하는 경우, 병원에 가야 하는 증상을 정리했어요.",
    emoji: "🟡",
    urgent: [
      "눈 흰자, 잇몸, 피부가 노랗게 보여요",
      "구토, 기운 없음, 식욕 저하가 함께 있어요",
      "피나 점액이 섞여 나와요",
      "노란 변이나 설사가 이틀 넘게 계속돼요",
    ],
    watch:
      "사료를 바꾼 직후나 여행·호텔 같은 스트레스 뒤에 하루 이틀 노랗고 무른 변을 보지만 잘 먹고 잘 논다면 물을 충분히 주며 지켜볼 수 있어요.",
    sections: [
      {
        heading: "노란 변의 흔한 원인",
        bullets: [
          "설사와 함께 나타나는 경우: 갑작스러운 사료 변경, 음식 불내성, 스트레스 등 설사의 흔한 원인",
          "노랑·주황색이 계속되는 경우: 간이나 담도 문제의 신호일 수 있어 진료가 필요해요",
        ],
      },
      {
        heading: "헷갈리기 쉬운 것",
        bullets: [
          "노란 점액이 많이 묻어 있다면 점액변 가이드를 참고하세요.",
          "'노란 토(구토)'는 변과 다른 문제예요. 구토가 반복되면 바로 수의사와 상담하세요.",
        ],
      },
    ],
    appRule: "포푸체크는 노랑·주황 같은 비정상 색이 보이면 '주의'로 안내해요.",
    related: ["diarrhea", "stool-color", "mucus"],
    sources: [SRC.akcPoop, SRC.vcaDiarrhea],
    updated: UPDATED,
  },
  {
    slug: "constipation",
    title: "강아지 변비, 증상과 병원에 가야 할 때",
    metaTitle: "강아지 변비 증상·원인과 병원 가야 할 때",
    description:
      "강아지 변비 증상과 흔한 원인, 집에서 주의할 점, 48~72시간 이상 변을 못 볼 때처럼 병원에 가야 하는 경우를 정리했어요.",
    emoji: "🧱",
    urgent: [
      "마지막 배변 후 48~72시간이 지나도록 변을 못 봐요",
      "계속 힘만 주고 나오지 않아요",
      "구토를 하거나, 배를 만지면 아파하거나, 식욕이 없어요",
      "뼈나 이물질을 삼켰을 가능성이 있어요",
      "변을 보려는 건지 소변을 보려는 건지 헷갈려요 — 소변이 막힌 경우는 응급일 수 있어요",
    ],
    watch:
      "하루 정도 변을 안 봤지만 잘 먹고 기운이 있다면, 물을 충분히 마시게 하고 산책을 늘리며 지켜볼 수 있어요.",
    sections: [
      {
        heading: "변비 증상",
        bullets: [
          "변을 보려고 여러 번 자세를 잡지만 나오지 않아요 (빙빙 돌기, 엉덩이 끌기, 심하면 울기)",
          "작고 딱딱하고 마른 변",
          "정상 변 없이 묽은 변이나 점액만 조금 나와요 — 딱딱한 변 주위로 액체가 새어 나오는 것일 수 있어요",
          "식욕 저하, 구토, 배가 단단하고 만지면 아파함",
        ],
      },
      {
        heading: "흔한 원인",
        bullets: [
          "뼈, 식물 등 소화되지 않는 것을 먹은 경우",
          "털 (털이 길거나 핥는 습관이 많은 경우)",
          "갑작스러운 식단 변화",
          "운동 부족, 탈수",
          "일부 약물 (항히스타민제, 이뇨제, 마약성 진통제 등)",
          "관절염처럼 배변 자세를 아프게 만드는 통증",
          "전립선 질환, 골반 부상, 신경 질환, 대장의 종양이나 이물",
        ],
      },
      {
        heading: "집에서 주의할 점",
        bullets: [
          "물을 충분히 마시게 하고 뼈는 주지 마세요.",
          "사람용 변비약이나 관장은 하지 마세요. 장이 막혀 있는 경우 위험할 수 있어 수의사가 원인을 확인한 뒤 처방해요.",
          "식이섬유 조절이나 유산균도 원인에 따라 달라지니 수의사와 상의하세요.",
        ],
      },
    ],
    appRule: "포푸체크는 브리스톨 척도 1단계(따로 떨어진 딱딱한 덩어리)를 '주의'로 안내해요.",
    related: ["stool-color", "blood", "diarrhea"],
    sources: [SRC.vcaConstipation, SRC.akcConstipation, SRC.akcPoop],
    updated: UPDATED,
  },
  {
    slug: "worms",
    title: "강아지 변에 기생충이 보일 때 (촌충·회충)",
    metaTitle: "강아지 기생충 똥 — 촌충·회충 구별과 대처",
    description:
      "강아지 변에 쌀알이나 벌레 같은 것이 보일 때 촌충과 회충을 구별하는 방법, 사람 감염 주의점, 치료와 예방을 정리했어요.",
    emoji: "🪱",
    urgent: [
      "기생충이 보이고 설사, 피, 구토, 기운 없음이 함께 있어요",
      "어린 강아지가 배가 볼록하고 잘 자라지 않아요",
      "잇몸이 창백하거나 매우 기운이 없어요",
    ],
    watch:
      "기운 있는 성견의 변이나 항문 주변에서 쌀알 같은 마디를 봤다면 응급은 아니지만, 며칠 안에 진료를 받아 구충하고 벼룩 관리도 함께 하세요.",
    sections: [
      {
        heading: "눈으로 보이는 기생충",
        bullets: [
          "촌충: 쌀알이나 오이씨 같은 마디(약 1.2cm)가 신선한 변 위나 항문 주변 털에 붙어 있고, 꿈틀거리기도 해요. 마르면 황금색으로 변해요.",
          "회충: 둥글고 긴 벌레가 변이나 드물게 구토물에서 보여요. 특히 어린 강아지에게 흔해요.",
          "구충, 편충, 지아르디아 등은 눈으로 보기 어려워 동물병원의 변 검사가 필요해요.",
        ],
      },
      {
        heading: "어떻게 감염될까",
        bullets: [
          "촌충: 털을 핥다가 벼룩을 삼켜서 감염돼요. 촌충 알을 직접 먹어서는 감염되지 않아요.",
          "회충: 오염된 흙이나 변을 통해, 또는 어미에게서 태반·젖으로 옮아요.",
        ],
      },
      {
        heading: "사람도 조심하세요",
        bullets: [
          "회충은 사람, 특히 아이에게 옮을 수 있어요.",
          "구충 유충은 사람 피부를 뚫고 들어올 수 있어요.",
          "변은 바로 치우고, 치울 때는 장갑을 끼고 손을 깨끗이 씻으세요.",
        ],
      },
      {
        heading: "치료와 예방",
        bullets: [
          "구충제는 기생충 종류에 맞게 수의사가 처방해요.",
          "촌충은 일반 변 검사로 잘 안 잡혀요. 본 마디를 봉투에 담아 가져가면 도움이 돼요.",
          "촌충은 벼룩 관리가 핵심이에요. 벼룩이 남아 있으면 2주 안에 다시 감염될 수 있어요.",
          "정기적인 변 검사와 구충 일정은 수의사와 상의하세요.",
        ],
      },
    ],
    appRule: "포푸체크는 사진에서 기생충으로 보이는 것이 있으면 '위험'으로 안내해요.",
    related: ["stool-color", "diarrhea", "blood"],
    sources: [SRC.vcaTapeworm, SRC.vcaRoundworm, SRC.akcWorms, SRC.merckParasites],
    updated: UPDATED,
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
