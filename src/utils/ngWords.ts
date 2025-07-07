// NGワード（禁止ワード）のリスト
export const ngWords = [
  // 暴力・攻撃的な言葉
  '殺す', '死ね', '殺害', '暴力', '暴行', '襲撃', '攻撃',
  
  // 差別・ヘイト関連
  '差別', 'ヘイト', '偏見', '排除', '迫害',
  
  // 性的・不適切な内容
  'セックス', 'エロ', 'アダルト', '性的', '猥褻', 'わいせつ', 'ちんこ', 'チンコ',
  'まんこ', 'マンコ',
  
  // 薬物・違法行為
  '薬物', '麻薬', '覚醒剤', '大麻', '違法', '犯罪', '詐欺',
  
  // 自傷・自殺関連
  '自殺', '自傷', 'リストカット', '首吊り',
  
  // 政治・宗教的な過激な内容
  'テロ', '過激派', '革命', '破壊活動',
  
  // その他不適切な内容
  '誹謗中傷', '中傷', '悪口', 'いじめ', 'イジメ',
  'うざい', 'ムカつく', 'きもい', 'キモい', 'ブス', 'ブサイク',
  
  // 英語のNGワード
  'kill', 'murder', 'violence', 'hate', 'sex', 'porn', 'drug', 'suicide',
  'terrorist', 'bomb', 'weapon', 'gun', 'knife'
];

// タイトルにNGワードが含まれているかチェック
export const containsNgWord = (text: string): { hasNgWord: boolean; foundWord?: string } => {
  const normalizedText = text.toLowerCase().replace(/\s+/g, '');
  
  for (const ngWord of ngWords) {
    const normalizedNgWord = ngWord.toLowerCase().replace(/\s+/g, '');
    if (normalizedText.includes(normalizedNgWord)) {
      return { hasNgWord: true, foundWord: ngWord };
    }
  }
  
  return { hasNgWord: false };
};

// NGワードを伏字に変換する関数
export const maskNgWord = (text: string): string => {
  let maskedText = text;
  
  for (const ngWord of ngWords) {
    const regex = new RegExp(ngWord, 'gi');
    const mask = '*'.repeat(ngWord.length);
    maskedText = maskedText.replace(regex, mask);
  }
  
  return maskedText;
};