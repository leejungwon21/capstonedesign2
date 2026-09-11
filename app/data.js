const INVESTOR_TYPES = ["금융투자", "보험", "투신", "사모", "은행", "연기금", "외국인", "개인"];
const INSTITUTIONAL = ["금융투자", "보험", "투신", "사모", "은행", "연기금"];
const COLORS = { 금융투자: "#6366f1", 투신: "#059669", 사모: "#d97706", 외국인: "#94a3b8", 개인: "#cbd5e1", 보험: "#8b5cf6", 은행: "#0ea5e9", 연기금: "#f43f5e" };

const STOCKS = {
  "삼성전자": { ticker: "005930", sector: "반도체", market: "KOSPI", basePrice: 58200 },
  "SK하이닉스": { ticker: "000660", sector: "반도체", market: "KOSPI", basePrice: 178000 },
  "카카오": { ticker: "035720", sector: "인터넷", market: "KOSPI", basePrice: 42300 },
  "NAVER": { ticker: "035420", sector: "인터넷", market: "KOSPI", basePrice: 186500 },
  "셀트리온": { ticker: "068270", sector: "바이오", market: "KOSPI", basePrice: 168000 },
};

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function generateData(stockName) {
  const info = STOCKS[stockName];
  const rand = seededRandom(info.ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const days = 20;
  const data = [];
  let price = info.basePrice;
  for (let i = 0; i < days; i++) {
    const date = `D-${19 - i}`;
    const isAnomaly = stockName !== "NAVER" && i >= days - 3;
    const row = { date, isAnomaly };
    if (isAnomaly) { price -= info.basePrice * (0.01 + rand() * 0.02); }
    else { price += (rand() - 0.5) * info.basePrice * 0.015; }
    row.price = Math.round(price);
    INVESTOR_TYPES.forEach(inv => {
      let val = (rand() - 0.5) * 200;
      if (isAnomaly) {
        if ((stockName === "카카오" ? ["금융투자"] : ["금융투자", "투신", "사모"]).includes(inv)) val = 300 + rand() * 900;
        if (inv === "개인") val = -(500 + rand() * 800);
        if (inv === "외국인") val = -(100 + rand() * 400);
      }
      row[inv] = Math.round(val);
    });
    data.push(row);
  }
  return data;
}

function analyzeData(data) {
  const recent = data.slice(-3);
  const history = data.slice(0, -3);
  const results = {};
  const abnormal = [];
  INSTITUTIONAL.forEach(inv => {
    const histValues = history.map(d => d[inv]);
    const mean = histValues.reduce((a, b) => a + b, 0) / histValues.length;
    const std = Math.sqrt(histValues.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / histValues.length) || 1;
    const latestVal = recent[recent.length - 1][inv];
    const zscore = (latestVal - mean) / std;
    results[`${inv}_zscore`] = zscore;
    results[`${inv}_val`] = latestVal;
    if (zscore > 2) abnormal.push({ type: inv, zscore: zscore.toFixed(1), amount: latestVal });
  });
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const returnPct = ((latest.price - prev.price) / prev.price * 100).toFixed(2);
  const instTotal = INSTITUTIONAL.reduce((sum, inv) => sum + latest[inv], 0);
  const patternA = abnormal.length >= 2;
  const patternB = instTotal > 500 && parseFloat(returnPct) < -1;
  let grade, emoji, color, bgColor, borderColor;
  if (patternA && patternB) { grade = "위험"; emoji = "🔴"; color = "#dc2626"; bgColor = "#fef2f2"; borderColor = "#fecdd3"; }
  else if (patternA || patternB) { grade = "주의"; emoji = "🟡"; color = "#d97706"; bgColor = "#fffbeb"; borderColor = "#fde68a"; }
  else { grade = "정상"; emoji = "🟢"; color = "#16a34a"; bgColor = "#f0fdf4"; borderColor = "#bbf7d0"; }
  const score = Math.min(100, Math.round(abnormal.length * 20 + (patternB ? 30 : 0) + abnormal.length * 5));
  let headline = "";
  if (abnormal.length > 0) {
    headline = `${abnormal.map(a => a.type).join("·")} ${abnormal.length}개 주체 동시 순매수 유입.`;
    if (patternB) headline += ` 기관 +${instTotal.toLocaleString()}억 매수 대비 주가 ${returnPct}% 역주행.`;
  } else { headline = "현재 이상 수급 패턴이 감지되지 않았습니다."; }
  const cum5 = {};
  INVESTOR_TYPES.forEach(inv => { cum5[inv] = data.slice(-5).reduce((s, d) => s + d[inv], 0); });
  return { grade, emoji, color, bgColor, borderColor, score, headline, patternA, patternB, abnormal, returnPct, instTotal, latest, cum5, results };
}


export { INVESTOR_TYPES, INSTITUTIONAL, COLORS, STOCKS, generateData, analyzeData };
