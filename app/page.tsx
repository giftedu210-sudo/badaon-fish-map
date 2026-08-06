"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Fish = { name: string; depth: string; temp: string; note: string; icon: string };
type Zone = { id: string; name: string; short: string; lat: number; lng: number; zoom: number; color: string; note: string; quality: string; qualityNote: string; depth: string; temps: Record<string, number>; fish: Fish[] };

const seasons = ["봄", "여름", "가을", "겨울"] as const;
const dateToSeason = (value: string): (typeof seasons)[number] => {
  const month = Number(value.slice(5, 7));
  if (month >= 3 && month <= 5) return "봄";
  if (month >= 6 && month <= 8) return "여름";
  if (month >= 9 && month <= 11) return "가을";
  return "겨울";
};

const zones: Zone[] = [
  { id: "west", name: "서해 중부", short: "인천 · 태안", lat: 36.25, lng: 125.35, zoom: 8, color: "#3e9bd7", note: "조석과 연안 혼합이 강한 얕은 바다", quality: "보통", qualityNote: "조석·하구 영향", depth: "20–50 m", temps: { 봄: 10.8, 여름: 23.2, 가을: 18.4, 겨울: 4.8 }, fish: [
    { name: "꽃게", depth: "5–30 m", temp: "15–25°C", note: "모래·펄 바닥", icon: "🦀" }, { name: "주꾸미", depth: "5–30 m", temp: "10–24°C", note: "봄 산란기 관찰", icon: "🐙" }, { name: "넙치", depth: "10–80 m", temp: "10–25°C", note: "연안 저층", icon: "🐟" }, { name: "참조기", depth: "20–80 m", temp: "14–24°C", note: "회유성 어종", icon: "🐠" }, { name: "농어", depth: "1–30 m", temp: "12–24°C", note: "하구·연안", icon: "🐟" }, { name: "갑오징어", depth: "10–60 m", temp: "12–22°C", note: "모래 바닥", icon: "🦑" }, { name: "숭어", depth: "0–20 m", temp: "8–25°C", note: "기수역 포함", icon: "🐟" }
  ] },
  { id: "east", name: "동해 중부", short: "강릉 · 울진", lat: 37.05, lng: 129.75, zoom: 8, color: "#2469b8", note: "수심이 급격히 깊어지는 맑은 연안", quality: "매우 좋음", qualityNote: "외해수 유입", depth: "50–200 m", temps: { 봄: 11.2, 여름: 20.4, 가을: 18.1, 겨울: 8.1 }, fish: [
    { name: "도루묵", depth: "10–150 m", temp: "5–16°C", note: "찬물성 저층", icon: "🐟" }, { name: "대구", depth: "50–300 m", temp: "3–15°C", note: "냉수성 어종", icon: "🐠" }, { name: "오징어", depth: "20–200 m", temp: "8–22°C", note: "야간 상층 회유", icon: "🦑" }, { name: "꽁치", depth: "0–100 m", temp: "8–18°C", note: "표층 회유", icon: "🐟" }, { name: "임연수어", depth: "20–150 m", temp: "6–18°C", note: "동해 연안", icon: "🐠" }, { name: "가자미", depth: "20–200 m", temp: "4–18°C", note: "모래·펄 저층", icon: "🐟" }, { name: "방어", depth: "0–200 m", temp: "15–24°C", note: "난류성 회유", icon: "🐠" }
  ] },
  { id: "southwest", name: "남해서부", short: "목포 · 여수", lat: 34.35, lng: 126.6, zoom: 8, color: "#e5a530", note: "다도해와 만이 이어지는 복잡한 연안", quality: "좋음", qualityNote: "만·섬 연안 혼합", depth: "15–80 m", temps: { 봄: 13.7, 여름: 24.6, 가을: 20.9, 겨울: 7.5 }, fish: [
    { name: "조기", depth: "20–80 m", temp: "14–24°C", note: "연안 회유", icon: "🐠" }, { name: "감성돔", depth: "1–50 m", temp: "12–24°C", note: "암초·방파제", icon: "🐟" }, { name: "갑오징어", depth: "10–60 m", temp: "12–22°C", note: "봄·가을 활발", icon: "🦑" }, { name: "바지락", depth: "0–10 m", temp: "8–25°C", note: "갯벌 저서", icon: "🐚" }, { name: "낙지", depth: "0–30 m", temp: "10–25°C", note: "펄 바닥", icon: "🐙" }, { name: "민어", depth: "20–80 m", temp: "18–27°C", note: "여름 회유", icon: "🐟" }, { name: "전어", depth: "0–30 m", temp: "15–25°C", note: "가을 연안", icon: "🐠" }
  ] },
  { id: "southeast", name: "남해 동부", short: "통영 · 부산", lat: 34.75, lng: 128.75, zoom: 8, color: "#ef744f", note: "난류 영향과 섬 연안이 만나는 수역", quality: "좋음", qualityNote: "난류·연안 혼합", depth: "30–120 m", temps: { 봄: 14.9, 여름: 24.8, 가을: 21.8, 겨울: 10.8 }, fish: [
    { name: "참돔", depth: "10–100 m", temp: "14–24°C", note: "암초·사질 바닥", icon: "🐠" }, { name: "갈치", depth: "50–300 m", temp: "15–25°C", note: "야간 상층 이동", icon: "🐟" }, { name: "방어", depth: "0–200 m", temp: "15–24°C", note: "겨울 회유", icon: "🐠" }, { name: "고등어", depth: "0–100 m", temp: "15–25°C", note: "표층 군집", icon: "🐟" }, { name: "쥐치", depth: "5–50 m", temp: "15–25°C", note: "연안 암초", icon: "🐠" }, { name: "볼락", depth: "5–80 m", temp: "10–22°C", note: "암초 주변", icon: "🐟" }, { name: "전갱이", depth: "0–100 m", temp: "15–25°C", note: "난류성 회유", icon: "🐠" }
  ] },
  { id: "jeju", name: "제주 해역", short: "제주 · 서귀포", lat: 33.25, lng: 126.65, zoom: 8, color: "#d84c77", note: "대마난류의 영향이 강한 남쪽 바다", quality: "매우 좋음", qualityNote: "외해 난류 수역", depth: "50–300 m", temps: { 봄: 16.6, 여름: 26.1, 가을: 23.4, 겨울: 14.2 }, fish: [
    { name: "자리돔", depth: "1–30 m", temp: "18–27°C", note: "연안 암초", icon: "🐟" }, { name: "부시리", depth: "0–200 m", temp: "17–26°C", note: "표·중층 회유", icon: "🐠" }, { name: "옥돔", depth: "40–180 m", temp: "16–25°C", note: "사질 저층", icon: "🐟" }, { name: "다금바리", depth: "10–100 m", temp: "18–27°C", note: "암초성 어종", icon: "🐠" }, { name: "쏨뱅이", depth: "5–80 m", temp: "14–25°C", note: "암초·해초", icon: "🐟" }, { name: "갈치", depth: "50–300 m", temp: "15–25°C", note: "난류 수역", icon: "🐟" }, { name: "고등어", depth: "0–100 m", temp: "15–25°C", note: "표층 군집", icon: "🐠" }
  ] },
];

const fishGuides: Record<string, { appearance: string; nutrition: string; season: string; tip: string }> = {
  "꽃게": { appearance: "푸른빛 등딱지와 옆으로 넓게 뻗은 다리가 특징입니다.", nutrition: "살에는 단백질과 타우린이 풍부한 편입니다.", season: "봄철 알배기 개체가 특히 알려져 있습니다.", tip: "등딱지가 단단하고 다리가 탄탄한 개체를 살펴보세요." },
  "주꾸미": { appearance: "작은 몸통과 여덟 개의 짧은 다리, 둥근 흡반이 특징입니다.", nutrition: "저지방 단백질과 타우린을 포함합니다.", season: "봄철 산란기 전후에 관찰·이용이 많습니다.", tip: "살이 쉽게 질겨지므로 짧게 조리하는 편이 좋습니다." },
  "넙치": { appearance: "두 눈이 한쪽으로 모인 납작한 타원형 몸입니다.", nutrition: "흰 살 생선으로 단백질이 주된 영양 성분입니다.", season: "연중 보이지만 수온이 안정된 시기 활동이 활발합니다.", tip: "모래 바닥 가까이에 숨어 지내는 습성이 있습니다." },
  "참조기": { appearance: "황금빛 옆줄과 날렵한 타원형 몸이 눈에 띕니다.", nutrition: "단백질과 비타민 B군을 섭취할 수 있습니다.", season: "봄·가을 회유기에 분포 변화가 큽니다.", tip: "조석과 수온 변화에 따라 어장이 이동합니다." },
  "숭어": { appearance: "은색 몸통과 비교적 굵은 비늘, 갈라진 꼬리가 특징입니다.", nutrition: "단백질과 불포화지방산을 포함합니다.", season: "봄철 연안·하구 부근에서 자주 관찰됩니다.", tip: "기수역에도 적응해 하구 주변에 나타날 수 있습니다." },
  "갑오징어": { appearance: "넓고 납작한 몸통 안에 단단한 뼈판이 있습니다.", nutrition: "단백질과 타우린을 포함하는 해산물입니다.", season: "봄 산란기에 연안 출현이 늘어납니다.", tip: "모래 바닥에 몸을 숨기는 위장 능력이 뛰어납니다." },
  "농어": { appearance: "은회색의 길쭉한 몸과 큰 입이 특징인 포식성 어종입니다.", nutrition: "담백한 흰 살에 단백질이 풍부합니다.", season: "수온이 오르는 봄부터 가을까지 연안에 자주 보입니다.", tip: "하구와 연안 구조물 주변을 선호합니다." },
  "도루묵": { appearance: "작고 길쭉한 은색 몸과 투명한 알이 특징입니다.", nutrition: "단백질과 칼슘을 포함한 생선입니다.", season: "늦가을~겨울 산란기에 동해 연안으로 접근합니다.", tip: "차가운 바다를 선호하는 대표 어종입니다." },
  "대구": { appearance: "큰 머리와 넓은 입, 옅은 반점이 있는 긴 몸을 가집니다.", nutrition: "지방이 적고 단백질이 많은 흰 살 생선입니다.", season: "겨울철 냉수기에 동해·남해에서 주목됩니다.", tip: "비교적 깊고 차가운 수역을 선호합니다." },
  "오징어": { appearance: "원뿔형 몸통과 긴 촉수, 큰 눈이 특징입니다.", nutrition: "단백질과 타우린이 대표 영양 성분입니다.", season: "계절 회유로 분포가 크게 달라집니다.", tip: "밤에는 표층으로 올라오는 경향이 있습니다." },
  "가자미": { appearance: "납작한 몸에 두 눈이 한쪽으로 몰린 저서성 어종입니다.", nutrition: "담백한 단백질과 무기질을 얻을 수 있습니다.", season: "차가운 계절에 동해 연안 관찰이 늘어납니다.", tip: "모래·진흙 바닥과 색을 맞춰 위장합니다." },
  "방어": { appearance: "유선형 은빛 몸과 노란빛 옆줄이 특징입니다.", nutrition: "지방이 많은 시기에는 오메가-3 지방산을 포함합니다.", season: "가을~겨울에 남하 회유로 존재감이 커집니다.", tip: "난류를 따라 빠르게 이동하는 회유성 어종입니다." },
  "감성돔": { appearance: "타원형 은회색 몸과 검은 세로 무늬가 특징입니다.", nutrition: "단백질과 비교적 담백한 지방을 포함합니다.", season: "봄·가을 연안 암초대에서 자주 관찰됩니다.", tip: "암초와 방파제 주변을 선호합니다." },
  "낙지": { appearance: "둥근 몸통과 여덟 다리, 강한 흡반이 특징입니다.", nutrition: "저지방 단백질과 타우린을 포함합니다.", season: "수온이 완만한 봄·가을에 활동이 활발합니다.", tip: "펄과 모래 바닥에 굴을 만들어 지냅니다." },
  "민어": { appearance: "길고 납작한 은색 몸과 큰 입을 가집니다.", nutrition: "단백질과 지방산을 포함하는 여름철 어종입니다.", season: "따뜻한 여름철 남서 해역에서 주목됩니다.", tip: "산란을 위해 연안으로 이동하는 회유성이 있습니다." },
  "전어": { appearance: "옆으로 납작한 은색 몸과 톱니 같은 배 비늘이 특징입니다.", nutrition: "단백질·칼슘·불포화지방산을 포함합니다.", season: "가을철 연안 회유로 알려져 있습니다.", tip: "계절에 따라 지방량과 이동 경로가 달라집니다." },
  "참돔": { appearance: "분홍빛 몸과 푸른 반점, 단단한 등지느러미가 특징입니다.", nutrition: "단백질과 비타민 B군을 포함한 흰 살 생선입니다.", season: "봄 산란기와 가을에 연안 활동이 활발합니다.", tip: "암초·자갈 바닥 주변에서 먹이를 찾습니다." },
  "갈치": { appearance: "은빛 리본처럼 긴 몸과 뾰족한 머리가 특징입니다.", nutrition: "단백질과 불포화지방산을 포함합니다.", season: "여름~가을 수온이 높은 시기에 활발합니다.", tip: "야간에 위쪽 수층으로 이동하는 습성이 있습니다." },
  "고등어": { appearance: "등의 푸른 물결무늬와 날씬한 유선형 몸이 특징입니다.", nutrition: "오메가-3 지방산과 단백질이 잘 알려져 있습니다.", season: "봄·가을 군집 회유로 분포가 달라집니다.", tip: "표층에서 무리 지어 빠르게 이동합니다." },
  "자리돔": { appearance: "작은 타원형 몸에 노란빛 또는 푸른빛이 섞입니다.", nutrition: "작은 생선 특유의 단백질과 칼슘을 포함합니다.", season: "따뜻한 제주 연안에서 연중 관찰됩니다.", tip: "암초 주변에서 큰 무리를 이루기도 합니다." },
  "부시리": { appearance: "방어와 비슷한 유선형 몸에 노란 옆줄이 선명합니다.", nutrition: "단백질과 불포화지방산을 포함합니다.", season: "따뜻한 물을 따라 제주·남해에서 회유합니다.", tip: "표층과 중층을 빠르게 오가는 대형 회유어입니다." },
  "옥돔": { appearance: "붉은빛이 감도는 길쭉한 몸과 큰 눈이 특징입니다.", nutrition: "담백한 단백질과 무기질을 포함합니다.", season: "제주 주변의 비교적 깊은 바다에서 관찰됩니다.", tip: "바닥 가까이에서 작은 무척추동물을 먹습니다." },
  "다금바리": { appearance: "두툼한 몸과 얼룩무늬, 큰 입이 특징입니다.", nutrition: "단백질 중심의 흰 살 어종으로 알려져 있습니다.", season: "수온이 높은 제주·남해 암초대에서 활동합니다.", tip: "바위 틈과 암초 주변에 머무는 경향이 있습니다." },
};

const observations = [
  { name: "서해 북부", lat: 36.9, lng: 125.4, zone: "west", offset: -1.2, depth: "30m", quality: "보통" },
  { name: "태안 앞바다", lat: 36.35, lng: 126.15, zone: "west", offset: .3, depth: "45m", quality: "보통" },
  { name: "서해 남부", lat: 35.35, lng: 126.0, zone: "southwest", offset: -.5, depth: "55m", quality: "좋음" },
  { name: "다도해", lat: 34.55, lng: 127.0, zone: "southwest", offset: .2, depth: "35m", quality: "좋음" },
  { name: "남해 중앙", lat: 34.7, lng: 128.15, zone: "southeast", offset: -.3, depth: "80m", quality: "좋음" },
  { name: "부산 앞바다", lat: 35.0, lng: 129.3, zone: "southeast", offset: .4, depth: "110m", quality: "좋음" },
  { name: "동해 남부", lat: 36.0, lng: 129.8, zone: "east", offset: 1.0, depth: "120m", quality: "매우 좋음" },
  { name: "동해 중부", lat: 37.2, lng: 129.55, zone: "east", offset: -.4, depth: "180m", quality: "매우 좋음" },
  { name: "제주 북부", lat: 33.7, lng: 126.4, zone: "jeju", offset: -.5, depth: "90m", quality: "매우 좋음" },
  { name: "제주 남부", lat: 32.85, lng: 126.65, zone: "jeju", offset: .5, depth: "240m", quality: "매우 좋음" },
];

const fishClusters = [
  { lat: 36.25, lng: 125.35, fish: "꽃게", icon: "🦀", level: "매우 많음", size: 18 },
  { lat: 35.15, lng: 125.35, fish: "조기", icon: "🐟", level: "많음", size: 14 },
  { lat: 33.72, lng: 127.45, fish: "감성돔", icon: "🐠", level: "많음", size: 14 },
  { lat: 33.72, lng: 128.55, fish: "참돔", icon: "🐠", level: "매우 많음", size: 18 },
  { lat: 34.55, lng: 130.10, fish: "갈치", icon: "🐟", level: "많음", size: 14 },
  { lat: 36.45, lng: 130.15, fish: "오징어", icon: "🦑", level: "많음", size: 14 },
  { lat: 37.45, lng: 130.15, fish: "도루묵", icon: "🐟", level: "보통", size: 10 },
  { lat: 33.05, lng: 127.18, fish: "자리돔", icon: "🐟", level: "매우 많음", size: 18 },
  { lat: 32.95, lng: 126.35, fish: "부시리", icon: "🐠", level: "많음", size: 14 },
];

const fishSpawns = [
  [36.55, 125.25, "꽃게", "🦀"], [36.15, 125.25, "주꾸미", "🐙"], [35.86, 125.25, "넙치", "🐟"], [35.45, 125.25, "참조기", "🐠"],
  [34.95, 125.25, "농어", "🐟"], [34.62, 125.55, "낙지", "🐙"], [33.78, 126.72, "감성돔", "🐠"], [33.70, 127.15, "전어", "🐟"],
  [33.68, 127.55, "볼락", "🐟"], [33.65, 128.00, "참돔", "🐠"], [33.68, 128.45, "고등어", "🐟"], [33.72, 128.95, "갈치", "🐟"],
  [34.75, 130.10, "전갱이", "🐠"], [35.35, 130.10, "오징어", "🦑"], [36.00, 130.15, "가자미", "🐟"], [36.65, 130.15, "대구", "🐠"],
  [37.05, 130.15, "도루묵", "🐟"], [37.50, 130.15, "임연수어", "🐠"], [33.65, 125.85, "자리돔", "🐟"], [33.18, 126.10, "옥돔", "🐟"],
  [33.05, 127.18, "다금바리", "🐠"], [32.75, 126.38, "부시리", "🐠"], [32.68, 127.12, "갈치", "🐟"],
] as const;

const seasonalFishProfiles = {
  봄: { clusterIndexes: [0, 1, 2, 5, 6], spawnIndexes: [0, 2, 4, 6, 7, 8, 9, 12, 14, 16, 18, 20], latShift: .08, lngShift: -.08, density: "이동 시작 · 보통" },
  여름: { clusterIndexes: [0, 1, 2, 3, 4, 5, 7, 8], spawnIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], latShift: .04, lngShift: .12, density: "활발한 출현 · 많음" },
  가을: { clusterIndexes: [0, 1, 2, 3, 4, 5, 6], spawnIndexes: [0, 1, 3, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21], latShift: -.10, lngShift: .06, density: "남하 회유 · 많음" },
  겨울: { clusterIndexes: [0, 1, 5, 6, 8], spawnIndexes: [0, 2, 4, 12, 14, 15, 16, 17, 21], latShift: .16, lngShift: .16, density: "냉수성 어종 중심 · 적음" },
} as const;

const hazards = [
  { lat: 34.7, lng: 129.55, icon: "🦈", name: "상어 주의", note: "외해 회유성 출현 예시" },
  { lat: 33.15, lng: 126.85, icon: "🪼", name: "해파리 주의", note: "고수온기 연안 출현 예시" },
  { lat: 36.75, lng: 126.0, icon: "🪼", name: "해파리 주의", note: "연안 조류 영향 예시" },
];

const geographicLabels = [
  { lat: 37.45, lng: 127.05, text: "경기도", type: "land" }, { lat: 37.75, lng: 128.35, text: "강원도", type: "land" },
  { lat: 36.35, lng: 127.55, text: "충청도", type: "land" }, { lat: 35.55, lng: 128.15, text: "경상도", type: "land" },
  { lat: 35.25, lng: 126.75, text: "전라도", type: "land" }, { lat: 33.42, lng: 126.53, text: "제주도", type: "land" },
  { lat: 36.25, lng: 125.15, text: "황해", type: "sea" }, { lat: 36.85, lng: 130.35, text: "동해", type: "sea" }, { lat: 33.95, lng: 128.2, text: "남해", type: "sea" },
];

const isotherms: Record<string, Array<{ temp: string; color: string; path: Array<[number, number]> }>> = {
  봄: [{ temp: "10°C", color: "#3982d4", path: [[37.9, 125.0], [37.4, 126.5], [37.1, 128.1], [37.4, 130.2]] }, { temp: "13°C", color: "#38bad0", path: [[36.8, 124.8], [36.1, 126.8], [35.8, 128.4], [36.2, 130.4]] }, { temp: "16°C", color: "#e8ad41", path: [[34.6, 125.2], [34.0, 126.6], [34.0, 128.3], [34.5, 130.1]] }],
  여름: [{ temp: "21°C", color: "#3982d4", path: [[38.2, 125.0], [37.7, 126.8], [37.3, 128.6], [37.7, 130.3]] }, { temp: "23°C", color: "#38bad0", path: [[37.2, 124.8], [36.5, 126.7], [36.2, 128.5], [36.7, 130.4]] }, { temp: "25°C", color: "#ef775a", path: [[35.7, 125.0], [35.0, 126.7], [34.8, 128.4], [35.3, 130.1]] }],
  가을: [{ temp: "16°C", color: "#3982d4", path: [[38.0, 125.0], [37.4, 126.6], [37.1, 128.4], [37.6, 130.3]] }, { temp: "19°C", color: "#38bad0", path: [[36.8, 124.8], [36.1, 126.6], [35.8, 128.5], [36.3, 130.4]] }, { temp: "22°C", color: "#ef775a", path: [[34.9, 125.1], [34.2, 126.7], [34.0, 128.4], [34.5, 130.1]] }],
  겨울: [{ temp: "5°C", color: "#2661b6", path: [[38.2, 125.0], [37.7, 126.8], [37.4, 128.6], [37.8, 130.3]] }, { temp: "8°C", color: "#3982d4", path: [[37.0, 124.9], [36.4, 126.7], [36.1, 128.4], [36.6, 130.4]] }, { temp: "11°C", color: "#38bad0", path: [[34.9, 125.1], [34.2, 126.7], [34.0, 128.5], [34.6, 130.2]] }],
};

export default function Home() {
  const [season, setSeason] = useState<(typeof seasons)[number]>("여름");
  const [dateValue, setDateValue] = useState("2026-08-06");
  const [liveMode, setLiveMode] = useState(false);
  const [active, setActive] = useState(zones[3]);
  const [showAll, setShowAll] = useState(true);
  const [showFish, setShowFish] = useState(true);
  const [showIsotherms, setShowIsotherms] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any>(null);
  const viewedZone = useRef<string | null>(null);
  const activeTemp = active.temps[season];
  const fishProfile = seasonalFishProfiles[season];
  const [year, month, day] = dateValue.split("-").map(Number);
  const dateSignal = (year * 13 + month * 7 + day) % fishProfile.spawnIndexes.length;
  const dailyOffset = (day - 16) * .008;
  const dailyCount = Math.max(Math.min(6, fishProfile.spawnIndexes.length), Math.min(fishProfile.spawnIndexes.length, Math.round(fishProfile.spawnIndexes.length * (.58 + ((day + month) % 7) * .055))));
  const selectedSpawnIndexes = Array.from({ length: dailyCount }, (_, offset) => fishProfile.spawnIndexes[(dateSignal + offset) % fishProfile.spawnIndexes.length]);
  const visibleClusters = fishProfile.clusterIndexes.map((index) => ({ ...fishClusters[index], lat: fishClusters[index].lat + fishProfile.latShift + dailyOffset, lng: fishClusters[index].lng + fishProfile.lngShift + dailyOffset }));
  const visibleSpawns = selectedSpawnIndexes.map((index) => { const [lat, lng, fish, icon] = fishSpawns[index]; return [lat + fishProfile.latShift + dailyOffset, lng + fishProfile.lngShift + dailyOffset, fish, icon] as const; });
  const populationBase = { 봄: 12400, 여름: 31800, 가을: 24100, 겨울: 8700 }[season];
  const populationEstimate = Math.round(populationBase * (.82 + ((day * 3 + month) % 9) * .045) / 100) * 100;
  const guideFor = (fish: Fish) => fishGuides[fish.name] ?? { appearance: "해당 해역의 수온·수심 변화에 맞춰 이동하는 대표 어종입니다.", nutrition: "단백질과 다양한 해양 무기질을 포함합니다.", season: `${season} 수온 변화에 따라 분포가 달라집니다.`, tip: fish.note };
  const tempBand = activeTemp < 12 ? "냉수대" : activeTemp < 19 ? "중온대" : "난수대";
  const seasonRange = useMemo(() => `${Math.min(...zones.map((z) => z.temps[season])).toFixed(1)}–${Math.max(...zones.map((z) => z.temps[season])).toFixed(1)}°C`, [season]);

  const focusZone = (zone: Zone) => { setActive(zone); setDetailsOpen(false); setFocusRequest((value) => value + 1); };
  const resetMap = async () => { if (mapRef.current) mapRef.current.flyTo([36.05, 127.7], 7.15, { duration: 1.25, easeLinearity: .22 }); viewedZone.current = null; };
  const selectDate = (value: string) => { setDateValue(value); setSeason(dateToSeason(value)); setLiveMode(false); };
  const showToday = () => { const value = new Date().toISOString().slice(0, 10); setDateValue(value); setSeason(dateToSeason(value)); setLiveMode(true); };

  useEffect(() => {
    let mounted = true;
    import("leaflet").then((module) => {
      if (!mounted || !mapElement.current || mapRef.current) return;
      const L = module.default;
      const map = L.map(mapElement.current, { zoomControl: false, scrollWheelZoom: true, minZoom: 7, maxZoom: 13, zoomSnap: .25, zoomAnimation: true, fadeAnimation: true, markerZoomAnimation: true, inertia: true, inertiaDeceleration: 2400, maxBounds: [[32.2, 124.4], [39.7, 131.0]], maxBoundsViscosity: .92, attributionControl: true }).setView([36.05, 127.7], 7.15);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", { maxZoom: 20, subdomains: "abcd", attribution: "© OpenStreetMap © CARTO" }).addTo(map);
      mapRef.current = map;
      layersRef.current = L.layerGroup().addTo(map);
      setMapReady(true);
    });
    return () => { mounted = false; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !layersRef.current) return;
    import("leaflet").then((module) => {
      const L = module.default;
      layersRef.current.clearLayers();
      geographicLabels.forEach((label) => {
        L.marker([label.lat, label.lng], { interactive: false, icon: L.divIcon({ className: "", iconSize: [90, 30], iconAnchor: [45, 15], html: `<div class="geo-label ${label.type}">${label.text}</div>` }) }).addTo(layersRef.current);
      });
      if (showIsotherms) {
        isotherms[season].forEach((line) => {
          [-.48, -.24, 0, .24, .48].forEach((shift, index) => {
            const contour = line.path.map(([lat, lng]) => [lat + shift, lng + shift * .12]);
            L.polyline(contour, { color: line.color, weight: index === 2 ? 2.7 : 1.35, opacity: index === 2 ? .9 : .58, dashArray: index === 2 ? "" : "5 5" }).addTo(layersRef.current);
          });
          L.marker(line.path[1], { interactive: false, icon: L.divIcon({ className: "", iconSize: [42, 24], iconAnchor: [21, 12], html: `<div class="isotherm-label" style="--iso:${line.color}">${line.temp}</div>` }) }).addTo(layersRef.current);
        });
      }
      if (showFish) {
        visibleClusters.forEach((cluster) => {
          L.marker([cluster.lat, cluster.lng], { icon: L.divIcon({ className: "", iconSize: [42, 42], iconAnchor: [21, 21], html: `<div class="fish-cluster" style="--fish-size:${cluster.size}px"><span>${cluster.icon}</span><b>${cluster.level}</b></div>` }) }).bindTooltip(`${cluster.fish} · ${cluster.level}`, { direction: "top", offset: [0, -20] }).bindPopup(`<b>${cluster.icon} ${cluster.fish}</b><br/>${season} 분포: ${fishProfile.density}<br/>위도: ${cluster.lat.toFixed(4)}<br/>경도: ${cluster.lng.toFixed(4)}`).addTo(layersRef.current);
        });
        visibleSpawns.forEach(([lat, lng, fish, icon]) => {
          L.marker([lat, lng], { icon: L.divIcon({ className: "", iconSize: [28, 28], iconAnchor: [14, 14], html: `<div class="fish-point">${icon}</div>` }) }).bindPopup(`<b>${icon} ${fish}</b><br/>${season} 개별 분포 지점<br/>출현 밀도: ${fishProfile.density}<br/>위도: ${lat.toFixed(4)}<br/>경도: ${lng.toFixed(4)}`).addTo(layersRef.current);
        });
      }
      if (showHazards) {
        hazards.forEach((hazard) => {
          const symbol = hazard.name.includes("해파리") ? `<span class="jelly-icon"><i></i><i></i><i></i></span>` : `<span>${hazard.icon}</span>`;
          L.marker([hazard.lat, hazard.lng], { icon: L.divIcon({ className: "", iconSize: [46, 46], iconAnchor: [23, 23], html: `<div class="hazard-marker">${symbol}<b>주의</b></div>` }) }).bindTooltip(`${hazard.name} · ${hazard.note}`, { direction: "top", offset: [0, -22] }).bindPopup(`<b>⚠ ${hazard.name}</b><br/>${hazard.note}<br/>위도: ${hazard.lat.toFixed(4)}<br/>경도: ${hazard.lng.toFixed(4)}`).addTo(layersRef.current);
        });
      }
      if (!showAll) return;
      zones.forEach((zone) => {
        const selected = zone.id === active.id;
        const marker = L.marker([zone.lat, zone.lng], { icon: L.divIcon({ className: "", iconSize: [52, 52], iconAnchor: [26, 48], html: `<div class="marine-marker ${selected ? "selected" : ""}" style="--marker:${zone.color}"><strong>${zone.temps[season].toFixed(1)}°</strong><span>${zone.name}</span></div>` }) });
        marker.on("click", () => focusZone(zone));
        marker.addTo(layersRef.current);
      });
      observations.forEach((point) => {
        const zone = zones.find((item) => item.id === point.zone)!;
        const temperature = (zone.temps[season] + point.offset).toFixed(1);
        L.marker([point.lat, point.lng], { interactive: false, icon: L.divIcon({ className: "", iconSize: [86, 52], iconAnchor: [43, 26], html: `<div class="sea-reading"><strong>${temperature}°C</strong><span>수질 ${point.quality} · ${point.depth}</span></div>` }) }).addTo(layersRef.current);
      });
      if (focusRequest > 0 && viewedZone.current !== `${active.id}-${focusRequest}`) { mapRef.current.flyTo([active.lat, active.lng], active.zoom, { duration: 1.2, easeLinearity: .22 }); viewedZone.current = `${active.id}-${focusRequest}`; }
    });
  }, [active, season, dateValue, showAll, showFish, showIsotherms, showHazards, mapReady, focusRequest]);

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">●</span><span>바다온 <b>FISH MAP</b></span></div><div className="date-control" aria-label="관측 날짜 선택"><label>기록일 <input type="date" value={dateValue} max="2026-08-06" onChange={(event) => selectDate(event.target.value)}/></label><button className={liveMode ? "active" : ""} onClick={showToday}>오늘 상태 보기</button></div><div className="status"><i /> {liveMode ? "오늘 기록 예시" : "과거 기록 예시"}</div></header>
    <section className="headline"><div><p className="eyebrow">한반도 영해 · {dateValue} · {season} 수온 기록</p><h1>수온 데이터로 찾는 물고기의 위치</h1></div><p className="intro">해역을 고르면 해당 해안으로 자동 확대됩니다.<br/>특정 위치의 어종·위험생물·등온선을 함께 확인하세요.</p></section>
    <section className="workspace">
      <aside className="panel legend-panel"><p className="panel-kicker">SEA OBSERVATION</p><h2>{season} 바다 관측</h2><div className="big-range">{seasonRange}</div><div className="scale"><span>차가움</span><div className="gradient"/><span>따뜻함</span></div><div className="legend"><span><b className="dot cold"/> 12°C 미만 냉수대</span><span><b className="dot mid"/> 12–18.9°C 중온대</span><span><b className="dot warm"/> 19°C 이상 난수대</span></div><div className="reading-key"><b>바다 라벨 읽는 법</b><span><i>20.4°C</i> 수온</span><span><i>수질 좋음</i> 수질 · 대표수심</span></div><hr/><button className="all-toggle" onClick={() => setShowAll(!showAll)}><span className={showAll ? "check on" : "check"}>✓</span> 모든 해역 마커 표시</button><button className="reset-button" onClick={resetMap}>대한민국 전체 보기</button><div className="zone-jumps"><p>해역 바로가기</p>{zones.map((zone) => <button key={zone.id} onClick={() => focusZone(zone)} className={active.id === zone.id ? "chosen" : ""}><i style={{ background: zone.color }}/>{zone.name}</button>)}</div><p className="fine">수온·수질·수심은 교육·탐색용 일반 범위입니다. 실제 관측은 날짜·위치·수심에 따라 달라질 수 있습니다.</p></aside>
      <div className="map-card"><div className="map-toolbar"><span>한반도 해역 지도 · 스크롤/핀치로 확대</span><div className="map-switches"><button className={showFish ? "on" : ""} onClick={() => setShowFish(!showFish)}>🐟 어종</button><button className={showIsotherms ? "on" : ""} onClick={() => setShowIsotherms(!showIsotherms)}>≋ 등온선</button><button className={showHazards ? "danger-on" : ""} onClick={() => setShowHazards(!showHazards)}>⚠ 위험생물</button><button onClick={resetMap}>전체 지도</button></div></div><div className="date-summary"><b>{dateValue} · {season}</b><span>관측 지점 <strong>{visibleSpawns.length}개</strong></span><span>추정 개체수 <strong>{populationEstimate.toLocaleString()}마리</strong></span></div><div className="map-viewport"><div ref={mapElement} className="online-map" aria-label="한반도 해역 상세 지도"/></div><p className="map-hint">{season} 어종 관측 {visibleSpawns.length}개 지점 · {fishProfile.density}. 날짜를 바꾸면 지점·좌표·추정 개체수가 함께 바뀝니다.</p><section className="species-guide"><div className="guide-title"><div><p className="panel-kicker">SPECIES FIELD GUIDE</p><h2>{active.name} 대표 어종 알아보기</h2></div><span>선택 해역 · {active.fish.length}종</span></div><div className="guide-grid">{active.fish.slice(0, 4).map((fish) => { const guide = guideFor(fish); return <article className="guide-card" key={fish.name}><div className="guide-name"><span>{fish.icon}</span><div><h3>{fish.name}</h3><p>수심 {fish.depth} · 적정 {fish.temp}</p></div></div><dl><div><dt>생김새</dt><dd>{guide.appearance}</dd></div><div><dt>영양</dt><dd>{guide.nutrition}</dd></div><div><dt>제철·분포</dt><dd>{guide.season}</dd></div><div><dt>관찰 포인트</dt><dd>{guide.tip}</dd></div></dl></article>; })}</div><p className="guide-note">영양·생태 정보는 학습용 일반 설명이며, 실제 성분과 출현은 크기·계절·해역에 따라 달라질 수 있습니다.</p></section></div>
      <aside className="panel detail-panel" style={{ "--accent": active.color } as React.CSSProperties}><p className="panel-kicker">SELECTED AREA</p><div className="title-row"><div><h2>{active.name}</h2><p>{active.short}</p></div><span className="temperature">{activeTemp.toFixed(1)}°C</span></div><div className="water-band"><span style={{ background: active.color }}/><div><b>{season} · {tempBand}</b><p>{active.note}</p></div></div><div className="sea-stats"><div><span>수질</span><b>{active.quality}</b><small>{active.qualityNote}</small></div><div><span>대표 수심</span><b>{active.depth}</b><small>관측·서식 참고</small></div></div><h3>대표 분포 어종 <small>{active.fish.length}종</small></h3><div className="fish-list">{active.fish.slice(0, 5).map((fish) => <div key={fish.name} className="fish"><span>{fish.icon}</span><div><b>{fish.name}</b><p>수심 {fish.depth} · {fish.temp}</p></div><small>{fish.note}</small></div>)}</div><button className="detail-button" onClick={() => setDetailsOpen(true)}>해역 정보 자세히 보기 <span>→</span></button></aside>
    </section>
    <footer><span>DATA VIEW · EDUCATIONAL DEMO</span><span>OpenStreetMap 기반 상세 해안 지도</span><span>© 2026 BADAON</span></footer>
    {detailsOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${active.name} 상세 어종 정보`} onClick={() => setDetailsOpen(false)}><section className="detail-modal" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setDetailsOpen(false)} aria-label="닫기">×</button><p className="panel-kicker">{active.short.toUpperCase()} · {season}</p><h2>{active.name} 어종 분포 상세</h2><p className="modal-summary">현재 선택 수온은 <b>{activeTemp.toFixed(1)}°C</b>, 수질은 <b>{active.quality}</b>, 대표 수심은 <b>{active.depth}</b>입니다. 아래 수심·수온은 해당 어종의 일반적인 국내 해역 서식 범위입니다.</p><div className="fish-table"><div className="table-head"><span>어종</span><span>대표 수심</span><span>적정 수온</span><span>분포 특징</span></div>{active.fish.map((fish) => <div className="table-row" key={fish.name}><span>{fish.icon} <b>{fish.name}</b></span><span>{fish.depth}</span><span>{fish.temp}</span><span>{fish.note}</span></div>)}</div></section></div>}
  </main>;
}
